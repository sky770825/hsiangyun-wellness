// ============================================
// 錯誤監控和告警系統
// ============================================
// 整合 Sentry + n8n webhook + LINE 通知
// 使用方式：
// 1. npm install @sentry/browser @sentry/react
// 2. 在 main.tsx 引入此檔案
// 3. 設定環境變數
// ============================================

import * as Sentry from '@sentry/react';

// ============================================
// 1. Sentry 初始化設定
// ============================================
export function initErrorMonitoring() {
  // 只在 production 啟用
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      
      // 設定環境
      environment: import.meta.env.MODE,
      
      // 發布版本（用於追蹤特定版本的錯誤）
      release: import.meta.env.VITE_APP_VERSION || 'unknown',
      
      // 錯誤採樣率（1.0 = 100%）
      tracesSampleRate: 1.0,
      
      // 效能監控
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Session Replay 採樣率
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // 過濾不重要的錯誤
      beforeSend(event, hint) {
        // 過濾掉開發用的錯誤
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
          return null;
        }
        
        // 過濾掉 Chrome extension 造成的錯誤
        if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
          frame => frame.filename?.includes('chrome-extension://')
        )) {
          return null;
        }
        
        return event;
      },
    });
    
    console.log('✅ Sentry 錯誤監控已啟用');
  } else {
    console.log('⚠️  開發模式，Sentry 未啟用');
  }
}

// ============================================
// 2. Supabase 錯誤監控
// ============================================
export function setupSupabaseErrorMonitoring(supabase: any) {
  // 監聽所有 Supabase 錯誤
  supabase.auth.onAuthStateChange((event: string, session: any) => {
    if (event === 'SIGNED_OUT') {
      Sentry.setUser(null);
    } else if (event === 'SIGNED_IN' && session?.user) {
      // 設定使用者資訊到 Sentry
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
      });
    }
  });
  
  // 攔截 Supabase API 錯誤
  const originalFrom = supabase.from.bind(supabase);
  supabase.from = function(table: string) {
    const builder = originalFrom(table);
    
    // 包裝所有查詢方法
    const methods = ['select', 'insert', 'update', 'delete', 'upsert'];
    methods.forEach(method => {
      const original = builder[method].bind(builder);
      builder[method] = async function(...args: any[]) {
        const result = await original(...args);
        
        // 如果有錯誤，送到 Sentry + n8n
        if (result.error) {
          const errorData = {
            table,
            method,
            error: result.error,
            timestamp: new Date().toISOString(),
          };
          
          // 送到 Sentry
          Sentry.captureException(result.error, {
            tags: {
              type: 'supabase_error',
              table,
              method,
            },
            extra: errorData,
          });
          
          // 送到 n8n webhook（非同步，不阻塞）
          sendToN8nWebhook({
            type: 'supabase_error',
            severity: 'error',
            ...errorData,
          }).catch(console.error);
        }
        
        return result;
      };
    });
    
    return builder;
  };
}

// ============================================
// 3. Edge Function 錯誤監控
// ============================================
export async function monitoredEdgeFunction(
  functionName: string,
  payload: any
) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Edge function failed');
    }
    
    return await response.json();
    
  } catch (error) {
    // 送到 Sentry
    Sentry.captureException(error, {
      tags: {
        type: 'edge_function_error',
        function: functionName,
      },
      extra: { payload },
    });
    
    // 送到 n8n
    await sendToN8nWebhook({
      type: 'edge_function_error',
      severity: 'error',
      function: functionName,
      error: error instanceof Error ? error.message : String(error),
      payload,
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
}

// ============================================
// 4. n8n Webhook 整合
// ============================================
async function sendToN8nWebhook(data: any) {
  const webhookUrl = import.meta.env.VITE_N8N_ERROR_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️  N8N_ERROR_WEBHOOK_URL 未設定');
    return;
  }
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        project: import.meta.env.VITE_PROJECT_NAME || 'unknown',
        environment: import.meta.env.MODE,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Failed to send to n8n webhook:', error);
  }
}

// ============================================
// 5. 前端 Crash 監控
// ============================================
export function setupGlobalErrorHandler() {
  // 攔截未處理的 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    Sentry.captureException(event.reason, {
      tags: { type: 'unhandled_rejection' },
    });
    
    sendToN8nWebhook({
      type: 'unhandled_rejection',
      severity: 'error',
      error: event.reason,
      timestamp: new Date().toISOString(),
    });
  });
  
  // 攔截全域錯誤
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    Sentry.captureException(event.error, {
      tags: { type: 'global_error' },
    });
    
    sendToN8nWebhook({
      type: 'global_error',
      severity: 'error',
      error: event.error,
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString(),
    });
  });
}

// ============================================
// 6. 客製化錯誤回報
// ============================================
export function reportError(
  message: string,
  context?: Record<string, any>,
  severity: 'info' | 'warning' | 'error' | 'fatal' = 'error'
) {
  // 送到 Sentry
  Sentry.captureMessage(message, {
    level: severity as any,
    tags: { type: 'custom_error' },
    extra: context,
  });
  
  // 送到 n8n
  sendToN8nWebhook({
    type: 'custom_error',
    severity,
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

// ============================================
// 7. 使用範例
// ============================================

/*
// main.tsx
import { initErrorMonitoring, setupGlobalErrorHandler } from './lib/errorMonitoring';

initErrorMonitoring();
setupGlobalErrorHandler();

// supabase.ts
import { setupSupabaseErrorMonitoring } from './lib/errorMonitoring';
const supabase = createClient(...);
setupSupabaseErrorMonitoring(supabase);

// 在元件中使用
import { reportError, monitoredEdgeFunction } from './lib/errorMonitoring';

try {
  await supabase.from('users').select();
} catch (error) {
  reportError('Failed to fetch users', { error });
}

// 呼叫 Edge Function
const result = await monitoredEdgeFunction('process-payment', { amount: 100 });
*/

/**
 * 預約服務與後台 store 讀寫測試
 * 使用 in-memory localStorage 模擬，驗證送出後資料格式與寫入
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createBooking } from '@/services/booking';
import * as store from '@/admin/store';

const STORAGE_KEY = 'admin_bookings';

describe('預約服務 createBooking', () => {
  const fakeStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => fakeStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        fakeStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete fakeStorage[key];
      },
      clear: () => {
        Object.keys(fakeStorage).forEach((k) => delete fakeStorage[k]);
      },
      length: 0,
      key: () => null,
    });
    fakeStorage[STORAGE_KEY] = '[]';
  });

  it('送出預約後回傳的資料應包含 id、status、createdAt、updatedAt', async () => {
    const result = await createBooking({
      name: '測試使用者',
      email: 'test@example.com',
      message: '想預約陪跑',
    });

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('string');
    expect(result.status).toBe('pending');
    expect(result.name).toBe('測試使用者');
    expect(result.email).toBe('test@example.com');
    expect(result.message).toBe('想預約陪跑');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
    expect(new Date(result.createdAt).getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it('送出預約後 store 中應能讀到該筆預約', async () => {
    await createBooking({ name: '小美', email: 'mei@test.com' });
    const list = store.loadBookings();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('小美');
    expect(list[0].email).toBe('mei@test.com');
    expect(list[0].status).toBe('pending');
  });

  it('可選 message 不傳時應為 undefined', async () => {
    const result = await createBooking({ name: '阿明', email: 'ming@test.com' });
    expect(result.message).toBeUndefined();
    const list = store.loadBookings();
    expect(list[0].message).toBeUndefined();
  });
});

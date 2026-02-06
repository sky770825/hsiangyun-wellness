/**
 * 假瘦語言類型測驗：題目與結果類型
 * 依答案分類出類型，結果頁可引導至預約或資源
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

/** 每題選項 value 對應到類型權重 key */
export type QuizTypeKey = 'control' | 'perfection' | 'comparison' | 'avoid';

export interface QuizResultType {
  key: QuizTypeKey;
  title: string;
  description: string;
  suggestion: string;
  cta: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: '當你發現體重數字上升時，你通常第一個念頭是？',
    options: [
      { value: 'control', label: '我要立刻控制飲食、加強運動' },
      { value: 'perfection', label: '我又搞砸了，我總是做不到' },
      { value: 'comparison', label: '別人都可以，為什麼我不行' },
      { value: 'avoid', label: '不想面對，先不要量' },
    ],
  },
  {
    id: 'q2',
    question: '面對想吃卻「不該吃」的食物時，你常會？',
    options: [
      { value: 'control', label: '嚴格禁止，訂規則今天不能吃' },
      { value: 'perfection', label: '吃一口就覺得前功盡棄，乾脆吃到底' },
      { value: 'comparison', label: '看別人吃沒事，我吃就罪惡' },
      { value: 'avoid', label: '轉移注意力，不去想就不會吃' },
    ],
  },
  {
    id: 'q3',
    question: '運動或飲食計畫中斷時，你心裡最常出現的聲音是？',
    options: [
      { value: 'control', label: '明天要加倍補回來' },
      { value: 'perfection', label: '我果然沒辦法堅持，算了' },
      { value: 'comparison', label: '別人都能持續，只有我半途而廢' },
      { value: 'avoid', label: '不想提這件事，當沒發生過' },
    ],
  },
  {
    id: 'q4',
    question: '別人稱讚你「變瘦了」「氣色好」時，你的反應比較接近？',
    options: [
      { value: 'control', label: '要維持住，不能鬆懈' },
      { value: 'perfection', label: '他們只是客氣，我還沒達到標準' },
      { value: 'comparison', label: '跟某某比還差得遠' },
      { value: 'avoid', label: '不太習慣被注意身體，想轉移話題' },
    ],
  },
  {
    id: 'q5',
    question: '你認為「瘦下來」對你來說最主要代表什麼？',
    options: [
      { value: 'control', label: '能掌控自己的身體與生活' },
      { value: 'perfection', label: '終於能符合自己或他人的期待' },
      { value: 'comparison', label: '不會再輸給別人、不會被比下去' },
      { value: 'avoid', label: '可以不用再面對失敗或批評' },
    ],
  },
];

const RESULT_TYPES: QuizResultType[] = [
  {
    key: 'control',
    title: '控制型假瘦語言',
    description: '你常透過「規則、計畫、加倍補償」來管理身體與飲食，背後是對失控的焦慮。身體不是敵人，不需要被鎮壓。',
    suggestion: '試著區分：哪些是真正的身體需求，哪些是頭腦的「必須」。允許自己偶爾不照計畫，觀察會發生什麼。',
    cta: '預約一次陪跑，我們一起鬆動「一定要控制」的設定。',
  },
  {
    key: 'perfection',
    title: '完美型假瘦語言',
    description: '你對自己很嚴苛，一點偏離就全盤否定。「要嘛完美要嘛放棄」的語言，常常讓身體更緊繃、更難改變。',
    suggestion: '練習把「搞砸」改成「今天跟計畫不一樣」。每一個小步都算數，不需要一次到位。',
    cta: '來聊聊那些「不夠好」的念頭從哪裡來，我們不追求完美，只追求更貼近自己。',
  },
  {
    key: 'comparison',
    title: '比較型假瘦語言',
    description: '你常拿自己跟別人比，或跟理想的自己比，比輸了就很挫敗。身體不是競技場，你的旅程是獨一無二的。',
    suggestion: '減少追蹤「別人怎麼做」，多問自己：此刻我的身體需要什麼？什麼節奏對我來說是舒服的？',
    cta: '預約陪跑，把眼光從別人身上收回來，專心聽自己的身體說話。',
  },
  {
    key: 'avoid',
    title: '迴避型假瘦語言',
    description: '你習慣不面對數字、不談身體、不談失敗。迴避可以暫時不痛，但身體的訊號不會消失，只是被壓下去。',
    suggestion: '試著在安全的情境下，輕輕碰觸一下「不想面對」的感覺。不需要一次解決，只要願意看一眼就好。',
    cta: '找一個不會評斷你的人聊聊。預約陪跑，我們可以慢慢來，你決定要談多少。',
  },
];

/** 依每題選中的 value 累加，取最高分類型 */
export function computeQuizResult(answers: Record<string, string>): QuizResultType {
  const counts: Record<QuizTypeKey, number> = {
    control: 0,
    perfection: 0,
    comparison: 0,
    avoid: 0,
  };
  for (const value of Object.values(answers)) {
    if (value in counts) counts[value as QuizTypeKey]++;
  }
  const max = Math.max(...Object.values(counts));
  const key = (Object.entries(counts).find(([, n]) => n === max)?.[0] ?? 'control') as QuizTypeKey;
  return RESULT_TYPES.find((r) => r.key === key) ?? RESULT_TYPES[0];
}

export { RESULT_TYPES };

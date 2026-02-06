/**
 * 關於我頁：語言轉化（Before / After）
 */

export interface LanguageTransformation {
  before: string;
  after: string;
}

export const ABOUT_TRANSFORMATIONS: LanguageTransformation[] = [
  { before: '我就是太懶了', after: '我其實是太累了，但沒人允許我停下來' },
  { before: '我沒有自制力', after: '我的身體正在用渴望表達某種需要' },
  { before: '我的身材太糟了', after: '我的身體一直在保護我，用它知道的方式' },
  { before: '我怎麼又破功了', after: '這不是失敗，是身體還在適應新的安全感' },
];

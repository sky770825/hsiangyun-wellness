/**
 * 首頁「語言被鬆動的地方」區塊：學員見證（簡短版）
 */

export interface TestimonialItem {
  initial: string;
  before: string;
  after: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    initial: 'A',
    before: '我每次爆食完都很後悔，覺得自己很沒用',
    after: '我發現我是在吞下那些不能說的情緒。現在我學會了先問自己：你怎麼了？',
  },
  {
    initial: 'M',
    before: '我已經試過所有方法，就是瘦不下來',
    after: '原來我的身體一直覺得「瘦」代表危險。當我開始感覺安全，體重才開始鬆動。',
  },
  {
    initial: 'S',
    before: '我恨我的身體，它從來不聽我的話',
    after: '現在我知道，身體不是敵人，它一直在保護我。我們和解了。',
  },
];

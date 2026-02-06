/**
 * 學員故事頁：完整轉化故事
 * 可選的經歷照片（勵志照）顯示在每則故事下方
 */

export interface StoryItem {
  initial: string;
  before: string;
  after: string;
  journey: string;
  /** 可選：該則故事的經歷／勵志照片 URL（後台媒體庫或 Supabase） */
  imageUrl?: string;
  /** 可選：照片說明，例如「三個月後的某一天」 */
  imageCaption?: string;
}

/** 「改變的模樣」區塊：不綁定單一故事的勵志照片牆 */
export interface StoryGalleryPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
}

/** 示範圖路徑（可替換為後台媒體庫或真實勵志照） */
const DEMO_GALLERY = ['/demo-gallery-1.jpg', '/demo-gallery-2.jpg', '/demo-gallery-3.jpg'] as const;

export const STORY_GALLERY_PHOTOS: StoryGalleryPhoto[] = [
  { id: 'gallery-1', imageUrl: DEMO_GALLERY[0], caption: '願意分享的經歷' },
  { id: 'gallery-2', imageUrl: DEMO_GALLERY[1], caption: '改變的模樣' },
  { id: 'gallery-3', imageUrl: DEMO_GALLERY[2], caption: '溫柔地活出來的樣子' },
];

export const STORIES: StoryItem[] = [
  {
    initial: 'A',
    before: '我每次爆食完都很後悔，覺得自己很沒用，為什麼就是控制不了',
    after: '我發現我是在吞下那些不能說的情緒——那些在工作中不能表達的委屈，在家裡不能展現的脆弱。現在我學會了先問自己：「你怎麼了？你需要什麼？」',
    journey: '3個月的陪跑旅程',
    imageUrl: '/demo-story.jpg',
    imageCaption: '三個月後，我開始敢看鏡頭了',
  },
  {
    initial: 'M',
    before: '我已經試過所有方法，節食、運動、各種減肥產品，就是瘦不下來',
    after: '原來我的身體一直覺得「瘦」代表危險。小時候媽媽生病那段時間，瘦對我來說等於不安全。當我開始感覺現在是安全的，體重才開始鬆動。',
    journey: '6個月的深度陪伴',
    imageUrl: '/demo-petal.jpg',
    imageCaption: '六個月的深度陪伴，身體開始鬆動',
  },
  {
    initial: 'S',
    before: '我恨我的身體，它從來不聽我的話，我覺得它背叛了我',
    after: '現在我知道，身體不是敵人，它一直在用自己的方式保護我。那些脂肪，是它給我的盔甲。我們和解了，我開始說：謝謝你一直保護我。',
    journey: '4個月的轉化之路',
    imageUrl: '/demo-story.jpg',
    imageCaption: '與身體和解的那一天',
  },
  {
    initial: 'L',
    before: '我覺得自己很貪吃，沒救了，別人都能控制，就我不行',
    after: '原來「貪吃」只是表象，底下是長期被忽略的匱乏感。當我開始允許自己擁有、被滿足，對食物的執念反而變淡了。',
    journey: '5個月的自我探索',
  },
  {
    initial: 'C',
    before: '每次減下來都會復胖，我已經不相信自己可以維持了',
    after: '我終於明白，以前的減重是「強迫身體」，復胖是身體的反撲。現在的改變是「理解身體」，它自己就不想回去了。',
    journey: '持續進行中的陪伴',
  },
];

export interface TextbookItem {
  id: string;
  title: string;
  chapter: number;
  chapterTitle: string;
}

export interface TextbookChapter {
  number: number;
  title: string;
  items: TextbookItem[];
}

export const TEXTBOOK_DATA: TextbookItem[] = [
  // 第1章 ファサード
  { id: '1-1.1', title: '入り口から見えるカウンターがあればハの字に設計し、外から見た時のインパクトを出す。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.2', title: '2階席があれば看板や描き絵等で目立つように明記する。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.3', title: 'のれんがあればライティングを施す（特に白系）。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.4', title: '袖看板・置き看板があれば設置し、外部コンセントの有無を確認する。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.5', title: 'オーニングや軒下があれば明かりを確保する。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.6', title: '大衆業態であれば内部の雰囲気が店外に溢れるよう開口部を大きくする。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.7', title: '暖簾など布製品が1000mm超であれば防炎製品にする。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.8', title: '消防突入口や避難器具設置位置があれば降下障害とならないよう計画する。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.9', title: '前面道路からの延焼ラインがあれば窓材質を決定する。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.10', title: '商店街内に出店する場合は規制があれば従う。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.11', title: 'ドアがあれば押す/引くサインを必ず表記する。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.12', title: '敷地境界線があれば給湯器や室外機の設置場所を検討する。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.13', title: '大きなグラフィックが10㎡超であれば屋外広告物申請を行う。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.14', title: '壁面にダクト開口を設ける場合は100mm以上離す。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },
  { id: '1-1.15', title: '犬走りタイルがあれば防滑性能の高いものを選定する。もしなければ何もしない。', chapter: 1, chapterTitle: 'ファサード' },

  // 第2章 店内
  { id: '2-1.1', title: 'お客様の手に触れる物があれば本物の素材にする。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.2', title: 'ブリックタイルの描き絵があれば使用しない。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.3', title: 'テーブルがあれば高さは座面+280を基本にする。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.4', title: 'トイレ内腰があれば塗り系素材を避け、タイル等にする。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.5', title: 'トイレ内CPがあればフロスト系を推奨する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.6', title: 'トイレ内の壁があれば正面と背面を同色、左右を同色にする。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.7', title: 'カウンター腰があれば荷物置きやフックを設置する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.8', title: 'テーブル脚があればフックを付ける。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.9', title: '業態によって必要であればテーブルにワインクーラーの落とし込みを作る。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.10', title: '厨房入り口があれば必ずタレ壁を設ける。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.11', title: '集成材を使う場合ははぎ合わせを避ける。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.12', title: 'テーブル天板小口材があればはみ出し寸法は10mm以下に抑える。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.13', title: '壁面の仕上げがあれば向かい面同士をそろえる。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.14', title: 'カーテン等の布製品が1000mm超であれば防炎製品にする。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.15', title: 'ペンダントライトがあればコード色に注意する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.16', title: 'LED電球があれば調光器対応を確認して発注する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.17', title: 'ランプがあれば色温度に配慮する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.18', title: 'ドアがあれば室名表記と押す/引くサインを必ず表記する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.19', title: '椅子があれば掃除しやすい素材を選定する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.20', title: '古民家など古い建物を使う場合は隙間風や窓の立て付けを確認し修繕する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },
  { id: '2-1.21', title: '神奈川県で客席があれば専用手洗い器を設置する。もしなければ何もしない。', chapter: 2, chapterTitle: '店内' },

  // 第3章 厨房
  { id: '2-2.1', title: '厨房が狭ければ作業場所確保のためシンク塞ぎ板やゲタの有無を確認する。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },
  { id: '2-2.2', title: '電子レンジがあれば専用電源を確保する。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },
  { id: '2-2.3', title: '排気フードがあれば可燃物まで100以上離す。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },
  { id: '2-2.4', title: '厨房器具とカウンター高さをそろえる場合は可燃物を150以上離すか不燃材で仕切る。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },
  { id: '2-2.5', title: 'フライヤー横にシンクや熱源横に製氷機がある場合は避け、必要なら遮熱版で対応する。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },
  { id: '2-2.6', title: 'グリストラップが必要なら図面に反映して不備を防ぐ。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },
  { id: '2-2.7', title: 'フライヤー等熱機器があればグリースフィルターまで1000mm以上離す。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },
  { id: '2-2.8', title: '厨房内に手洗い器があれば設置する。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },
  { id: '2-2.9', title: '厨房内があれば平滑で掃除しやすい仕上げにする。もしなければ何もしない。', chapter: 3, chapterTitle: '厨房' },

  // 第4章 設備
  { id: '1-1.1-4', title: '厨房内の吸気口があれば位置に注意する（焼肉・鉄板系は給気多い）。もしなければ何もしない。', chapter: 4, chapterTitle: '設備' },
  { id: '1-1.2-4', title: '店内空調があれば厨房には引き込まない（厨房は冷房のみ）。もしなければ何もしない。', chapter: 4, chapterTitle: '設備' },
  { id: '1-1.3-4', title: '空調機があれば位置・角度を調整して局部的な暑さ寒さを防ぐ。もしなければ何もしない。', chapter: 4, chapterTitle: '設備' },
  { id: '1-1.4-4', title: '上階が屋上や屋根であれば馬力数を1.5～2倍に設定する。もしなければ何もしない。', chapter: 4, chapterTitle: '設備' },
  { id: '1-1.5-4', title: 'エアコンがあればフェイスは最初に確認・指定（黒 or 白）にする。もしなければ何もしない。', chapter: 4, chapterTitle: '設備' },
  { id: '1-1.6-4', title: '冷媒・ドレン配管があればルートを想定して排水勾配を早期に決定する。もしなければ何もしない。', chapter: 4, chapterTitle: '設備' }
];


export const getChapterData = (): TextbookChapter[] => {
  const chapters: TextbookChapter[] = [];
  const chapterNumbers = [1, 2, 3, 4];
  const chapterTitles = ['ファサード', '店内', '厨房', '設備'];

  chapterNumbers.forEach((num, index) => {
    const items = TEXTBOOK_DATA.filter(item => item.chapter === num);
    chapters.push({
      number: num,
      title: chapterTitles[index],
      items
    });
  });

  return chapters;
};
// スプライトフレーム（1つのドット絵）
export type SpriteFrame = {
  id: string;           // フレームの一意のID
  grid: number[][];     // 16x16のグリッド（色のインデックス）
  duration?: number;    // アニメーション時の表示時間（ミリ秒）
};

// カラーパレット
export type ColorPalette = {
  id: string;           // パレットのID
  name: string;         // パレット名
  colors: string[];     // sRGBA形式の色配列
};

// カテゴリ階層
export type Category = {
  id: string;           // カテゴリの一意のID
  name: string;         // カテゴリ名
  parentId: string | null; // 親カテゴリのID（トップレベルならnull）
};

// スプライト
export type Sprite = {
  id: string;           // スプライトの一意のID
  name: string;         // スプライト名
  categoryId: string;   // 所属するカテゴリのID
  frames: SpriteFrame[]; // アニメーションフレーム
  createdAt: number;    // 作成日時
  updatedAt: number;    // 更新日時
};

// 永続化が必要なアプリケーションデータ
export type AppData = {
  sprites: Sprite[];
  categories: Category[];
  palettes: ColorPalette[];
};

// 編集ツールの種類
export enum EditorTool {
  PENCIL = 'pencil',
  ERASER = 'eraser',
  FILL = 'fill',
  EYEDROPPER = 'eyedropper'
}

// アプリケーション状態
export type AppState = {
  selectedCategoryId: string | null;
  selectedSpriteId: string | null;
  selectedFrameIndex: number;
  selectedColor: number;
  selectedPaletteId: string;
  currentTool: EditorTool;
  isPlaying: boolean;
  playbackSpeed: number;
};

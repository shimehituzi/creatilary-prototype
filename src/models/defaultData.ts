import { Category, ColorPalette } from './types';
import { v4 as uuidv4 } from 'uuid';

// 標準カテゴリの定義
export const defaultCategories: Category[] = [
  // トップレベルカテゴリ
  { id: 'cat_character', name: 'キャラクター', parentId: null },
  { id: 'cat_item', name: 'アイテム', parentId: null },
  { id: 'cat_environment', name: '環境', parentId: null },
  { id: 'cat_effect', name: 'エフェクト', parentId: null },
  { id: 'cat_ui', name: 'UI要素', parentId: null },
  
  // キャラクターサブカテゴリ
  { id: 'cat_player', name: 'プレイヤーキャラクター', parentId: 'cat_character' },
  { id: 'cat_enemy', name: '敵キャラクター', parentId: 'cat_character' },
  { id: 'cat_npc', name: 'NPCキャラクター', parentId: 'cat_character' },
  
  // アイテムサブカテゴリ
  { id: 'cat_weapon', name: '武器', parentId: 'cat_item' },
  { id: 'cat_armor', name: '防具', parentId: 'cat_item' },
  { id: 'cat_consumable', name: '消費アイテム', parentId: 'cat_item' },
  { id: 'cat_collectible', name: '収集アイテム', parentId: 'cat_item' },
  
  // 環境サブカテゴリ
  { id: 'cat_terrain', name: '地形タイル', parentId: 'cat_environment' },
  { id: 'cat_background', name: '背景オブジェクト', parentId: 'cat_environment' },
  { id: 'cat_interactive', name: 'インタラクティブオブジェクト', parentId: 'cat_environment' },
  { id: 'cat_decoration', name: '装飾品', parentId: 'cat_environment' },
  
  // エフェクトサブカテゴリ
  { id: 'cat_attack', name: '攻撃エフェクト', parentId: 'cat_effect' },
  { id: 'cat_magic', name: '魔法エフェクト', parentId: 'cat_effect' },
  { id: 'cat_env_effect', name: '環境エフェクト', parentId: 'cat_effect' },
  { id: 'cat_particle', name: 'パーティクル', parentId: 'cat_effect' },
  
  // UI要素サブカテゴリ
  { id: 'cat_icon', name: 'アイコン', parentId: 'cat_ui' },
  { id: 'cat_button', name: 'ボタン', parentId: 'cat_ui' },
  { id: 'cat_window', name: 'ウィンドウ要素', parentId: 'cat_ui' },
  { id: 'cat_cursor', name: 'カーソル', parentId: 'cat_ui' },
];

// デフォルトカラーパレット
export const defaultPalettes: ColorPalette[] = [
  {
    id: 'palette_default',
    name: 'デフォルトパレット',
    colors: [
      'rgba(0, 0, 0, 1)',       // 黒
      'rgba(255, 255, 255, 1)', // 白
      'rgba(255, 0, 0, 1)',     // 赤
      'rgba(0, 255, 0, 1)',     // 緑
      'rgba(0, 0, 255, 1)',     // 青
      'rgba(255, 255, 0, 1)',   // 黄
      'rgba(255, 0, 255, 1)',   // マゼンタ
      'rgba(0, 255, 255, 1)',   // シアン
      'rgba(128, 128, 128, 1)', // グレー
      'rgba(255, 128, 0, 1)',   // オレンジ
      'rgba(128, 0, 255, 1)',   // 紫
      'rgba(0, 128, 0, 1)',     // 深緑
      'rgba(128, 64, 0, 1)',    // 茶色
      'rgba(255, 128, 128, 1)', // ピンク
      'rgba(128, 255, 128, 1)', // ライトグリーン
      'rgba(128, 128, 255, 1)'  // ライトブルー
    ]
  },
  {
    id: 'palette_gameboy',
    name: 'ゲームボーイ風',
    colors: [
      'rgba(15, 56, 15, 1)',    // 暗い緑
      'rgba(48, 98, 48, 1)',    // 中間の緑
      'rgba(139, 172, 15, 1)',  // 明るい緑
      'rgba(155, 188, 15, 1)'   // 最も明るい緑
    ]
  }
];

// 空のグリッドを生成する関数
export const createEmptyGrid = (): number[][] => {
  return Array(16).fill(0).map(() => Array(16).fill(0));
};

// 新しいスプライトフレームを生成する関数
export const createNewFrame = () => {
  return {
    id: uuidv4(),
    grid: createEmptyGrid(),
    duration: 100 // デフォルトは100ms
  };
};

// 新しいスプライトを生成する関数
export const createNewSprite = (name: string, categoryId: string) => {
  const now = Date.now();
  return {
    id: uuidv4(),
    name,
    categoryId,
    frames: [createNewFrame()],
    createdAt: now,
    updatedAt: now
  };
};

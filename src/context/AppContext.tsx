import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppData, AppState, EditorTool, Sprite, Category, ColorPalette, SpriteFrame } from '../models/types';
import { defaultCategories, defaultPalettes, createNewSprite, createNewFrame } from '../models/defaultData';
import { v4 as uuidv4 } from 'uuid';

// 初期アプリケーションデータ
const initialAppData: AppData = {
  sprites: [],
  categories: defaultCategories,
  palettes: defaultPalettes,
};

// 初期アプリケーション状態
const initialAppState: AppState = {
  selectedCategoryId: null,
  selectedSpriteId: null,
  selectedFrameIndex: 0,
  selectedColor: 1, // デフォルトは白（パレットの2番目）
  selectedPaletteId: defaultPalettes[0].id,
  currentTool: EditorTool.PENCIL,
  isPlaying: false,
  playbackSpeed: 1.0,
};

// アクションタイプ
type AppAction =
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'SET_SELECTED_SPRITE'; payload: string | null }
  | { type: 'SET_SELECTED_FRAME_INDEX'; payload: number }
  | { type: 'SET_SELECTED_COLOR'; payload: number }
  | { type: 'SET_SELECTED_PALETTE'; payload: string }
  | { type: 'SET_CURRENT_TOOL'; payload: EditorTool }
  | { type: 'SET_IS_PLAYING'; payload: boolean }
  | { type: 'SET_PLAYBACK_SPEED'; payload: number }
  | { type: 'ADD_SPRITE'; payload: Sprite }
  | { type: 'UPDATE_SPRITE'; payload: Sprite }
  | { type: 'DELETE_SPRITE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_PALETTE'; payload: ColorPalette }
  | { type: 'UPDATE_PALETTE'; payload: ColorPalette }
  | { type: 'DELETE_PALETTE'; payload: string }
  | { type: 'ADD_FRAME'; payload: { spriteId: string; frame: SpriteFrame } }
  | { type: 'UPDATE_FRAME'; payload: { spriteId: string; frameIndex: number; frame: SpriteFrame } }
  | { type: 'DELETE_FRAME'; payload: { spriteId: string; frameIndex: number } }
  | { type: 'UPDATE_PIXEL'; payload: { spriteId: string; frameIndex: number; x: number; y: number; colorIndex: number } }
  | { type: 'IMPORT_DATA'; payload: AppData };

// コンテキストの型定義
type AppContextType = {
  appData: AppData;
  appState: AppState;
  dispatch: React.Dispatch<AppAction>;
  // ヘルパー関数
  createSprite: (name: string, categoryId: string) => void;
  updateSprite: (sprite: Sprite) => void;
  deleteSprite: (spriteId: string) => void;
  createCategory: (name: string, parentId: string | null) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  createPalette: (name: string, colors: string[]) => void;
  updatePalette: (palette: ColorPalette) => void;
  deletePalette: (paletteId: string) => void;
  addFrame: (spriteId: string) => void;
  updateFrame: (spriteId: string, frameIndex: number, frame: SpriteFrame) => void;
  deleteFrame: (spriteId: string, frameIndex: number) => void;
  updatePixel: (spriteId: string, frameIndex: number, x: number, y: number, colorIndex: number) => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
};

// コンテキストの作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// リデューサー関数
const appReducer = (state: { appData: AppData; appState: AppState }, action: AppAction): { appData: AppData; appState: AppState } => {
  switch (action.type) {
    case 'SET_SELECTED_CATEGORY':
      return {
        ...state,
        appState: {
          ...state.appState,
          selectedCategoryId: action.payload,
        },
      };
    case 'SET_SELECTED_SPRITE':
      return {
        ...state,
        appState: {
          ...state.appState,
          selectedSpriteId: action.payload,
          selectedFrameIndex: 0, // スプライトが変更されたらフレームインデックスをリセット
        },
      };
    case 'SET_SELECTED_FRAME_INDEX':
      return {
        ...state,
        appState: {
          ...state.appState,
          selectedFrameIndex: action.payload,
        },
      };
    case 'SET_SELECTED_COLOR':
      return {
        ...state,
        appState: {
          ...state.appState,
          selectedColor: action.payload,
        },
      };
    case 'SET_SELECTED_PALETTE':
      return {
        ...state,
        appState: {
          ...state.appState,
          selectedPaletteId: action.payload,
        },
      };
    case 'SET_CURRENT_TOOL':
      return {
        ...state,
        appState: {
          ...state.appState,
          currentTool: action.payload,
        },
      };
    case 'SET_IS_PLAYING':
      return {
        ...state,
        appState: {
          ...state.appState,
          isPlaying: action.payload,
        },
      };
    case 'SET_PLAYBACK_SPEED':
      return {
        ...state,
        appState: {
          ...state.appState,
          playbackSpeed: action.payload,
        },
      };
    case 'ADD_SPRITE':
      return {
        ...state,
        appData: {
          ...state.appData,
          sprites: [...state.appData.sprites, action.payload],
        },
      };
    case 'UPDATE_SPRITE': {
      const updatedSprites = state.appData.sprites.map((sprite) =>
        sprite.id === action.payload.id ? { ...action.payload, updatedAt: Date.now() } : sprite
      );
      return {
        ...state,
        appData: {
          ...state.appData,
          sprites: updatedSprites,
        },
      };
    }
    case 'DELETE_SPRITE': {
      const filteredSprites = state.appData.sprites.filter((sprite) => sprite.id !== action.payload);
      return {
        ...state,
        appData: {
          ...state.appData,
          sprites: filteredSprites,
        },
        appState: {
          ...state.appState,
          selectedSpriteId: state.appState.selectedSpriteId === action.payload ? null : state.appState.selectedSpriteId,
        },
      };
    }
    case 'ADD_CATEGORY':
      return {
        ...state,
        appData: {
          ...state.appData,
          categories: [...state.appData.categories, action.payload],
        },
      };
    case 'UPDATE_CATEGORY': {
      const updatedCategories = state.appData.categories.map((category) =>
        category.id === action.payload.id ? action.payload : category
      );
      return {
        ...state,
        appData: {
          ...state.appData,
          categories: updatedCategories,
        },
      };
    }
    case 'DELETE_CATEGORY': {
      // カテゴリを削除する際は、そのカテゴリに属するスプライトも削除する
      const filteredCategories = state.appData.categories.filter((category) => category.id !== action.payload);
      const filteredSprites = state.appData.sprites.filter((sprite) => sprite.categoryId !== action.payload);
      return {
        ...state,
        appData: {
          ...state.appData,
          categories: filteredCategories,
          sprites: filteredSprites,
        },
        appState: {
          ...state.appState,
          selectedCategoryId: state.appState.selectedCategoryId === action.payload ? null : state.appState.selectedCategoryId,
        },
      };
    }
    case 'ADD_PALETTE':
      return {
        ...state,
        appData: {
          ...state.appData,
          palettes: [...state.appData.palettes, action.payload],
        },
      };
    case 'UPDATE_PALETTE': {
      const updatedPalettes = state.appData.palettes.map((palette) =>
        palette.id === action.payload.id ? action.payload : palette
      );
      return {
        ...state,
        appData: {
          ...state.appData,
          palettes: updatedPalettes,
        },
      };
    }
    case 'DELETE_PALETTE': {
      // デフォルトパレットは削除できないようにする
      if (action.payload === defaultPalettes[0].id) {
        return state;
      }
      const filteredPalettes = state.appData.palettes.filter((palette) => palette.id !== action.payload);
      return {
        ...state,
        appData: {
          ...state.appData,
          palettes: filteredPalettes,
        },
        appState: {
          ...state.appState,
          selectedPaletteId: state.appState.selectedPaletteId === action.payload ? defaultPalettes[0].id : state.appState.selectedPaletteId,
        },
      };
    }
    case 'ADD_FRAME': {
      const { spriteId, frame } = action.payload;
      const updatedSprites = state.appData.sprites.map((sprite) => {
        if (sprite.id === spriteId) {
          return {
            ...sprite,
            frames: [...sprite.frames, frame],
            updatedAt: Date.now(),
          };
        }
        return sprite;
      });
      return {
        ...state,
        appData: {
          ...state.appData,
          sprites: updatedSprites,
        },
      };
    }
    case 'UPDATE_FRAME': {
      const { spriteId, frameIndex, frame } = action.payload;
      const updatedSprites = state.appData.sprites.map((sprite) => {
        if (sprite.id === spriteId) {
          const updatedFrames = [...sprite.frames];
          updatedFrames[frameIndex] = frame;
          return {
            ...sprite,
            frames: updatedFrames,
            updatedAt: Date.now(),
          };
        }
        return sprite;
      });
      return {
        ...state,
        appData: {
          ...state.appData,
          sprites: updatedSprites,
        },
      };
    }
    case 'DELETE_FRAME': {
      const { spriteId, frameIndex } = action.payload;
      const updatedSprites = state.appData.sprites.map((sprite) => {
        if (sprite.id === spriteId) {
          // 最低1つのフレームは残す
          if (sprite.frames.length <= 1) {
            return sprite;
          }
          const updatedFrames = sprite.frames.filter((_, index) => index !== frameIndex);
          return {
            ...sprite,
            frames: updatedFrames,
            updatedAt: Date.now(),
          };
        }
        return sprite;
      });
      return {
        ...state,
        appData: {
          ...state.appData,
          sprites: updatedSprites,
        },
        appState: {
          ...state.appState,
          selectedFrameIndex: state.appState.selectedFrameIndex >= frameIndex ? 
            Math.max(0, state.appState.selectedFrameIndex - 1) : 
            state.appState.selectedFrameIndex,
        },
      };
    }
    case 'UPDATE_PIXEL': {
      const { spriteId, frameIndex, x, y, colorIndex } = action.payload;
      const updatedSprites = state.appData.sprites.map((sprite) => {
        if (sprite.id === spriteId) {
          const updatedFrames = [...sprite.frames];
          const updatedGrid = [...updatedFrames[frameIndex].grid];
          // ディープコピーを作成
          updatedGrid[y] = [...updatedGrid[y]];
          updatedGrid[y][x] = colorIndex;
          updatedFrames[frameIndex] = {
            ...updatedFrames[frameIndex],
            grid: updatedGrid,
          };
          return {
            ...sprite,
            frames: updatedFrames,
            updatedAt: Date.now(),
          };
        }
        return sprite;
      });
      return {
        ...state,
        appData: {
          ...state.appData,
          sprites: updatedSprites,
        },
      };
    }
    case 'IMPORT_DATA':
      return {
        appData: action.payload,
        appState: initialAppState,
      };
    default:
      return state;
  }
};

// プロバイダーコンポーネント
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ローカルストレージからデータを読み込む
  const loadFromLocalStorage = (): { appData: AppData; appState: AppState } => {
    try {
      const savedData = localStorage.getItem('pixelArtAppData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return {
          appData: parsedData.appData,
          appState: {
            ...initialAppState,
            ...parsedData.appState,
          },
        };
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
    return { appData: initialAppData, appState: initialAppState };
  };

  const [state, dispatch] = useReducer(appReducer, loadFromLocalStorage());

  // データが変更されたらローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem('pixelArtAppData', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }, [state]);

  // ヘルパー関数
  const createSprite = (name: string, categoryId: string) => {
    const newSprite = createNewSprite(name, categoryId);
    dispatch({ type: 'ADD_SPRITE', payload: newSprite });
    return newSprite.id;
  };

  const updateSprite = (sprite: Sprite) => {
    dispatch({ type: 'UPDATE_SPRITE', payload: sprite });
  };

  const deleteSprite = (spriteId: string) => {
    dispatch({ type: 'DELETE_SPRITE', payload: spriteId });
  };

  const createCategory = (name: string, parentId: string | null) => {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      parentId,
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    return newCategory.id;
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  };

  const deleteCategory = (categoryId: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
  };

  const createPalette = (name: string, colors: string[]) => {
    const newPalette: ColorPalette = {
      id: uuidv4(),
      name,
      colors,
    };
    dispatch({ type: 'ADD_PALETTE', payload: newPalette });
    return newPalette.id;
  };

  const updatePalette = (palette: ColorPalette) => {
    dispatch({ type: 'UPDATE_PALETTE', payload: palette });
  };

  const deletePalette = (paletteId: string) => {
    dispatch({ type: 'DELETE_PALETTE', payload: paletteId });
  };

  const addFrame = (spriteId: string) => {
    const newFrame = createNewFrame();
    dispatch({ type: 'ADD_FRAME', payload: { spriteId, frame: newFrame } });
  };

  const updateFrame = (spriteId: string, frameIndex: number, frame: SpriteFrame) => {
    dispatch({ type: 'UPDATE_FRAME', payload: { spriteId, frameIndex, frame } });
  };

  const deleteFrame = (spriteId: string, frameIndex: number) => {
    dispatch({ type: 'DELETE_FRAME', payload: { spriteId, frameIndex } });
  };

  const updatePixel = (spriteId: string, frameIndex: number, x: number, y: number, colorIndex: number) => {
    dispatch({ type: 'UPDATE_PIXEL', payload: { spriteId, frameIndex, x, y, colorIndex } });
  };

  const exportData = (): string => {
    return JSON.stringify(state.appData, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const parsedData = JSON.parse(jsonData) as AppData;
      dispatch({ type: 'IMPORT_DATA', payload: parsedData });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid JSON format');
    }
  };

  return (
    <AppContext.Provider
      value={{
        appData: state.appData,
        appState: state.appState,
        dispatch,
        createSprite,
        updateSprite,
        deleteSprite,
        createCategory,
        updateCategory,
        deleteCategory,
        createPalette,
        updatePalette,
        deletePalette,
        addFrame,
        updateFrame,
        deleteFrame,
        updatePixel,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// カスタムフック
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

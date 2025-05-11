import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { EditorTool } from '../../models/types';

interface PixelGridProps {
  spriteId: string;
  frameIndex: number;
  scale?: number;
  showGrid?: boolean;
  editable?: boolean;
}

const PixelGrid: React.FC<PixelGridProps> = ({
  spriteId,
  frameIndex,
  scale = 16,
  showGrid = true,
  editable = true,
}) => {
  const { appData, appState, updatePixel } = useAppContext();
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 現在のスプライトとフレームを取得
  const sprite = appData.sprites.find(s => s.id === spriteId);
  const frame = sprite?.frames[frameIndex];
  const palette = appData.palettes.find(p => p.id === appState.selectedPaletteId) || appData.palettes[0];

  // キャンバスの描画
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // グリッドを描画
    const cellSize = scale;
    const gridSize = 16;

    // ピクセルを描画
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const colorIndex = frame.grid[y][x];
        if (colorIndex > 0 && colorIndex < palette.colors.length) {
          ctx.fillStyle = palette.colors[colorIndex];
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // グリッド線を描画
    if (showGrid) {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= gridSize; i++) {
        // 横線
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();

        // 縦線
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
      }
    }
  };

  // フレームまたはパレットが変更されたら再描画
  useEffect(() => {
    drawCanvas();
  }, [frame, palette, scale, showGrid]);

  // ピクセル座標の計算
  const calculatePixelCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);

    // 範囲外のチェック
    if (x < 0 || x >= 16 || y < 0 || y >= 16) return null;

    return { x, y };
  };

  // 線を描画する関数（ブレゼンハムのアルゴリズム）
  const drawLine = (x0: number, y0: number, x1: number, y1: number, colorIndex: number) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      // 現在の位置にピクセルを描画
      updatePixel(spriteId, frameIndex, x0, y0, colorIndex);

      // 終点に到達したら終了
      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  };

  // マウスダウンハンドラ
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !sprite) return;

    const coords = calculatePixelCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    setLastPosition(coords);

    // 現在のツールに応じた処理
    if (appState.currentTool === EditorTool.PENCIL) {
      updatePixel(spriteId, frameIndex, coords.x, coords.y, appState.selectedColor);
    } else if (appState.currentTool === EditorTool.ERASER) {
      updatePixel(spriteId, frameIndex, coords.x, coords.y, 0); // 0は透明
    } else if (appState.currentTool === EditorTool.FILL) {
      // 塗りつぶしツール（フラッドフィル）
      const targetColorIndex = frame.grid[coords.y][coords.x];
      if (targetColorIndex === appState.selectedColor) return;

      const floodFill = (x: number, y: number, targetColor: number, replacementColor: number) => {
        // 範囲外または既に置き換え色の場合はスキップ
        if (
          x < 0 || x >= 16 || y < 0 || y >= 16 ||
          frame.grid[y][x] !== targetColor ||
          frame.grid[y][x] === replacementColor
        ) {
          return;
        }

        // 色を置き換え
        updatePixel(spriteId, frameIndex, x, y, replacementColor);

        // 隣接するピクセルを再帰的に処理
        floodFill(x + 1, y, targetColor, replacementColor);
        floodFill(x - 1, y, targetColor, replacementColor);
        floodFill(x, y + 1, targetColor, replacementColor);
        floodFill(x, y - 1, targetColor, replacementColor);
      };

      floodFill(coords.x, coords.y, targetColorIndex, appState.selectedColor);
    } else if (appState.currentTool === EditorTool.EYEDROPPER) {
      // スポイトツール
      const colorIndex = frame.grid[coords.y][coords.x];
      if (colorIndex >= 0 && colorIndex < palette.colors.length) {
        // 選択した色をセット
        // dispatch({ type: 'SET_SELECTED_COLOR', payload: colorIndex });
      }
    }
  };

  // マウス移動ハンドラ
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !isDrawing || !lastPosition || !sprite) return;

    const coords = calculatePixelCoords(e);
    if (!coords) return;

    // 前回の位置から現在の位置まで線を引く
    if (appState.currentTool === EditorTool.PENCIL) {
      drawLine(lastPosition.x, lastPosition.y, coords.x, coords.y, appState.selectedColor);
    } else if (appState.currentTool === EditorTool.ERASER) {
      drawLine(lastPosition.x, lastPosition.y, coords.x, coords.y, 0);
    }

    setLastPosition(coords);
  };

  // マウスアップハンドラ
  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  // マウスリーブハンドラ
  const handleMouseLeave = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  if (!sprite || !frame) {
    return <div>スプライトまたはフレームが見つかりません</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      width={16 * scale}
      height={16 * scale}
      style={{ 
        border: '1px solid #d9d9d9',
        cursor: editable ? 'crosshair' : 'default',
        imageRendering: 'pixelated',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default PixelGrid;

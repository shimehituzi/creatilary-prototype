import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Slider, Tooltip } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import PixelGrid from './PixelGrid';

interface AnimationPreviewProps {
  spriteId: string;
  scale?: number;
}

const AnimationPreview: React.FC<AnimationPreviewProps> = ({ spriteId, scale = 16 }) => {
  const { appData, appState, dispatch } = useAppContext();
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // 現在のスプライトを取得
  const sprite = appData.sprites.find(s => s.id === spriteId);

  if (!sprite || sprite.frames.length === 0) {
    return <div>スプライトが見つかりません</div>;
  }

  // アニメーションの再生/停止
  const togglePlayback = () => {
    dispatch({ type: 'SET_IS_PLAYING', payload: !appState.isPlaying });
  };

  // アニメーションをリセット
  const resetAnimation = () => {
    setCurrentFrame(0);
    if (!appState.isPlaying) {
      dispatch({ type: 'SET_IS_PLAYING', payload: true });
    }
  };

  // 再生速度の変更
  const handleSpeedChange = (value: number) => {
    dispatch({ type: 'SET_PLAYBACK_SPEED', payload: value });
  };

  // アニメーションフレームの更新
  const updateAnimationFrame = (timestamp: number) => {
    if (!sprite || !appState.isPlaying) return;

    const currentFrameObj = sprite.frames[currentFrame];
    if (!currentFrameObj) return;

    const frameDuration = (currentFrameObj.duration || 100) / appState.playbackSpeed;
    
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - lastFrameTimeRef.current;
    
    if (elapsed >= frameDuration) {
      const nextFrame = (currentFrame + 1) % sprite.frames.length;
      setCurrentFrame(nextFrame);
      lastFrameTimeRef.current = timestamp;
    }
    
    animationRef.current = requestAnimationFrame(updateAnimationFrame);
  };

  // アニメーションの開始/停止
  useEffect(() => {
    if (appState.isPlaying) {
      lastFrameTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(updateAnimationFrame);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [appState.isPlaying, currentFrame, sprite.frames, appState.playbackSpeed]);

  return (
    <Card
      title="アニメーションプレビュー"
      extra={
        <div>
          <Tooltip title={appState.isPlaying ? '一時停止' : '再生'}>
            <Button
              type="text"
              icon={appState.isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={togglePlayback}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          <Tooltip title="リセット">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={resetAnimation}
            />
          </Tooltip>
        </div>
      }
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <PixelGrid
          spriteId={spriteId}
          frameIndex={currentFrame}
          scale={scale}
          showGrid={false}
          editable={false}
        />
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>再生速度: {appState.playbackSpeed.toFixed(1)}x</span>
          <span>フレーム: {currentFrame + 1} / {sprite.frames.length}</span>
        </div>
        <Slider
          min={0.1}
          max={3}
          step={0.1}
          value={appState.playbackSpeed}
          onChange={handleSpeedChange}
        />
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>フレーム時間: {sprite.frames[currentFrame]?.duration || 100}ms</span>
          <span>実効時間: {Math.round((sprite.frames[currentFrame]?.duration || 100) / appState.playbackSpeed)}ms</span>
        </div>
      </div>
    </Card>
  );
};

export default AnimationPreview;

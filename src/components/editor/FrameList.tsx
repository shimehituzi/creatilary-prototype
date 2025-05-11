import React, { useState } from 'react';
import { Card, List, Button, InputNumber, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import PixelGrid from './PixelGrid';

interface FrameListProps {
  spriteId: string;
}

const FrameList: React.FC<FrameListProps> = ({ spriteId }) => {
  const { appData, appState, dispatch, addFrame, updateFrame, deleteFrame } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [frameToDelete, setFrameToDelete] = useState<number | null>(null);

  // 現在のスプライトを取得
  const sprite = appData.sprites.find(s => s.id === spriteId);

  if (!sprite) {
    return <div>スプライトが見つかりません</div>;
  }

  // フレーム選択ハンドラ
  const handleSelectFrame = (frameIndex: number) => {
    dispatch({ type: 'SET_SELECTED_FRAME_INDEX', payload: frameIndex });
  };

  // フレーム追加ハンドラ
  const handleAddFrame = () => {
    addFrame(spriteId);
    // 新しいフレームを選択
    dispatch({ type: 'SET_SELECTED_FRAME_INDEX', payload: sprite.frames.length });
    message.success('新しいフレームを追加しました');
  };

  // フレームコピーハンドラ
  const handleCopyFrame = (frameIndex: number) => {
    const frameToCopy = sprite.frames[frameIndex];
    if (!frameToCopy) return;

    // グリッドのディープコピーを作成
    const newGrid = frameToCopy.grid.map(row => [...row]);
    
    // 新しいフレームを作成して追加
    const newFrame = {
      ...frameToCopy,
      id: crypto.randomUUID(),
      grid: newGrid,
    };
    
    // フレームを追加
    dispatch({
      type: 'ADD_FRAME',
      payload: { spriteId, frame: newFrame },
    });
    
    // 新しいフレームを選択
    dispatch({ type: 'SET_SELECTED_FRAME_INDEX', payload: sprite.frames.length });
    message.success('フレームをコピーしました');
  };

  // フレーム削除確認モーダルを表示
  const showDeleteConfirm = (frameIndex: number) => {
    if (sprite.frames.length <= 1) {
      message.error('最後のフレームは削除できません');
      return;
    }
    
    setFrameToDelete(frameIndex);
    setIsModalVisible(true);
  };

  // フレーム削除ハンドラ
  const handleDeleteFrame = () => {
    if (frameToDelete === null) return;
    
    deleteFrame(spriteId, frameToDelete);
    setIsModalVisible(false);
    setFrameToDelete(null);
    message.success('フレームを削除しました');
  };

  // フレーム表示時間変更ハンドラ
  const handleDurationChange = (frameIndex: number, duration: number) => {
    const frame = sprite.frames[frameIndex];
    if (!frame) return;
    
    updateFrame(spriteId, frameIndex, {
      ...frame,
      duration,
    });
  };

  // フレームの順序を入れ替えるハンドラ
  const handleMoveFrame = (frameIndex: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && frameIndex === 0) ||
      (direction === 'right' && frameIndex === sprite.frames.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'left' ? frameIndex - 1 : frameIndex + 1;
    const frames = [...sprite.frames];
    const temp = frames[frameIndex];
    frames[frameIndex] = frames[newIndex];
    frames[newIndex] = temp;
    
    // スプライトを更新
    const updatedSprite = {
      ...sprite,
      frames,
    };
    
    dispatch({ type: 'UPDATE_SPRITE', payload: updatedSprite });
    
    // 選択フレームも移動
    if (appState.selectedFrameIndex === frameIndex) {
      dispatch({ type: 'SET_SELECTED_FRAME_INDEX', payload: newIndex });
    } else if (appState.selectedFrameIndex === newIndex) {
      dispatch({ type: 'SET_SELECTED_FRAME_INDEX', payload: frameIndex });
    }
    
    message.success('フレームの順序を変更しました');
  };

  return (
    <Card
      title="フレーム"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={handleAddFrame}
        >
          追加
        </Button>
      }
    >
      <List
        grid={{ gutter: 8, column: 4 }}
        dataSource={sprite.frames}
        renderItem={(frame, index) => (
          <List.Item>
            <div
              style={{
                border: appState.selectedFrameIndex === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                padding: 4,
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={() => handleSelectFrame(index)}
            >
              <div style={{ marginBottom: 4 }}>
                <PixelGrid
                  spriteId={spriteId}
                  frameIndex={index}
                  scale={8}
                  showGrid={false}
                  editable={false}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>#{index + 1}</span>
                <InputNumber
                  size="small"
                  min={10}
                  max={1000}
                  step={10}
                  value={frame.duration || 100}
                  onChange={(value) => handleDurationChange(index, value as number)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 60 }}
                  addonAfter="ms"
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Tooltip title="左へ移動">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowLeftOutlined />}
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveFrame(index, 'left');
                    }}
                  />
                </Tooltip>
                
                <Tooltip title="コピー">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyFrame(index);
                    }}
                  />
                </Tooltip>
                
                <Tooltip title="削除">
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      showDeleteConfirm(index);
                    }}
                  />
                </Tooltip>
                
                <Tooltip title="右へ移動">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowRightOutlined />}
                    disabled={index === sprite.frames.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveFrame(index, 'right');
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          </List.Item>
        )}
      />
      
      {/* フレーム削除確認モーダル */}
      <Modal
        title="フレームの削除"
        open={isModalVisible}
        onOk={handleDeleteFrame}
        onCancel={() => setIsModalVisible(false)}
        okText="削除"
        okType="danger"
        cancelText="キャンセル"
      >
        <p>このフレームを削除しますか？この操作は元に戻せません。</p>
      </Modal>
    </Card>
  );
};

export default FrameList;

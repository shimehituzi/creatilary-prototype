import React, { useState } from 'react';
import { Card, Tabs, Empty, Button, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import PixelGrid from '../editor/PixelGrid';
import ColorPalette from '../editor/ColorPalette';
import FrameList from '../editor/FrameList';
import AnimationPreview from '../editor/AnimationPreview';
import ToolBar from '../editor/ToolBar';

const { TabPane } = Tabs;
const { Option } = Select;

const AssetDetailPanel: React.FC = () => {
  const { appData, appState, updateSprite } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 現在選択されているスプライトを取得
  const selectedSprite = appData.sprites.find(sprite => sprite.id === appState.selectedSpriteId);

  // スプライト情報編集モーダルを表示
  const showEditModal = () => {
    if (!selectedSprite) return;
    
    form.setFieldsValue({
      name: selectedSprite.name,
      categoryId: selectedSprite.categoryId,
    });
    
    setIsModalVisible(true);
  };

  // モーダル送信ハンドラ
  const handleModalSubmit = () => {
    if (!selectedSprite) return;
    
    form.validateFields().then(values => {
      updateSprite({
        ...selectedSprite,
        name: values.name,
        categoryId: values.categoryId,
      });
      
      setIsModalVisible(false);
      message.success(`スプライト "${values.name}" を更新しました`);
    });
  };

  // スプライトが選択されていない場合
  if (!selectedSprite) {
    return (
      <Card style={{ height: '100%' }}>
        <Empty description="スプライトを選択してください" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{selectedSprite.name}</span>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={showEditModal}
          >
            編集
          </Button>
        </div>
      }
      style={{ height: '100%' }}
    >
      <Tabs defaultActiveKey="editor">
        <TabPane tab="エディタ" key="editor">
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <div style={{ flex: 1, marginRight: 16 }}>
              <ToolBar />
            </div>
            <div style={{ flex: 1 }}>
              <ColorPalette />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <PixelGrid
              spriteId={selectedSprite.id}
              frameIndex={appState.selectedFrameIndex}
              scale={16}
              showGrid={true}
              editable={true}
            />
          </div>
          
          <FrameList spriteId={selectedSprite.id} />
        </TabPane>
        
        <TabPane tab="プレビュー" key="preview">
          <AnimationPreview spriteId={selectedSprite.id} scale={24} />
        </TabPane>
        
        <TabPane tab="情報" key="info">
          <div>
            <p><strong>名前:</strong> {selectedSprite.name}</p>
            <p><strong>カテゴリ:</strong> {appData.categories.find(c => c.id === selectedSprite.categoryId)?.name || '未分類'}</p>
            <p><strong>フレーム数:</strong> {selectedSprite.frames.length}</p>
            <p><strong>作成日時:</strong> {new Date(selectedSprite.createdAt).toLocaleString()}</p>
            <p><strong>更新日時:</strong> {new Date(selectedSprite.updatedAt).toLocaleString()}</p>
          </div>
        </TabPane>
      </Tabs>
      
      {/* スプライト編集モーダル */}
      <Modal
        title="スプライト情報の編集"
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="更新"
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="スプライト名"
            rules={[{ required: true, message: 'スプライト名を入力してください' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="カテゴリ"
            rules={[{ required: true, message: 'カテゴリを選択してください' }]}
          >
            <Select placeholder="カテゴリを選択...">
              {appData.categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AssetDetailPanel;

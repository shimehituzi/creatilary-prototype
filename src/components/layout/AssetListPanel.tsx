import React, { useState, useEffect } from 'react';
import { Card, List, Input, Button, Modal, Form, Select, Empty, Tabs, Radio, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { Sprite } from '../../models/types';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const AssetListPanel: React.FC = () => {
  const { appData, appState, dispatch, createSprite, updateSprite, deleteSprite } = useAppContext();
  const [searchValue, setSearchValue] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSprite, setCurrentSprite] = useState<Sprite | null>(null);
  const [form] = Form.useForm();

  // 選択されたカテゴリに属するスプライトをフィルタリング
  const filteredSprites = appData.sprites.filter(sprite => {
    const matchesCategory = !appState.selectedCategoryId || sprite.categoryId === appState.selectedCategoryId;
    const matchesSearch = !searchValue || sprite.name.toLowerCase().includes(searchValue.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // スプライト選択ハンドラ
  const handleSelectSprite = (spriteId: string) => {
    dispatch({ type: 'SET_SELECTED_SPRITE', payload: spriteId });
  };

  // 新規スプライト作成モーダルを表示
  const showCreateModal = () => {
    setIsEditMode(false);
    setCurrentSprite(null);
    form.resetFields();
    
    // 現在選択されているカテゴリをデフォルト値として設定
    if (appState.selectedCategoryId) {
      form.setFieldsValue({
        categoryId: appState.selectedCategoryId,
      });
    }
    
    setIsModalVisible(true);
  };

  // スプライト編集モーダルを表示
  const showEditModal = (sprite: Sprite) => {
    setIsEditMode(true);
    setCurrentSprite(sprite);
    form.setFieldsValue({
      name: sprite.name,
      categoryId: sprite.categoryId,
    });
    setIsModalVisible(true);
  };

  // スプライト削除確認
  const confirmDeleteSprite = (sprite: Sprite) => {
    Modal.confirm({
      title: 'スプライトの削除',
      content: `スプライト "${sprite.name}" を削除しますか？`,
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk() {
        deleteSprite(sprite.id);
        message.success(`スプライト "${sprite.name}" を削除しました`);
      },
    });
  };

  // モーダル送信ハンドラ
  const handleModalSubmit = () => {
    form.validateFields().then(values => {
      if (isEditMode && currentSprite) {
        // スプライト更新
        updateSprite({
          ...currentSprite,
          name: values.name,
          categoryId: values.categoryId,
        });
        message.success(`スプライト "${values.name}" を更新しました`);
      } else {
        // 新規スプライト作成
        const newSpriteId = createSprite(values.name, values.categoryId);
        dispatch({ type: 'SET_SELECTED_SPRITE', payload: newSpriteId });
        message.success(`スプライト "${values.name}" を作成しました`);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  // スプライトのサムネイル表示
  const renderSpriteThumbnail = (sprite: Sprite) => {
    if (sprite.frames.length === 0) return null;
    
    const frame = sprite.frames[0];
    const palette = appData.palettes.find(p => p.id === appState.selectedPaletteId) || appData.palettes[0];
    
    return (
      <div style={{ width: '64px', height: '64px', border: '1px solid #d9d9d9', position: 'relative' }}>
        <svg width="64" height="64" viewBox="0 0 16 16">
          {frame.grid.map((row, y) => 
            row.map((colorIndex, x) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={colorIndex > 0 && colorIndex < palette.colors.length ? palette.colors[colorIndex] : 'transparent'}
              />
            ))
          )}
        </svg>
      </div>
    );
  };

  // グリッドビューでのレンダリング
  const renderGridView = () => (
    <List
      grid={{ gutter: 16, column: 2 }}
      dataSource={filteredSprites}
      renderItem={sprite => (
        <List.Item>
          <Card
            hoverable
            size="small"
            style={{ 
              cursor: 'pointer',
              border: appState.selectedSpriteId === sprite.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
            }}
            onClick={() => handleSelectSprite(sprite.id)}
            cover={
              <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
                {renderSpriteThumbnail(sprite)}
              </div>
            }
            actions={[
              <EditOutlined key="edit" onClick={(e) => {
                e.stopPropagation();
                showEditModal(sprite);
              }} />,
              <DeleteOutlined key="delete" onClick={(e) => {
                e.stopPropagation();
                confirmDeleteSprite(sprite);
              }} />
            ]}
          >
            <Card.Meta
              title={sprite.name}
              description={
                <span>
                  {appData.categories.find(c => c.id === sprite.categoryId)?.name || '未分類'}
                </span>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  );

  // リストビューでのレンダリング
  const renderListView = () => (
    <List
      dataSource={filteredSprites}
      renderItem={sprite => (
        <List.Item
          key={sprite.id}
          style={{ 
            cursor: 'pointer',
            background: appState.selectedSpriteId === sprite.id ? '#e6f7ff' : 'transparent'
          }}
          onClick={() => handleSelectSprite(sprite.id)}
          actions={[
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                showEditModal(sprite);
              }}
            />,
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                confirmDeleteSprite(sprite);
              }}
            />
          ]}
        >
          <List.Item.Meta
            avatar={renderSpriteThumbnail(sprite)}
            title={sprite.name}
            description={
              <span>
                カテゴリ: {appData.categories.find(c => c.id === sprite.categoryId)?.name || '未分類'}
                <br />
                フレーム数: {sprite.frames.length}
              </span>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <Card
      title="アセット一覧"
      extra={
        <div>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{ marginRight: 8 }}
          >
            <Radio.Button value="grid"><AppstoreOutlined /></Radio.Button>
            <Radio.Button value="list"><UnorderedListOutlined /></Radio.Button>
          </Radio.Group>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={showCreateModal}
          >
            新規
          </Button>
        </div>
      }
      style={{ height: '100%' }}
    >
      <Search
        placeholder="アセットを検索..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      
      {filteredSprites.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderListView()
      ) : (
        <Empty description="アセットがありません" />
      )}
      
      {/* スプライト作成/編集モーダル */}
      <Modal
        title={isEditMode ? 'スプライトの編集' : '新規スプライトの作成'}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={isEditMode ? '更新' : '作成'}
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

export default AssetListPanel;

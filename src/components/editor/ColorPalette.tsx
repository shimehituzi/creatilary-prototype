import React, { useState } from 'react';
import { Card, Button, Row, Col, Tooltip, Modal, Form, Input, ColorPicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { ColorPalette } from '../../models/types';

const ColorPaletteComponent: React.FC = () => {
  const { appData, appState, dispatch, createPalette, updatePalette, deletePalette } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(null);
  const [form] = Form.useForm();

  // 現在選択されているパレット
  const selectedPalette = appData.palettes.find(p => p.id === appState.selectedPaletteId) || appData.palettes[0];

  // パレット選択ハンドラ
  const handleSelectPalette = (paletteId: string) => {
    dispatch({ type: 'SET_SELECTED_PALETTE', payload: paletteId });
  };

  // 色選択ハンドラ
  const handleSelectColor = (colorIndex: number) => {
    dispatch({ type: 'SET_SELECTED_COLOR', payload: colorIndex });
  };

  // 新規パレット作成モーダルを表示
  const showCreateModal = () => {
    setIsEditMode(false);
    setCurrentPalette(null);
    form.resetFields();
    form.setFieldsValue({
      colors: Array(16).fill('#000000'),
    });
    setIsModalVisible(true);
  };

  // パレット編集モーダルを表示
  const showEditModal = (palette: ColorPalette) => {
    setIsEditMode(true);
    setCurrentPalette(palette);
    form.setFieldsValue({
      name: palette.name,
      colors: palette.colors.map(color => color.replace('rgba', 'rgb').replace(/,\s*[0-9.]+\)/, ')')),
    });
    setIsModalVisible(true);
  };

  // パレット削除確認
  const confirmDeletePalette = (palette: ColorPalette) => {
    if (palette.id === appData.palettes[0].id) {
      message.error('デフォルトパレットは削除できません');
      return;
    }

    Modal.confirm({
      title: 'パレットの削除',
      content: `パレット "${palette.name}" を削除しますか？`,
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk() {
        deletePalette(palette.id);
        message.success(`パレット "${palette.name}" を削除しました`);
      },
    });
  };

  // モーダル送信ハンドラ
  const handleModalSubmit = () => {
    form.validateFields().then(values => {
      // RGBをRGBAに変換
      const rgbaColors = values.colors.map((color: string) => {
        if (color.startsWith('rgb(')) {
          return color.replace('rgb(', 'rgba(').replace(')', ', 1)');
        }
        return color;
      });

      if (isEditMode && currentPalette) {
        // パレット更新
        updatePalette({
          ...currentPalette,
          name: values.name,
          colors: rgbaColors,
        });
        message.success(`パレット "${values.name}" を更新しました`);
      } else {
        // 新規パレット作成
        const newPaletteId = createPalette(values.name, rgbaColors);
        dispatch({ type: 'SET_SELECTED_PALETTE', payload: newPaletteId });
        message.success(`パレット "${values.name}" を作成しました`);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <Card
      title="カラーパレット"
      extra={
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={showCreateModal}
            style={{ marginRight: 8 }}
          >
            新規
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(selectedPalette)}
            style={{ marginRight: 8 }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => confirmDeletePalette(selectedPalette)}
            disabled={selectedPalette.id === appData.palettes[0].id}
          />
        </div>
      }
    >
      {/* パレット選択 */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[8, 8]}>
          {appData.palettes.map(palette => (
            <Col key={palette.id} span={8}>
              <Button
                type={palette.id === appState.selectedPaletteId ? 'primary' : 'default'}
                style={{ width: '100%' }}
                onClick={() => handleSelectPalette(palette.id)}
              >
                {palette.name}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {/* 色選択 */}
      <Row gutter={[8, 8]}>
        {selectedPalette.colors.map((color, index) => (
          <Col key={index} span={4}>
            <Tooltip title={`色 ${index}`}>
              <div
                style={{
                  width: '100%',
                  height: 24,
                  backgroundColor: color,
                  border: appState.selectedColor === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  cursor: 'pointer',
                  borderRadius: 4,
                }}
                onClick={() => handleSelectColor(index)}
              />
            </Tooltip>
          </Col>
        ))}
      </Row>

      {/* パレット作成/編集モーダル */}
      <Modal
        title={isEditMode ? 'パレットの編集' : '新規パレットの作成'}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={isEditMode ? '更新' : '作成'}
        cancelText="キャンセル"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="パレット名"
            rules={[{ required: true, message: 'パレット名を入力してください' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="色">
            <Row gutter={[8, 8]}>
              {Array(16).fill(0).map((_, index) => (
                <Col key={index} span={6}>
                  <Form.Item
                    name={['colors', index]}
                    noStyle
                  >
                    <ColorPicker />
                  </Form.Item>
                  <span style={{ marginLeft: 8 }}>色 {index}</span>
                </Col>
              ))}
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ColorPaletteComponent;

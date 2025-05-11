import React, { useState } from 'react';
import { Card, Tree, Input, Button, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined, FolderOpenOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { useAppContext } from '../../context/AppContext';
import { Category } from '../../models/types';

const { Search } = Input;
const { Option } = Select;

const CategoryPanel: React.FC = () => {
  const { appData, appState, dispatch, createCategory, updateCategory, deleteCategory } = useAppContext();
  const [searchValue, setSearchValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // カテゴリツリーデータの生成
  const generateTreeData = (categories: Category[], parentId: string | null = null): DataNode[] => {
    return categories
      .filter(category => category.parentId === parentId)
      .map(category => {
        const children = generateTreeData(categories, category.id);
        return {
          title: category.name,
          key: category.id,
          icon: ({ expanded }: { expanded: boolean }) => 
            expanded ? <FolderOpenOutlined /> : <FolderOutlined />,
          children: children.length > 0 ? children : undefined,
        };
      });
  };

  // 検索フィルタリング
  const filterTreeData = (treeData: DataNode[], searchText: string): DataNode[] => {
    if (!searchText) return treeData;
    
    return treeData
      .map(node => {
        const matchesSearch = node.title?.toString().toLowerCase().includes(searchText.toLowerCase());
        const childrenAfterFilter = node.children ? filterTreeData(node.children, searchText) : [];
        
        if (matchesSearch || childrenAfterFilter.length > 0) {
          return {
            ...node,
            children: childrenAfterFilter,
          };
        }
        return null;
      })
      .filter(Boolean) as DataNode[];
  };

  const treeData = generateTreeData(appData.categories);
  const filteredTreeData = filterTreeData(treeData, searchValue);

  // カテゴリ選択ハンドラ
  const handleSelectCategory = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: selectedKeys[0].toString() });
    } else {
      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: null });
    }
  };

  // 新規カテゴリ作成モーダルを表示
  const showCreateModal = () => {
    setIsEditMode(false);
    setCurrentCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // カテゴリ編集モーダルを表示
  const showEditModal = (category: Category) => {
    setIsEditMode(true);
    setCurrentCategory(category);
    form.setFieldsValue({
      name: category.name,
      parentId: category.parentId,
    });
    setIsModalVisible(true);
  };

  // カテゴリ削除確認
  const confirmDeleteCategory = (category: Category) => {
    Modal.confirm({
      title: 'カテゴリの削除',
      content: `カテゴリ "${category.name}" を削除しますか？このカテゴリに属するすべてのアセットも削除されます。`,
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk() {
        deleteCategory(category.id);
        message.success(`カテゴリ "${category.name}" を削除しました`);
      },
    });
  };

  // モーダル送信ハンドラ
  const handleModalSubmit = () => {
    form.validateFields().then(values => {
      if (isEditMode && currentCategory) {
        // カテゴリ更新
        updateCategory({
          ...currentCategory,
          name: values.name,
          parentId: values.parentId,
        });
        message.success(`カテゴリ "${values.name}" を更新しました`);
      } else {
        // 新規カテゴリ作成
        createCategory(values.name, values.parentId);
        message.success(`カテゴリ "${values.name}" を作成しました`);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  // カテゴリツリーのカスタムタイトルレンダラー
  const renderTreeTitle = (node: DataNode) => {
    const category = appData.categories.find(c => c.id === node.key);
    if (!category) return node.title;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <span>{node.title}</span>
        <div>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              showEditModal(category);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              confirmDeleteCategory(category);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card
      title="カテゴリ"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={showCreateModal}
        >
          新規
        </Button>
      }
      style={{ height: '100%' }}
    >
      <Search
        placeholder="カテゴリを検索..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      
      <Tree
        showIcon
        defaultExpandAll
        selectedKeys={appState.selectedCategoryId ? [appState.selectedCategoryId] : []}
        onSelect={handleSelectCategory}
        treeData={filteredTreeData}
        titleRender={renderTreeTitle}
      />
      
      {/* カテゴリ作成/編集モーダル */}
      <Modal
        title={isEditMode ? 'カテゴリの編集' : '新規カテゴリの作成'}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={isEditMode ? '更新' : '作成'}
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="カテゴリ名"
            rules={[{ required: true, message: 'カテゴリ名を入力してください' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="parentId"
            label="親カテゴリ"
          >
            <Select allowClear placeholder="親カテゴリを選択...">
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

export default CategoryPanel;

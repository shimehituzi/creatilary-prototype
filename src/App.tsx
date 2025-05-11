import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Input, Button, List, Typography, Checkbox, Divider, message } from 'antd';
import type { InputRef } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// Todoアイテムの型定義
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  // ステート管理
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [lastCompositionEndTime, setLastCompositionEndTime] = useState(0);
  const inputRef = useRef<InputRef>(null);
  
  // ローカルストレージからTodoを読み込む
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Todoが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // 新しいTodoを追加
  const handleAddTodo = () => {
    if (inputValue.trim() === '') {
      message.warning('タスクを入力してください');
      return;
    }
    
    const newTodo: TodoItem = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };
    
    setTodos([...todos, newTodo]);
    setInputValue('');
    message.success('タスクを追加しました');
    
    // 入力フィールドにフォーカスを戻す
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Todoの完了状態を切り替え
  const toggleTodoComplete = (id: number) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Todoを削除
  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
    message.success('タスクを削除しました');
  };

  // 残りのタスク数を計算
  const remainingTasks = todos.filter(todo => !todo.completed).length;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          シンプルTodoアプリ
        </Title>
      </Header>
      
      <Content style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          {/* 入力フォーム */}
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <Input
              ref={inputRef}
              placeholder="新しいタスクを入力..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => {
                // 日本語入力確定時のタイムスタンプを記録
                setLastCompositionEndTime(Date.now());
                // Safari対応: 非同期でisComposingを更新
                setTimeout(() => {
                  setIsComposing(false);
                }, 0);
              }}
              // キーダウンイベントを使用（onPressEnterよりも低レベル）
              onKeyDown={(e) => {
                // Enterキーが押された場合
                if (e.key === 'Enter') {
                  // 現在のタイムスタンプを取得
                  const now = Date.now();
                  
                  // 日本語入力確定から一定時間（300ms）以内のEnterキーは無視する
                  // これによりSafariでの問題に対応
                  if (now - lastCompositionEndTime < 300) {
                    e.preventDefault(); // イベントをキャンセル
                    return;
                  }
                  
                  // IME入力中の場合は処理しない
                  if (isComposing || e.nativeEvent.isComposing) {
                    e.preventDefault();
                    return;
                  }
                  
                  // フォーム送信を防止
                  e.preventDefault();
                  
                  // Safari対応: 非同期でタスク追加を実行
                  setTimeout(() => {
                    handleAddTodo();
                  }, 10);
                }
              }}
              style={{ marginRight: '10px' }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddTodo}
            >
              追加
            </Button>
          </div>
          
          <Divider />
          
          {/* タスク統計 */}
          <div style={{ marginBottom: '20px' }}>
            <Typography.Text>
              残りのタスク: {remainingTasks} / {todos.length}
            </Typography.Text>
          </div>
          
          {/* Todoリスト */}
          <List
            bordered
            dataSource={todos}
            renderItem={(todo) => (
              <List.Item
                actions={[
                  <Button 
                    key="delete"
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDeleteTodo(todo.id)}
                  />
                ]}
              >
                <Checkbox
                  checked={todo.completed}
                  onChange={() => toggleTodoComplete(todo.id)}
                />
                <span
                  style={{
                    marginLeft: '10px',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#999' : 'inherit',
                  }}
                >
                  {todo.text}
                </span>
              </List.Item>
            )}
          />
        </Card>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        Ant Design Todoアプリ ©{new Date().getFullYear()} 初心者向けハンズオン
      </Footer>
    </Layout>
  );
};

export default App;


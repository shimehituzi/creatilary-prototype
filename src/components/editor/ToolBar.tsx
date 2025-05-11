import React from 'react';
import { Card, Button, Tooltip, Space } from 'antd';
import { EditOutlined, EraserOutlined, BgColorsOutlined, EyeOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { EditorTool } from '../../models/types';

const ToolBar: React.FC = () => {
  const { appState, dispatch, exportData, importData } = useAppContext();

  // ツール選択ハンドラ
  const handleSelectTool = (tool: EditorTool) => {
    dispatch({ type: 'SET_CURRENT_TOOL', payload: tool });
  };

  // エクスポートハンドラ
  const handleExport = () => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixel-art-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // インポートハンドラ
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          importData(jsonData);
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <Card title="ツール">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Tooltip title="ペンツール">
            <Button
              type={appState.currentTool === EditorTool.PENCIL ? 'primary' : 'default'}
              icon={<EditOutlined />}
              onClick={() => handleSelectTool(EditorTool.PENCIL)}
            />
          </Tooltip>
          
          <Tooltip title="消しゴムツール">
            <Button
              type={appState.currentTool === EditorTool.ERASER ? 'primary' : 'default'}
              icon={<EraserOutlined />}
              onClick={() => handleSelectTool(EditorTool.ERASER)}
            />
          </Tooltip>
          
          <Tooltip title="塗りつぶしツール">
            <Button
              type={appState.currentTool === EditorTool.FILL ? 'primary' : 'default'}
              icon={<BgColorsOutlined />}
              onClick={() => handleSelectTool(EditorTool.FILL)}
            />
          </Tooltip>
          
          <Tooltip title="スポイトツール">
            <Button
              type={appState.currentTool === EditorTool.EYEDROPPER ? 'primary' : 'default'}
              icon={<EyeOutlined />}
              onClick={() => handleSelectTool(EditorTool.EYEDROPPER)}
            />
          </Tooltip>
        </div>
        
        <div style={{ marginTop: 16 }}>
          <Tooltip title="エクスポート">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              style={{ marginRight: 8 }}
            >
              エクスポート
            </Button>
          </Tooltip>
          
          <Tooltip title="インポート">
            <Button
              icon={<UploadOutlined />}
              onClick={handleImport}
            >
              インポート
            </Button>
          </Tooltip>
        </div>
      </Space>
    </Card>
  );
};

export default ToolBar;

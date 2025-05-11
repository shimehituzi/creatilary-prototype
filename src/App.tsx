import React from 'react';
import { ConfigProvider } from 'antd';
import MainLayout from './components/layout/MainLayout.tsx';
import { AppProvider } from './context/AppContext.tsx';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ConfigProvider>
  );
};

export default App;


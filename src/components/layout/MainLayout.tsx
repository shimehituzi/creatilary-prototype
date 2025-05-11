import React from 'react';
import { Layout } from 'antd';
import CategoryPanel from './CategoryPanel';
import AssetListPanel from './AssetListPanel';
import AssetDetailPanel from './AssetDetailPanel';

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <h1 style={{ color: 'white', margin: 0 }}>ドット絵アセット管理</h1>
      </Header>
      
      <Content style={{ padding: '16px', display: 'flex', flexDirection: 'row' }}>
        {/* 3パネルレイアウト */}
        <div style={{ width: '20%', marginRight: '16px' }}>
          <CategoryPanel />
        </div>
        
        <div style={{ width: '30%', marginRight: '16px' }}>
          <AssetListPanel />
        </div>
        
        <div style={{ width: '50%' }}>
          <AssetDetailPanel />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        ドット絵アセット管理アプリ ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default MainLayout;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { BasicLayout } from './layouts/BasicLayout';
import ProgramEditor from './pages/ProgramEditor';

dayjs.locale('ru');

const App: React.FC = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BasicLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<div>Dashboard Placeholder</div>} />
            <Route path="events/:id/program" element={<ProgramEditor />} />
            <Route path="sales" element={<div>Sales Placeholder</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;

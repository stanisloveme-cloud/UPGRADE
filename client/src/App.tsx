import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { BasicLayout } from './layouts/BasicLayout';
import ProgramEditor from './pages/ProgramEditor';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import EventsList from './pages/EventsList';
import SpeakersList from './pages/SpeakersList';

dayjs.locale('ru');

const App: React.FC = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<RequireAuth><BasicLayout /></RequireAuth>}>
              <Route index element={<Navigate to="/events" replace />} />
              <Route path="events" element={<EventsList />} />
              <Route path="speakers" element={<SpeakersList />} />
              <Route path="dashboard" element={<Navigate to="/events" replace />} />
              <Route path="events/:id/program" element={<ProgramEditor />} />
              <Route path="sales" element={<div>Sales Placeholder</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;

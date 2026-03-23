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
import UsersList from './pages/UsersList';
import ProfilePage from './pages/Profile';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import BrandApproval from './pages/BrandApproval';
import BrandsCheck from './pages/BrandsCheck';
import SpeakerMemoPage from './pages/SpeakerMemoPage';
import SystemStatus from './pages/SystemStatus';
import ModeratorPrint from './pages/PrintViews/ModeratorPrint';
import NameplatesPrint from './pages/PrintViews/NameplatesPrint';
import TildaIntegrationPage from './pages/TildaIntegration';

dayjs.locale('ru');

const App: React.FC = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/brand-approval/:hash" element={<BrandApproval />} />
            <Route path="/speaker-memo/:hash" element={<SpeakerMemoPage />} />
            
            {/* Dedicated Print Routes (Require Auth but no BasicLayout to stay clean) */}
            <Route path="/print/session/:id/moderator" element={<RequireAuth><ModeratorPrint /></RequireAuth>} />
            <Route path="/print/session/:id/nameplates" element={<RequireAuth><NameplatesPrint /></RequireAuth>} />

            <Route path="/" element={<RequireAuth><BasicLayout /></RequireAuth>}>
              <Route index element={<Navigate to="/events" replace />} />
              <Route path="events" element={<EventsList />} />
              <Route path="speakers" element={<SpeakersList />} />
              <Route path="dashboard" element={<Navigate to="/events" replace />} />
              <Route path="events/:id/program" element={<ProgramEditor />} />
              <Route path="sales" element={<div>Sales Placeholder</div>} />
              <Route path="brands-check" element={<BrandsCheck />} />
              <Route path="system-status" element={<SystemStatus />} />
              <Route path="tilda-integration" element={<TildaIntegrationPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings/users" element={<UsersList />} />
              <Route path="*" element={<Navigate to="/events" replace />} />
            </Route>

            {/* Global catch-all. If unauthenticated, will redirect to events which requires auth, so to login. */}
            <Route path="*" element={<Navigate to="/events" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
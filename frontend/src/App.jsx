import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import FamilyMembersPage from './pages/FamilyMembersPage';
import AppliancesPage from './pages/AppliancesPage';
import Module1DataPage from './pages/Module1DataPage';
import Module2MLPage from './pages/Module2MLPage';
import Module3OptPage from './pages/Module3OptPage';
import EnergyHistoryPage from './pages/EnergyHistoryPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import FacultyDemoPage from './pages/FacultyDemoPage';
import SystemActivityPage from './pages/SystemActivityPage';
import MLExperimentsPage from './pages/MLExperimentsPage';
import IoTDevicesPage from './pages/IoTDevicesPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Page */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected Multi-Property Family Shell */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/family" element={<FamilyMembersPage />} />
            <Route path="/appliances" element={<AppliancesPage />} />

            {/* The 3 Core Academic Project Modules */}
            <Route path="/module1-data" element={<Module1DataPage />} />
            <Route path="/module2-ml" element={<Module2MLPage />} />
            <Route path="/module3-opt" element={<Module3OptPage />} />

            {/* Faculty Viva & System Diagnostics */}
            <Route path="/demo" element={<FacultyDemoPage />} />
            <Route path="/experiments" element={<MLExperimentsPage />} />
            <Route path="/activity" element={<SystemActivityPage />} />
            <Route path="/iot-devices" element={<IoTDevicesPage />} />

            {/* Auxiliary Pages */}
            <Route path="/history" element={<EnergyHistoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

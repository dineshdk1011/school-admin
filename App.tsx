
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobApplications from './pages/JobApplications';
import AdmissionApplications from './pages/AdmissionApplications';
import ContactMessages from './pages/ContactMessages';

const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        );
    }
    
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/job-applications" element={<JobApplications />} />
                <Route path="/admission-applications" element={<AdmissionApplications />} />
                <Route path="/contact-messages" element={<ContactMessages />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </AuthProvider>
    );
}

export default App;

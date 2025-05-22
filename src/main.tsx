import React from 'react';
import ReactDOM from 'react-dom/client';
import { StorageDashboardPage } from './app/bootstraps/StorageDashboardPage';
import './globals.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <StorageDashboardPage />
    </React.StrictMode>
);

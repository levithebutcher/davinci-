import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-root">
      <Navbar />
      <main className="main-content" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

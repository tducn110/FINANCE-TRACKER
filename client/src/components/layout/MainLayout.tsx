import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const token = localStorage.getItem('token');
  
  // Protect routes - if no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Use Flexbox to ensure the layout scales well responsively
  return (
    <div className="flex h-screen bg-gray-50 font-inter overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="lg:pl-60">
        <main className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import OrganizerSidebar from '@organizer/components/OrganizerSidebar';

export default function OrganizerLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <OrganizerSidebar />
      <div className="lg:pl-64">
        <main className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

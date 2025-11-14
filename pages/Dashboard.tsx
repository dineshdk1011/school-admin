import React from 'react';
import StatCard from '../components/ui/StatCard';
import { MOCK_JOB_APPLICATIONS, MOCK_ADMISSION_APPLICATIONS, MOCK_CONTACT_MESSAGES } from '../constants';
// FIX: Import the Card component.
import Card from '../components/ui/Card';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Job Applications"
          value={MOCK_JOB_APPLICATIONS.length}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          title="Total Admission Applications"
          value={MOCK_ADMISSION_APPLICATIONS.length}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>}
        />
        <StatCard
          title="Total Contact Messages"
          value={MOCK_CONTACT_MESSAGES.length}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
      </div>
       <div className="mt-8">
            <Card>
                <h3 className="text-xl font-bold text-primary mb-4">Welcome to the Admin Panel</h3>
                <p className="text-gray-600">
                    Use the navigation on the left to manage job applications, school admissions, and contact messages. You can view, search, filter, and edit records as needed.
                </p>
            </Card>
        </div>
    </div>
  );
};

export default Dashboard;
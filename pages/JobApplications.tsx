
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import { JobApplication, Status } from '../types';
import { MOCK_JOB_APPLICATIONS, STATUS_OPTIONS } from '../constants';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';

const ITEMS_PER_PAGE = 5;

const JobApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>(MOCK_JOB_APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableApp, setEditableApp] = useState<JobApplication | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => {
        if (statusFilter !== 'All' && app.status !== statusFilter) {
          return false;
        }
        if (debouncedSearchTerm && !app.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) && !app.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [applications, debouncedSearchTerm, statusFilter]);
  
  const { currentData, currentPage, maxPage, jump, next, prev } = usePagination({ data: filteredApplications, itemsPerPage: ITEMS_PER_PAGE });

  useEffect(() => {
    if (currentPage > maxPage && maxPage > 0) {
      jump(maxPage);
    }
  }, [filteredApplications, currentPage, maxPage, jump]);

  const handleView = (app: JobApplication) => {
    setSelectedApp(app);
    setEditableApp({ ...app });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
    setEditableApp(null);
  };

  const handleSave = () => {
    if (editableApp) {
      setApplications(prev => prev.map(app => app.id === editableApp.id ? editableApp : app));
      handleCloseModal();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editableApp) {
      setEditableApp({ ...editableApp, [e.target.name]: e.target.value });
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Job Applications</h2>
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
            </Select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Position</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map(app => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-700">{app.id}</td>
                  <td className="p-3 text-sm font-medium text-gray-900">{app.name}</td>
                  <td className="p-3 text-sm text-gray-700">{app.email}</td>
                  <td className="p-3 text-sm text-gray-700">{app.position}</td>
                  <td className="p-3 text-sm text-gray-700"><Badge status={app.status} /></td>
                  <td className="p-3 text-sm text-gray-700">{app.createdAt}</td>
                  <td className="p-3 text-sm text-gray-700">
                    <Button variant="secondary" onClick={() => handleView(app)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} maxPage={maxPage} onPrev={prev} onNext={next} onJump={jump} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Application: ${selectedApp?.id}`}
        footer={
          <div className="space-x-2">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        }
      >
        {editableApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Name" name="name" value={editableApp.name} onChange={handleInputChange} />
              <Input label="Email" name="email" type="email" value={editableApp.email} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="City" name="city" value={editableApp.city} onChange={handleInputChange} />
              <Input label="Position Applied For" name="position" value={editableApp.position} onChange={handleInputChange} />
            </div>
            <div>
              <Select label="Status" name="status" value={editableApp.status} onChange={handleInputChange}>
                {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
              </Select>
            </div>
            <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</p>
                <p className="text-gray-600 p-2 border rounded-md bg-gray-50">{editableApp.coverLetter}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobApplications;


import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import { ContactMessage, Status } from '../types';
import { MOCK_CONTACT_MESSAGES, STATUS_OPTIONS } from '../constants';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';

const ITEMS_PER_PAGE = 5;

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>(MOCK_CONTACT_MESSAGES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableMsg, setEditableMsg] = useState<ContactMessage | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredMessages = useMemo(() => {
    return messages
      .filter(msg => {
        if (statusFilter !== 'All' && msg.status !== statusFilter) {
          return false;
        }
        const fullName = `${msg.firstName} ${msg.lastName}`.toLowerCase();
        if (debouncedSearchTerm && !fullName.includes(debouncedSearchTerm.toLowerCase()) && !msg.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [messages, debouncedSearchTerm, statusFilter]);

  const { currentData, currentPage, maxPage, jump, next, prev } = usePagination({ data: filteredMessages, itemsPerPage: ITEMS_PER_PAGE });

   useEffect(() => {
    if (currentPage > maxPage && maxPage > 0) {
      jump(maxPage);
    }
  }, [filteredMessages, currentPage, maxPage, jump]);

  const handleView = (msg: ContactMessage) => {
    setSelectedMsg(msg);
    setEditableMsg({ ...msg });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMsg(null);
    setEditableMsg(null);
  };

  const handleSave = () => {
    if (editableMsg) {
      setMessages(prev => prev.map(msg => msg.id === editableMsg.id ? editableMsg : msg));
      handleCloseModal();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editableMsg) {
      setEditableMsg({ ...editableMsg, status: e.target.value as Status });
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Contact Messages</h2>
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
                <th className="p-3 text-sm font-semibold text-gray-600">Subject</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map(msg => (
                <tr key={msg.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-700">{msg.id}</td>
                  <td className="p-3 text-sm font-medium text-gray-900">{`${msg.firstName} ${msg.lastName}`}</td>
                  <td className="p-3 text-sm text-gray-700">{msg.email}</td>
                  <td className="p-3 text-sm text-gray-700">{msg.subject}</td>
                  <td className="p-3 text-sm text-gray-700"><Badge status={msg.status} /></td>
                  <td className="p-3 text-sm text-gray-700">{msg.createdAt}</td>
                  <td className="p-3 text-sm text-gray-700">
                    <Button variant="secondary" onClick={() => handleView(msg)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} maxPage={maxPage} onPrev={prev} onNext={next} onJump={jump} />
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Message: ${selectedMsg?.subject}`}
        footer={
          <div className="space-x-2">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSave}>Save Status</Button>
          </div>
        }
      >
        {editableMsg && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="block text-sm font-medium text-gray-700 mb-1">From</p>
                    <p className="text-gray-800 font-semibold">{`${editableMsg.firstName} ${editableMsg.lastName}`}</p>
                </div>
                 <div>
                    <p className="block text-sm font-medium text-gray-700 mb-1">Email</p>
                    <p className="text-gray-800">{editableMsg.email}</p>
                </div>
            </div>
             <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">Message</p>
                <p className="text-gray-600 p-3 border rounded-md bg-gray-50 min-h-[100px]">{editableMsg.message}</p>
            </div>
            <div>
              <Select label="Status" name="status" value={editableMsg.status} onChange={handleStatusChange}>
                {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContactMessages;

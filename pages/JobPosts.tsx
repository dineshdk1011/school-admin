
import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import { JobPost, JobApplicationWithJob, Status } from '../types';
import { STATUS_OPTIONS } from '../constants';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';

// Firebase configuration for Firestore/Database
const firestoreConfig = {
  apiKey: "AIzaSyA1mtHVRk0TyWhGFc50JGfVMsFK4tLoxWg",
  authDomain: "pranav-global-school---pgs.firebaseapp.com",
  projectId: "pranav-global-school---pgs",
  storageBucket: "pranav-global-school---pgs.firebasestorage.app",
  messagingSenderId: "1052193372039",
  appId: "1:1052193372039:web:f38831d3dbf591eee7c522"
};

// Initialize Firebase app for Firestore
const firestoreApp = initializeApp(firestoreConfig, 'jobpost-firestore');
const db = getFirestore(firestoreApp);

const ITEMS_PER_PAGE = 5;

const JobPosts: React.FC = () => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobPost | null>(null);
  const [applications, setApplications] = useState<JobApplicationWithJob[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  
  // Form state for new job
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    type: 'Full-time',
    requirements: '',
    salary: '',
    status: 'active' as 'active' | 'closed'
  });

  // Form state for editing job
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);

  // Load job posts from Firestore
  useEffect(() => {
    loadJobPosts();
  }, []);

  const loadJobPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobPostsRef = collection(db, 'jobPosts');
      const snapshot = await getDocs(jobPostsRef);
      
      const posts: JobPost[] = [];
      
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        
        // Convert Firestore Timestamp to string
        let createdAtStr = '';
        let updatedAtStr = '';
        
        if (data.createdAt) {
          if (data.createdAt instanceof Timestamp) {
            createdAtStr = data.createdAt.toDate().toLocaleDateString();
          } else if (data.createdAt.toDate) {
            createdAtStr = data.createdAt.toDate().toLocaleDateString();
          } else {
            createdAtStr = new Date(data.createdAt).toLocaleDateString();
          }
        } else {
          createdAtStr = new Date().toLocaleDateString();
        }
        
        if (data.updatedAt) {
          if (data.updatedAt instanceof Timestamp) {
            updatedAtStr = data.updatedAt.toDate().toLocaleDateString();
          } else if (data.updatedAt.toDate) {
            updatedAtStr = data.updatedAt.toDate().toLocaleDateString();
          } else {
            updatedAtStr = new Date(data.updatedAt).toLocaleDateString();
          }
        } else {
          updatedAtStr = createdAtStr;
        }
        
        posts.push({
          id: docSnapshot.id,
          title: data.title || '',
          description: data.description || '',
          department: data.department || '',
          location: data.location || '',
          type: data.type || 'Full-time',
          requirements: data.requirements || '',
          salary: data.salary || '',
          status: data.status || 'active',
          createdAt: createdAtStr,
          updatedAt: updatedAtStr
        });
      });
      
      // Sort by createdAt (newest first)
      posts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setJobPosts(posts);
    } catch (err: any) {
      console.error('Error loading job posts:', err);
      setError('Failed to load job posts. Please check Firestore permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    try {
      setError(null);
      
      if (!newJob.title || !newJob.description || !newJob.department) {
        setError('Please fill in all required fields (Title, Description, Department)');
        return;
      }
      
      const now = new Date();
      await addDoc(collection(db, 'jobPosts'), {
        title: newJob.title,
        description: newJob.description,
        department: newJob.department,
        location: newJob.location,
        type: newJob.type,
        requirements: newJob.requirements,
        salary: newJob.salary || '',
        status: newJob.status,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      });
      
      // Reset form
      setNewJob({
        title: '',
        description: '',
        department: '',
        location: '',
        type: 'Full-time',
        requirements: '',
        salary: '',
        status: 'active'
      });
      
      setIsAddModalOpen(false);
      loadJobPosts();
    } catch (err: any) {
      console.error('Error adding job post:', err);
      setError(`Failed to add job post: ${err.message}`);
    }
  };

  const handleEditJob = (post: JobPost) => {
    setEditingJob(post);
    setIsEditModalOpen(true);
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    
    try {
      setError(null);
      
      if (!editingJob.title || !editingJob.description || !editingJob.department) {
        setError('Please fill in all required fields (Title, Description, Department)');
        return;
      }
      
      const now = new Date();
      const jobRef = doc(db, 'jobPosts', editingJob.id);
      await updateDoc(jobRef, {
        title: editingJob.title,
        description: editingJob.description,
        department: editingJob.department,
        location: editingJob.location,
        type: editingJob.type,
        requirements: editingJob.requirements,
        salary: editingJob.salary || '',
        status: editingJob.status,
        updatedAt: Timestamp.fromDate(now)
      });
      
      setIsEditModalOpen(false);
      setEditingJob(null);
      loadJobPosts();
    } catch (err: any) {
      console.error('Error updating job post:', err);
      setError(`Failed to update job post: ${err.message}`);
    }
  };

  const handleDeleteJob = (post: JobPost) => {
    setJobToDelete(post);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      setError(null);
      const jobRef = doc(db, 'jobPosts', jobToDelete.id);
      await deleteDoc(jobRef);
      
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
      loadJobPosts();
    } catch (err: any) {
      console.error('Error deleting job post:', err);
      setError(`Failed to delete job post: ${err.message}`);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (editingJob) {
      setEditingJob({ ...editingJob, [e.target.name]: e.target.value });
    }
  };

  const handleViewApplications = async (jobId: string, jobTitle: string) => {
    try {
      setSelectedJobId(jobId);
      setLoadingApplications(true);
      setError(null);
      
      // Get job post by ID to get the exact title
      const jobDocRef = doc(db, 'jobPosts', jobId);
      const jobDocSnap = await getDoc(jobDocRef);
      
      const jobTitleFromPost = jobDocSnap.exists() 
        ? (jobDocSnap.data().title || jobTitle)
        : jobTitle;
      
      // Get all job applications and filter by position matching job title
      const jobApplicationsRef = collection(db, 'jobApplications');
      const snapshot = await getDocs(jobApplicationsRef);
      
      const apps: JobApplicationWithJob[] = [];
      
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        
        // Check if the application's position matches the job title
        if (data.position === jobTitleFromPost) {
          let createdAtStr = '';
          if (data.createdAt) {
            if (data.createdAt instanceof Timestamp) {
              createdAtStr = data.createdAt.toDate().toLocaleDateString();
            } else if (data.createdAt.toDate) {
              createdAtStr = data.createdAt.toDate().toLocaleDateString();
            } else {
              createdAtStr = new Date(data.createdAt).toLocaleDateString();
            }
          } else {
            createdAtStr = new Date().toLocaleDateString();
          }
          
          apps.push({
            id: docSnapshot.id,
            jobPostId: jobId,
            jobTitle: jobTitleFromPost,
            name: data.fullName || data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            city: data.city || '',
            position: data.position || '',
            resumeUrl: data.resumeUrl || '',
            coverLetter: data.coverLetter || data.message || '',
            status: (data.status as Status) || Status.New,
            createdAt: createdAtStr
          });
        }
      });
      
      // Sort by createdAt (newest first)
      apps.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setApplications(apps);
      setIsApplicationsModalOpen(true);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(`Failed to load applications: ${err.message}`);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, newStatus: Status) => {
    try {
      setError(null);
      const appRef = doc(db, 'jobApplications', appId);
      await updateDoc(appRef, {
        status: newStatus
      });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err: any) {
      console.error('Error updating application status:', err);
      setError(`Failed to update application status: ${err.message}`);
    }
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredJobPosts = useMemo(() => {
    return jobPosts
      .filter(post => {
        if (statusFilter !== 'All' && post.status !== statusFilter) {
          return false;
        }
        if (debouncedSearchTerm && 
            !post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
            !post.department.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [jobPosts, debouncedSearchTerm, statusFilter]);
  
  const { currentData, currentPage, maxPage, jump, next, prev } = usePagination({ 
    data: filteredJobPosts, 
    itemsPerPage: ITEMS_PER_PAGE 
  });

  useEffect(() => {
    if (currentPage > maxPage && maxPage > 0) {
      jump(maxPage);
    }
  }, [filteredJobPosts, currentPage, maxPage, jump]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary">Job Posts</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Add New Job
        </Button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <Input
              type="text"
              placeholder="Search by title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </Select>
            <Button onClick={loadJobPosts} variant="secondary" className="text-sm px-3 py-2">
              Refresh
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading job posts...</div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No job posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-sm font-semibold text-gray-600">Title</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Department</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Location</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Type</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Created</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map(post => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-900">{post.title}</td>
                    <td className="p-3 text-sm text-gray-700">{post.department}</td>
                    <td className="p-3 text-sm text-gray-700">{post.location || 'N/A'}</td>
                    <td className="p-3 text-sm text-gray-700">{post.type}</td>
                    <td className="p-3 text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{post.createdAt}</td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleViewApplications(post.id, post.title)}
                          className="text-xs px-2 py-1"
                        >
                          View Applications
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleEditJob(post)}
                          className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-black border-0"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleDeleteJob(post)}
                          className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white border-0"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && currentData.length > 0 && (
          <Pagination currentPage={currentPage} maxPage={maxPage} onPrev={prev} onNext={next} onJump={jump} />
        )}
      </Card>

      {/* Add New Job Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Job Post"
        footer={
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddJob}>Add Job</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Job Title *" 
            name="title" 
            value={newJob.title} 
            onChange={handleInputChange}
            placeholder="e.g., Mathematics Teacher"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={newJob.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Job description and responsibilities..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Department *" 
              name="department" 
              value={newJob.department} 
              onChange={handleInputChange}
              placeholder="e.g., Academic, Administration"
            />
            <Input 
              label="Location" 
              name="location" 
              value={newJob.location} 
              onChange={handleInputChange}
              placeholder="e.g., New York, Remote"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Job Type" 
              name="type" 
              value={newJob.type} 
              onChange={handleInputChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
            </Select>
            <Select 
              label="Status" 
              name="status" 
              value={newJob.status} 
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
          <Input 
            label="Salary (Optional)" 
            name="salary" 
            value={newJob.salary} 
            onChange={handleInputChange}
            placeholder="e.g., $50,000 - $70,000"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea
              name="requirements"
              value={newJob.requirements}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Required qualifications, experience, skills..."
            />
          </div>
        </div>
      </Modal>

      {/* Edit Job Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingJob(null);
        }} 
        title="Edit Job Post"
        footer={
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => {
              setIsEditModalOpen(false);
              setEditingJob(null);
            }}>Cancel</Button>
            <Button onClick={handleUpdateJob}>Update Job</Button>
          </div>
        }
      >
        {editingJob && (
          <div className="space-y-4">
            <Input 
              label="Job Title *" 
              name="title" 
              value={editingJob.title} 
              onChange={handleEditInputChange}
              placeholder="e.g., Mathematics Teacher"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={editingJob.description}
                onChange={handleEditInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Job description and responsibilities..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Department *" 
                name="department" 
                value={editingJob.department} 
                onChange={handleEditInputChange}
                placeholder="e.g., Academic, Administration"
              />
              <Input 
                label="Location" 
                name="location" 
                value={editingJob.location} 
                onChange={handleEditInputChange}
                placeholder="e.g., New York, Remote"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label="Job Type" 
                name="type" 
                value={editingJob.type} 
                onChange={handleEditInputChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </Select>
              <Select 
                label="Status" 
                name="status" 
                value={editingJob.status} 
                onChange={handleEditInputChange}
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <Input 
              label="Salary (Optional)" 
              name="salary" 
              value={editingJob.salary || ''} 
              onChange={handleEditInputChange}
              placeholder="e.g., $50,000 - $70,000"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <textarea
                name="requirements"
                value={editingJob.requirements}
                onChange={handleEditInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Required qualifications, experience, skills..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => {
          setIsDeleteModalOpen(false);
          setJobToDelete(null);
        }} 
        title="Delete Job Post"
        footer={
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => {
              setIsDeleteModalOpen(false);
              setJobToDelete(null);
            }}>Cancel</Button>
            <Button 
              onClick={confirmDeleteJob}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </div>
        }
      >
        {jobToDelete && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this job post? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-semibold text-gray-900">{jobToDelete.title}</p>
              <p className="text-sm text-gray-600 mt-1">{jobToDelete.department} • {jobToDelete.location || 'N/A'}</p>
            </div>
            <p className="text-sm text-red-600">
              ⚠️ Note: This will not delete the job applications associated with this post.
            </p>
          </div>
        )}
      </Modal>

      {/* View Applications Modal */}
      <Modal 
        isOpen={isApplicationsModalOpen} 
        onClose={() => {
          setIsApplicationsModalOpen(false);
          setApplications([]);
          setSelectedJobId(null);
        }} 
        title={`Job Applications - ${applications.length > 0 ? applications[0].jobTitle : 'Loading...'}`}
        footer={
          <div>
            <Button variant="secondary" onClick={() => {
              setIsApplicationsModalOpen(false);
              setApplications([]);
              setSelectedJobId(null);
            }}>Close</Button>
          </div>
        }
      >
        {loadingApplications ? (
          <div className="text-center py-8 text-gray-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No applications found for this job.</div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {applications.map(app => (
              <Card key={app.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">{app.name}</h4>
                    <p className="text-sm text-gray-600">{app.email}</p>
                    <p className="text-sm text-gray-600">{app.phone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge status={app.status} />
                    <Select
                      value={app.status}
                      onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value as Status)}
                      className="text-xs"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">City:</span> {app.city || 'N/A'}
                  </div>
                  <div>
                    <span className="text-gray-600">Applied:</span> {app.createdAt}
                  </div>
                </div>
                {app.resumeUrl && (
                  <div className="mb-3">
                    <a 
                      href={app.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline text-sm"
                    >
                      View Resume →
                    </a>
                  </div>
                )}
                {app.coverLetter && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                    <p className="text-sm text-gray-600 p-2 border rounded-md bg-gray-50 whitespace-pre-wrap">
                      {app.coverLetter}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobPosts;

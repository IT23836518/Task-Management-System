import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { DashboardStats } from './components/DashboardStats';
import { TaskCard, type Task } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import API from './services/api';
import { Plus, Search, LogOut, CheckSquare } from 'lucide-react';
import './App.css';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  // Tasks & Metrics State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });

  // Query / Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Loading & Error States
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Fetch Tasks and Metrics
  const fetchTasksAndMetrics = async () => {
    if (!user) return;
    setLoadingData(true);
    setError(null);
    try {
      // Build query params
      const params: any = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      params.sortBy = sortBy;

      const [tasksRes, metricsRes] = await Promise.all([
        API.get('/tasks', { params }),
        API.get('/tasks/metrics')
      ]);

      setTasks(tasksRes.data.data);
      setMetrics(metricsRes.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve workspace data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchTasksAndMetrics();
  }, [user, debouncedSearch, statusFilter, priorityFilter, sortBy]);

  // 3. Quick Status Toggle from Task Card
  const handleStatusChange = async (id: string, newStatus: Task['status']) => {
    try {
      await API.put(`/tasks/${id}`, { status: newStatus });
      // Refresh tasks and metrics
      fetchTasksAndMetrics();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // 4. Delete Task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasksAndMetrics();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  // 5. Open Modal for Create
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // 6. Open Modal for Edit
  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // 7. Handle Modal Form Submit (Both Create and Edit)
  const handleModalSubmit = async (taskData: {
    title: string;
    description: string | null;
    priority: Task['priority'];
    status: Task['status'];
    dueDate: string;
  }) => {
    try {
      if (taskToEdit) {
        // Edit flow
        await API.put(`/tasks/${taskToEdit.id}`, taskData);
      } else {
        // Create flow
        await API.post('/tasks', taskData);
      }
      fetchTasksAndMetrics();
    } catch (err: any) {
      throw err.response?.data?.message || 'Action failed. Please try again.';
    }
  };

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '16px' }}>Loading workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="dashboard-container">
      {/* Background blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Header bar */}
      <header className="dashboard-header">
        <div className="user-profile">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h4>{user.name}</h4>
            <span>{user.email}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="brand-logo-container" style={{ width: '32px', height: '32px', margin: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="#FFC107" stroke="#FFC107" strokeWidth="3" />
            </svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginRight: '16px' }}>Koncepthive</span>
          <button onClick={logout} className="logout-btn" title="Log Out">
            <LogOut size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Metrics Section */}
      <DashboardStats metrics={metrics} />

      {/* Control bar */}
      <div className="controls-bar">
        <div className="search-filter-group">
          {/* Search */}
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority filter */}
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>

          {/* Sort selection */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest Created</option>
            <option value="oldest">Oldest Created</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        {/* Create Task Action */}
        <button onClick={handleOpenCreateModal} className="create-task-btn">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="error-banner" style={{ marginBottom: '32px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Tasks listing */}
      {loadingData && tasks.length === 0 ? (
        <div className="app-loading-screen" style={{ minHeight: '30vh' }}>
          <div className="app-loading-spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px' }}>Updating workspace view...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="no-tasks-panel">
          <CheckSquare size={48} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
          <h4>No tasks found</h4>
          <p>
            {searchTerm || statusFilter || priorityFilter 
              ? 'No tasks match your search or filter settings.' 
              : 'Your workspace is clear! Click "New Task" to create one.'}
          </p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

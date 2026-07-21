import React from 'react';
import { Calendar, Edit, Trash2, AlertCircle } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) => {
  const isOverdue = (): boolean => {
    if (task.status === 'COMPLETED') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDate = (dateStr: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const overdue = isOverdue();

  return (
    <div className={`task-card ${overdue ? 'task-card-overdue' : ''}`}>
      {/* Top badges bar */}
      <div className="task-card-meta">
        <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
          {task.priority} Priority
        </span>
        
        {/* Clickable/Selectable Status Dropdown for Premium UX */}
        <select 
          value={task.status} 
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
          className={`status-dropdown dropdown-${task.status.toLowerCase()}`}
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Task Content */}
      <div className="task-card-content">
        <h3 className="task-card-title">{task.title}</h3>
        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}
      </div>

      {/* Due date bar */}
      <div className="task-card-footer">
        <div className={`task-card-date ${overdue ? 'date-overdue' : ''}`}>
          {overdue ? <AlertCircle size={15} /> : <Calendar size={15} />}
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>

        {/* Action icons */}
        <div className="task-card-actions">
          <button 
            onClick={() => onEdit(task)} 
            className="action-btn edit-btn" 
            title="Edit Task"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(task.id)} 
            className="action-btn delete-btn" 
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

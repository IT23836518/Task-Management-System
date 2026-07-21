import React, { useState, useEffect } from 'react';
import type { Task } from './TaskCard';
import { X, Loader2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string | null;
    priority: Task['priority'];
    status: Task['status'];
    dueDate: string;
  }) => Promise<void>;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM');
  const [status, setStatus] = useState<Task['status']>('PENDING');
  const [dueDate, setDueDate] = useState('');

  const [validationErrors, setValidationErrors] = useState<{ title?: string; dueDate?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Get today's date string in YYYY-MM-DD format for input date boundary restriction
  const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      // Format ISO string to YYYY-MM-DD
      const dateOnly = taskToEdit.dueDate.split('T')[0];
      setDueDate(dateOnly);
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setStatus('PENDING');
      setDueDate(getTodayDateString());
    }
    setValidationErrors({});
    setServerError(null);
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: { title?: string; dueDate?: string } = {};
    let isValid = true;

    if (!title.trim()) {
      errors.title = 'Task title is required';
      isValid = false;
    }

    if (!dueDate) {
      errors.dueDate = 'Due date is required';
      isValid = false;
    } else {
      const inputDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (inputDate < today) {
        errors.dueDate = 'Due date cannot be earlier than today';
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        dueDate: new Date(dueDate).toISOString()
      });
      onClose();
    } catch (err: any) {
      setServerError(err || 'Failed to submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <h3>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="error-banner" style={{ margin: '0 24px 16px 24px' }}>
            <span>{serverError}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-content">
            {/* Task Title */}
            <div className="input-group">
              <label htmlFor="modal-title">Task Title</label>
              <div className={`input-wrapper ${validationErrors.title ? 'input-error' : ''}`}>
                <input
                  id="modal-title"
                  type="text"
                  placeholder="e.g. Design user interface layouts"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.title && (
                <span className="validation-error-msg">{validationErrors.title}</span>
              )}
            </div>

            {/* Description */}
            <div className="input-group">
              <label htmlFor="modal-desc">Description (Optional)</label>
              <textarea
                id="modal-desc"
                placeholder="Write a brief description of this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="modal-textarea"
              />
            </div>

            {/* Form row (Priority, Status) */}
            <div className="form-row">
              {/* Priority */}
              <div className="input-group">
                <label htmlFor="modal-priority">Priority</label>
                <select
                  id="modal-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  disabled={isSubmitting}
                  className="modal-select"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              {/* Status */}
              <div className="input-group">
                <label htmlFor="modal-status">Status</label>
                <select
                  id="modal-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task['status'])}
                  disabled={isSubmitting}
                  className="modal-select"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="input-group">
              <label htmlFor="modal-duedate">Due Date</label>
              <div className={`input-wrapper ${validationErrors.dueDate ? 'input-error' : ''}`}>
                <input
                  id="modal-duedate"
                  type="date"
                  min={getTodayDateString()}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                  style={{ paddingLeft: '16px' }} // no icon needed
                />
              </div>
              {validationErrors.dueDate && (
                <span className="validation-error-msg">{validationErrors.dueDate}</span>
              )}
            </div>
          </div>

          {/* Modal Footer actions */}
          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="modal-cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

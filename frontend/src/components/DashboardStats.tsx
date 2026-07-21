import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface Metrics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

interface DashboardStatsProps {
  metrics: Metrics;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Tasks',
      value: metrics.totalTasks,
      icon: <ClipboardList size={22} />,
      class: 'stat-total',
      glow: 'rgba(255, 255, 255, 0.05)'
    },
    {
      title: 'Pending',
      value: metrics.pendingTasks,
      icon: <Clock size={22} />,
      class: 'stat-pending',
      glow: 'rgba(100, 116, 139, 0.15)'
    },
    {
      title: 'In Progress',
      value: metrics.inProgressTasks,
      icon: <PlayCircle size={22} />,
      class: 'stat-inprogress',
      glow: 'rgba(59, 130, 246, 0.15)'
    },
    {
      title: 'Completed',
      value: metrics.completedTasks,
      icon: <CheckCircle2 size={22} />,
      class: 'stat-completed',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    {
      title: 'Overdue',
      value: metrics.overdueTasks,
      icon: <AlertTriangle size={22} />,
      class: 'stat-overdue',
      glow: 'rgba(244, 63, 94, 0.15)'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`stat-card ${card.class}`}
          style={{ 
            boxShadow: `0 10px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.02), 0 0 15px ${card.glow}`
          }}
        >
          <div className="stat-card-header">
            <span className="stat-card-title">{card.title}</span>
            <div className="stat-card-icon">{card.icon}</div>
          </div>
          <div className="stat-card-value">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

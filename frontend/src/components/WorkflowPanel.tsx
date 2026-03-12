import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { API_BASE } from '../config';

interface WorkflowEvent {
  _id: string;
  fromStatus?: string;
  toStatus: string;
  performedBy?: { username: string };
  notes?: string;
  createdAt: string;
}

interface WorkflowPanelProps {
  reportId: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

const WORKFLOW_STATES = [
  { value: 'reported', label: 'Reported', color: '#6B7280' },
  { value: 'acknowledged', label: 'Acknowledged', color: '#3B82F6' },
  { value: 'assigned', label: 'Assigned', color: '#8B5CF6' },
  { value: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'resolved', label: 'Resolved', color: '#10B981' },
  { value: 'closed', label: 'Closed', color: '#6B7280' }
];

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ reportId, currentStatus, onStatusChange }) => {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<WorkflowEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [reportId]);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reports/${reportId}/history`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (status === currentStatus) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        setNotes('');
        await loadHistory();
        onStatusChange?.();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const currentState = WORKFLOW_STATES.find(s => s.value === status);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Workflow Management</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Update report status and track progress</p>
      </div>

      {/* Status Update Form */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-panel)' }}>
        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Current Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border outline-none mb-3"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
          }}
        >
          {WORKFLOW_STATES.map(state => (
            <option key={state.value} value={state.value}>{state.label}</option>
          ))}
        </select>

        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this status change..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border outline-none mb-3 resize-none"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
          }}
        />

        <button
          onClick={handleUpdate}
          disabled={status === currentStatus || updating}
          className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          style={{
            background: status !== currentStatus ? 'var(--accent-blue)' : 'var(--bg-elevated)',
            color: status !== currentStatus ? '#ffffff' : 'var(--text-muted)',
            opacity: updating ? 0.6 : 1
          }}
        >
          <CheckCircle className="w-4 h-4" />
          {updating ? 'Updating...' : 'Update Status'}
        </button>
      </div>

      {/* Workflow History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Workflow History</h4>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No history yet</p>
        ) : (
          <div className="space-y-3">
            {history.map((event, index) => {
              const state = WORKFLOW_STATES.find(s => s.value === event.toStatus);
              return (
                <div
                  key={event._id}
                  className="p-3 rounded-xl border"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: state?.color + '20', color: state?.color }}
                    >
                      {index === 0 ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm" style={{ color: state?.color }}>
                          {state?.label}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                          {new Date(event.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {event.performedBy && (
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                          By: {event.performedBy.username}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-xs mt-2 p-2 rounded" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

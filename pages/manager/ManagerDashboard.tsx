import React, { useState, useEffect, useCallback } from 'react';
import { RechargeRequest } from '../../types';
import { getPendingRecharges, approveRecharge, rejectRecharge } from '../../services/apiService';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { XMarkIcon } from '../../components/Icons';

type PopulatedRechargeRequest = RechargeRequest & { studentName: string; cardNumber: string };

const RejectionModal: React.FC<{
  request: PopulatedRechargeRequest;
  onClose: () => void;
  onSubmit: (requestId: string, notes: string) => void;
  isLoading: boolean;
}> = ({ request, onClose, onSubmit, isLoading }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(request.id, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-all">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">Reject Request</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Close modal">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-gray-600 dark:text-gray-300">You are rejecting a recharge request of <span className="font-bold text-gray-800 dark:text-white">₹{request.amount.toFixed(2)}</span> for <span className="font-bold text-gray-800 dark:text-white">{request.studentName}</span>.</p>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Rejection (optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Payment not confirmed"
              />
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex justify-end gap-4">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
            >
                Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-gray-400"
            >
              {isLoading ? <Spinner className="w-5 h-5"/> : 'Confirm Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [requests, setRequests] = useState<PopulatedRechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [rejectionTarget, setRejectionTarget] = useState<PopulatedRechargeRequest | null>(null);

  const fetchRequests = useCallback(() => {
    getPendingRecharges()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId: string) => {
    if (!user) return;
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    const success = await approveRecharge(requestId, user.id);
    if (success) {
      addToast('Recharge approved successfully.', 'success');
      fetchRequests();
    } else {
      addToast('Failed to approve recharge. It may have been processed already.', 'error');
    }
    setActionLoading(prev => ({ ...prev, [requestId]: false }));
  };

  const handleConfirmReject = async (requestId: string, notes: string) => {
    if (!user) return;
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    setRejectionTarget(null); // Close modal
    const success = await rejectRecharge(requestId, user.id, notes);
    if (success) {
      addToast('Recharge rejected.', 'success');
      fetchRequests();
    } else {
      addToast('Failed to reject recharge. It may have been processed already.', 'error');
    }
    setActionLoading(prev => ({ ...prev, [requestId]: false }));
  };
  
  return (
    <Layout title="Manager Dashboard">
      {rejectionTarget && (
        <RejectionModal
          request={rejectionTarget}
          onClose={() => setRejectionTarget(null)}
          onSubmit={handleConfirmReject}
          isLoading={actionLoading[rejectionTarget.id] || false}
        />
      )}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Pending Recharge Requests</h2>
        {loading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map(req => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{req.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">{req.cardNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">₹{req.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button 
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading[req.id]}
                        className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {actionLoading[req.id] ? '...' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => setRejectionTarget(req)}
                        disabled={actionLoading[req.id]}
                        className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                      >
                        {actionLoading[req.id] ? '...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                    <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">No pending requests.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default ManagerDashboard;
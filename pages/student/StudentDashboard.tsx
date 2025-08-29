import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentData, requestRecharge } from '../../services/apiService';
import { MealCard, Transaction } from '../../types';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';
import { QrCodeIcon, PlusIcon, XMarkIcon, CheckCircleIcon, CreditCardIcon } from '../../components/Icons';

type Step = 'form' | 'processing' | 'success';

const RechargeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  userId: string;
  onSuccess: () => void;
}> = ({ isOpen, onClose, cardId, userId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    setIsLoading(true);
    setStep('processing');
    
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await requestRecharge(cardId, userId, numAmount);
      setStep('success');
    } catch {
      setError('Failed to submit request. Please try again.');
      setStep('form'); // Go back to form on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAndReset = () => {
      onClose();
      // Delay reset to allow closing animation
      setTimeout(() => {
          setStep('form');
          setAmount('');
          setError('');
      }, 300);
  };
  
  const handleSuccessClose = () => {
      onSuccess(); // This closes modal and shows toast
      setTimeout(() => {
          setStep('form');
          setAmount('');
          setError('');
      }, 300);
  }

  if (!isOpen) return null;
  
  const renderContent = () => {
    switch (step) {
        case 'processing':
            return (
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                    <Spinner className="w-12 h-12" />
                    <h2 className="text-xl font-bold">Processing Payment...</h2>
                    <p className="text-gray-500 dark:text-gray-400">Please wait while we securely process your transaction. Do not close this window.</p>
                </div>
            );
        case 'success':
            return (
                <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                    <CheckCircleIcon className="w-16 h-16 text-green-500" />
                    <h2 className="text-2xl font-bold">Payment Successful!</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Your request for <span className="font-bold">₹{parseFloat(amount).toFixed(2)}</span> has been sent for manager approval.
                    </p>
                    <button
                        onClick={handleSuccessClose}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        Done
                    </button>
                </div>
            );
        case 'form':
        default:
            return (
                <>
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <h2 className="text-xl font-bold">Request Recharge</h2>
                        <button onClick={handleCloseAndReset} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g., 500"
                                    min="1"
                                    step="any"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <p className="text-xs text-gray-500 dark:text-gray-400">Your request will be sent to a manager for approval. The amount will be credited to your card upon approval.</p>
                        </div>
                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                            >
                                <CreditCardIcon className="w-5 h-5" />
                                {isLoading ? 'Processing...' : `Proceed to Pay ₹${parseFloat(amount || '0').toFixed(2)}`}
                            </button>
                        </div>
                    </form>
                </>
            );
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transition-all">
        {renderContent()}
      </div>
    </div>
  );
};


const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{ card: MealCard, transactions: Transaction[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (user) {
      getStudentData(user.id)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [user]);
  
  const handleRechargeSuccess = () => {
      setIsModalOpen(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
  }

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </Layout>
    );
  }
  
  if (!data || !user) {
     return (
      <Layout title="Dashboard">
          <p className="text-center text-red-500">Could not load student data.</p>
      </Layout>
     );
  }

  const { card, transactions } = data;

  return (
    <Layout title="My Meal Card">
      {user && card && <RechargeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} cardId={card.id} userId={user.id} onSuccess={handleRechargeSuccess} />}

      <div className="space-y-6 p-4 md:p-0">
        
        {showSuccessMessage && (
             <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-md shadow-md flex items-center" role="alert">
                <CheckCircleIcon className="w-6 h-6 mr-3"/>
                <div>
                    <p className="font-bold">Success!</p>
                    <p className="text-sm">Your recharge request has been sent for approval.</p>
                </div>
            </div>
        )}

        <Card>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
              <p className="text-4xl font-bold text-gray-800 dark:text-white">{formatCurrency(card.balance)}</p>
            </div>
            <div className="text-right">
                <p className="font-mono text-sm text-gray-500">{card.cardNumber}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${card.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{card.status}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="flex flex-col items-center justify-center p-6 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">
                <QrCodeIcon className="h-12 w-12 mb-2" />
                <span className="font-semibold">Scan QR to Pay</span>
            </button>
             <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center p-6 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:scale-105">
                <PlusIcon className="h-12 w-12 mb-2" />
                <span className="font-semibold">Recharge Card</span>
            </button>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 dark:text-gray-100 capitalize">
                    {tx.type === 'PURCHASE' ? tx.metadata?.mealName || 'Purchase' : tx.type.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(tx.createdAt).toLocaleString()}
                    {tx.type === 'PURCHASE' && tx.cashierName && ` • by ${tx.cashierName}`}
                  </p>
                </div>
                <p className={`font-bold text-lg whitespace-nowrap pl-4 ${tx.direction === 'CREDIT' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.direction === 'CREDIT' ? '+' : '-'} {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-center text-gray-500 py-4">No transactions yet.</p>}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
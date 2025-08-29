import React, { useState, useEffect, useCallback } from 'react';
import { Meal, CartItem, MealCard, Student } from '../../types';
import { getActiveMeals, findStudentByCard, processPurchase } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { ShoppingCartIcon } from '../../components/Icons';

const CashierPOS: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<{ card: MealCard, user: Student } | null>(null);
  const [lookupCardNumber, setLookupCardNumber] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    getActiveMeals().then(setMeals).finally(() => setLoading(false));
  }, []);

  const addToCart = (meal: Meal) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === meal.id);
      if (existingItem) {
        return prevCart.map(item => item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...meal, quantity: 1 }];
    });
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== mealId));
    } else {
      setCart(cart.map(item => item.id === mealId ? { ...item, quantity } : item));
    }
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLookup = useCallback(async () => {
    if (!lookupCardNumber) return;
    setLookupLoading(true);
    setLookupError(null);
    setStudentInfo(null);
    try {
      const result = await findStudentByCard(lookupCardNumber);
      if (result) {
        setStudentInfo({ card: result.card, user: result.user });
      } else {
        setLookupError('Student card not found.');
      }
    } catch (e) {
      setLookupError('Error looking up student.');
    } finally {
      setLookupLoading(false);
    }
  }, [lookupCardNumber]);

  const handlePayment = async () => {
      if(!studentInfo || !user || cart.length === 0) return;
      setPaymentProcessing(true);
      const result = await processPurchase(studentInfo.card.id, cart, user.id);
      if('newBalance' in result) {
          addToast(`Payment successful! New balance: ₹${result.newBalance.toFixed(2)}`, 'success');
          setStudentInfo(prev => prev ? ({ ...prev, card: { ...prev.card, balance: result.newBalance }}) : null);
          clearCart();
          setStudentInfo(null);
          setLookupCardNumber('');
      } else {
          addToast(result.error, 'error');
      }
      setPaymentProcessing(false);
  };
  
  return (
    <Layout title="Point of Sale">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-11rem)]">
        {/* Menu Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          {loading ? <div className="flex-grow flex justify-center items-center"><Spinner /></div> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto flex-grow pr-2">
              {meals.map(meal => (
                <button 
                  key={meal.id} 
                  onClick={() => addToCart(meal)} 
                  className="bg-gray-50 dark:bg-gray-700/60 rounded-xl text-center shadow-md hover:shadow-xl hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 border border-transparent transition-all duration-200 overflow-hidden flex flex-col justify-center items-center p-3 aspect-square"
                >
                    <p className="font-semibold text-sm leading-tight">{meal.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">₹{meal.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart & Student Section */}
        <div id="order-section" className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Order</h2>
            <div className="space-y-2 mb-4 overflow-y-auto max-h-48">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-500">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600">-</button>
                    <span className="w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600">+</button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <p className="text-gray-500 text-center py-4">Cart is empty</p>}
            </div>
            {cart.length > 0 && (
                <>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
                <button onClick={clearCart} className="text-sm text-red-500 hover:underline w-full mt-2">Clear Cart</button>
                </>
            )}
          </div>

          <div className="border-t-2 border-dashed mt-4 pt-4 space-y-3">
             <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Student Card Number"
                    value={lookupCardNumber}
                    onChange={e => setLookupCardNumber(e.target.value)}
                    className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-sm"
                />
                <button onClick={handleLookup} disabled={lookupLoading} className="px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
                    {lookupLoading ? <Spinner className="w-5 h-5"/> : 'Find'}
                </button>
             </div>
             {lookupError && <p className="text-red-500 text-sm">{lookupError}</p>}
             {studentInfo && (
                 <div className="p-3 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg space-y-1">
                     <p className="font-bold">{studentInfo.user.name}</p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">{studentInfo.user.profile.department}</p>
                     <div className="pt-2 mt-2 border-t dark:border-gray-600 flex justify-between items-center">
                        <div>
                            <p className="text-xs">Balance:</p>
                            <p className="font-semibold text-lg">₹{studentInfo.card.balance.toFixed(2)}</p>
                        </div>
                        <p>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${studentInfo.card.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{studentInfo.card.status}</span>
                        </p>
                     </div>
                 </div>
             )}
             
             <button
                onClick={handlePayment}
                disabled={!studentInfo || cart.length === 0 || paymentProcessing || studentInfo.card.balance < total || studentInfo.card.status !== 'ACTIVE'}
                className="w-full p-3 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
             >
                {paymentProcessing ? <Spinner/> : `Charge ₹${total.toFixed(2)}`}
             </button>
          </div>
        </div>

        {cart.length > 0 && (
            <a href="#order-section" className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white rounded-full shadow-lg p-3 flex items-center gap-3 z-10 transition-transform hover:scale-105" aria-label={`View cart with ${totalItems} items, total is ₹${total.toFixed(2)}`}>
                <div className="relative">
                    <ShoppingCartIcon className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                    </span>
                </div>
                <span className="font-semibold text-md pr-2">
                    ₹{total.toFixed(2)}
                </span>
            </a>
        )}
      </div>
    </Layout>
  );
};

export default CashierPOS;
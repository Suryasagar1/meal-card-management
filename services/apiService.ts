import { dbClient } from './database';
import { MealCard, Transaction, RechargeRequest, RechargeStatus, Meal, CartItem, TransactionType, TransactionDirection, CardStatus, Student, Role, User } from '../types';

// --- Student APIs ---
export const getStudentData = async (userId: string): Promise<{ card: MealCard, transactions: Transaction[] } | null> => {
  const card = await dbClient.mealCards.findOne({ studentId: userId });
  if (!card) return null;
  
  const studentTransactions = await dbClient.transactions.find({ cardId: card.id });
  
  const populatedTransactions = await Promise.all(studentTransactions.map(async (t) => {
      if (t.cashierId) {
          const cashier = await dbClient.users.findOne({ id: t.cashierId });
          return { ...t, cashierName: cashier?.name || 'Unknown Cashier' };
      }
      return t;
  }));

  return { card, transactions: populatedTransactions };
};

export const requestRecharge = async (cardId: string, userId: string, amount: number): Promise<RechargeRequest> => {
    const newRequestData: Omit<RechargeRequest, 'id'> = {
        cardId,
        amount,
        requestedBy: userId,
        status: RechargeStatus.PENDING
    };
    return await dbClient.rechargeRequests.insertOne(newRequestData);
};

// --- Manager APIs ---
export const getPendingRecharges = async (): Promise<(RechargeRequest & { studentName: string; cardNumber: string })[]> => {
    const pending = await dbClient.rechargeRequests.find({ status: RechargeStatus.PENDING });
    
    const populated = await Promise.all(pending.map(async (req) => {
        const card = await dbClient.mealCards.findOne({ id: req.cardId });
        const student = card ? await dbClient.users.findOne({ id: card.studentId }) : null;
        return {
            ...req,
            studentName: student?.name || 'Unknown',
            cardNumber: card?.cardNumber || 'Unknown'
        };
    }));

    return populated;
};

export const approveRecharge = async (requestId: string, managerId: string): Promise<boolean> => {
    const request = await dbClient.rechargeRequests.findOne({ id: requestId });
    if (!request || request.status !== RechargeStatus.PENDING) return false;

    const card = await dbClient.mealCards.findOne({ id: request.cardId });
    if (!card) return false;

    // Atomic update (simulated)
    await dbClient.rechargeRequests.updateOne({ id: requestId }, {
        status: RechargeStatus.APPROVED,
        reviewedBy: managerId,
        reviewedAt: new Date(),
    });
    
    await dbClient.mealCards.updateOne({ id: card.id }, { balance: card.balance + request.amount });
    
    const newTransactionData: Omit<Transaction, 'id'> = {
        cardId: card.id,
        amount: request.amount,
        type: TransactionType.RECHARGE,
        direction: TransactionDirection.CREDIT,
        createdAt: new Date(),
    };
    await dbClient.transactions.insertOne(newTransactionData);
    
    return true;
};

export const rejectRecharge = async (requestId: string, managerId: string, notes: string): Promise<boolean> => {
    const request = await dbClient.rechargeRequests.findOne({ id: requestId });
    if (!request || request.status !== RechargeStatus.PENDING) return false;

    await dbClient.rechargeRequests.updateOne({ id: requestId }, {
        status: RechargeStatus.REJECTED,
        reviewedBy: managerId,
        reviewedAt: new Date(),
        notes: notes,
    });
    
    return true;
};

// --- Cashier APIs ---
export const getActiveMeals = async (): Promise<Meal[]> => {
    return await dbClient.meals.find({ isActive: true });
};

export const findStudentByCard = async (cardNumber: string): Promise<{ user: Student, card: MealCard } | null> => {
    const card = await dbClient.mealCards.findOne({ cardNumber });
    if(!card) return null;

    const user = await dbClient.users.findOne({ id: card.studentId });
    if(!user) return null;

    const profile = await dbClient.studentProfiles.findOne({ userId: user.id });
    if (!profile) return null;

    return { user: { ...user, profile }, card };
};

export const processPurchase = async (cardId: string, cart: CartItem[], cashierId: string): Promise<{ newBalance: number } | { error: string }> => {
    const card = await dbClient.mealCards.findOne({ id: cardId });
    if (!card) return { error: 'Card not found' };
    if (card.status === CardStatus.BLOCKED) return { error: 'Card is blocked.' };

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (card.balance < totalAmount) return { error: 'Insufficient balance.' };

    // Atomic update (simulated)
    const updatedCard = await dbClient.mealCards.updateOne({ id: card.id }, { balance: card.balance - totalAmount });

    const newTransactionData: Omit<Transaction, 'id'> = {
        cardId: card.id,
        amount: totalAmount,
        type: TransactionType.PURCHASE,
        direction: TransactionDirection.DEBIT,
        createdAt: new Date(),
        cashierId,
        metadata: { mealName: cart.map(i => `${i.name} (x${i.quantity})`).join(', ') }
    };
    await dbClient.transactions.insertOne(newTransactionData);

    return { newBalance: updatedCard!.balance };
};


// --- Admin APIs ---
export const getAdminStats = async () => {
    const students = await dbClient.users.find({ role: Role.STUDENT });
    const activeMealCards = await dbClient.mealCards.find({ status: CardStatus.ACTIVE });
    const totalBalanceFloat = await dbClient.mealCards.reduce((sum, card) => sum + card.balance, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysTransactions = await dbClient.transactions.find({ createdAt: { $gte: today } });
    
    const allTransactions = await dbClient.transactions.find({});

    const weeklyTxns = allTransactions.reduce((acc, txn) => {
        const day = new Date(txn.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if(!acc[day]) acc[day] = { RECHARGE: 0, PURCHASE: 0 };
        acc[day][txn.type] = (acc[day][txn.type] || 0) + 1;
        return acc;
    }, {} as Record<string, { RECHARGE: number, PURCHASE: number }>);

    const mealPurchases = allTransactions
        .filter(t => t.type === TransactionType.PURCHASE)
        .reduce((acc, t) => {
             const mealName = t.metadata?.mealName?.split(' (x')[0] || 'Unknown';
             acc[mealName] = (acc[mealName] || 0) + t.amount;
             return acc;
        }, {} as Record<string, number>);
    
    const topMeals = Object.entries(mealPurchases).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const stats = {
        totalStudents: students.length,
        activeCards: activeMealCards.length,
        totalBalanceFloat,
        todaysTransactionsCount: todaysTransactions.length,
        todaysTransactionsValue: todaysTransactions.reduce((sum, t) => sum + t.amount, 0),
        weeklyTxns: Object.entries(weeklyTxns).map(([name, value]) => ({ name, ...value})),
        topMeals: topMeals.map(([name, value]) => ({ name, value }))
    };

    return stats;
};

export const getAllUsers = async (): Promise<User[]> => {
    return await dbClient.users.findAll();
};
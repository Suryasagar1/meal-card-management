import { 
    initialUsers, 
    initialMealCards, 
    initialMeals, 
    initialTransactions, 
    initialRechargeRequests, 
    initialStudentProfiles 
} from './seedData';
import { User, MealCard, Meal, Transaction, RechargeRequest, StudentProfile, Role } from '../types';

// In-memory store
let users: User[] = JSON.parse(JSON.stringify(initialUsers));
let mealCards: MealCard[] = JSON.parse(JSON.stringify(initialMealCards));
let meals: Meal[] = JSON.parse(JSON.stringify(initialMeals));
let transactions: Transaction[] = JSON.parse(JSON.stringify(initialTransactions));
let rechargeRequests: RechargeRequest[] = JSON.parse(JSON.stringify(initialRechargeRequests));
let studentProfiles: StudentProfile[] = JSON.parse(JSON.stringify(initialStudentProfiles));

// Helper to simulate network delay for database operations
const dbOperation = <T>(operation: () => T, delay = 50): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Deep copy to prevent direct mutation of the "database" arrays from API services
            const result = JSON.parse(JSON.stringify(operation()));
            resolve(result);
        }, delay);
    });
};

// Simulated DB Client mimicking a real database driver/ORM
export const dbClient = {
    users: {
        findOne: (query: { email?: string; id?: string, role?: Role, name?: string }) => dbOperation(() => 
            users.find(u => 
                (!query.email || u.email.toLowerCase() === query.email.toLowerCase()) &&
                (!query.name || u.name.toLowerCase() === query.name.toLowerCase()) &&
                (!query.id || u.id === query.id) &&
                (!query.role || u.role === query.role)
            ) || null
        ),
        find: (query: { role: Role }) => dbOperation(() => users.filter(u => u.role === query.role)),
        findAll: () => dbOperation(() => users),
    },
    studentProfiles: {
        findOne: (query: { userId: string }) => dbOperation(() => studentProfiles.find(p => p.userId === query.userId) || null),
    },
    mealCards: {
        findOne: (query: { studentId?: string; cardNumber?: string; id?: string }) => dbOperation(() => 
            mealCards.find(c => 
                (!query.studentId || c.studentId === query.studentId) &&
                (!query.cardNumber || c.cardNumber.toLowerCase() === query.cardNumber.toLowerCase()) &&
                (!query.id || c.id === query.id)
            ) || null
        ),
        find: (query: { status: string }) => dbOperation(() => mealCards.filter(c => c.status === query.status)),
        updateOne: (query: { id: string }, update: Partial<MealCard>) => dbOperation(() => {
            const index = mealCards.findIndex(c => c.id === query.id);
            if (index > -1) {
                mealCards[index] = { ...mealCards[index], ...update };
                return mealCards[index];
            }
            return null;
        }),
        reduce: (reducer: (sum: number, card: MealCard) => number, initialValue: number) => dbOperation(() => mealCards.reduce(reducer, initialValue)),
    },
    meals: {
        find: (query: { isActive: boolean }) => dbOperation(() => meals.filter(m => m.isActive === query.isActive)),
    },
    transactions: {
        find: (query: { cardId?: string, createdAt?: { $gte: Date }, type?: string }) => dbOperation(() => 
            transactions
                .filter(t => 
                    (!query.cardId || t.cardId === query.cardId) &&
                    (!query.createdAt || new Date(t.createdAt) >= query.createdAt.$gte) &&
                    (!query.type || t.type === query.type)
                )
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        ),
        insertOne: (newTx: Omit<Transaction, 'id'>) => dbOperation(() => {
            const tx = { ...newTx, id: `txn-${Date.now()}` } as Transaction;
            transactions.unshift(tx);
            return tx;
        }),
    },
    rechargeRequests: {
        find: (query: { status: string }) => dbOperation(() => rechargeRequests.filter(r => r.status === query.status)),
        findOne: (query: { id: string }) => dbOperation(() => rechargeRequests.find(r => r.id === query.id) || null),
        insertOne: (newReq: Omit<RechargeRequest, 'id'>) => dbOperation(() => {
            const req = { ...newReq, id: `req-${Date.now()}` } as RechargeRequest;
            rechargeRequests.unshift(req);
            return req;
        }),
        updateOne: (query: { id: string }, update: Partial<RechargeRequest>) => dbOperation(() => {
            const index = rechargeRequests.findIndex(r => r.id === query.id);
            if (index > -1) {
                rechargeRequests[index] = { ...rechargeRequests[index], ...update };
                return rechargeRequests[index];
            }
            return null;
        }),
    }
};
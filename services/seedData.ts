import { User, Role, MealCard, CardStatus, Transaction, TransactionType, TransactionDirection, RechargeRequest, RechargeStatus, Meal, StudentProfile } from '../types';

// --- Core Users ---
export const initialUsers: User[] = [
  { id: 'user-admin', name: 'Admin User', email: 'admin@campus.edu', role: Role.ADMIN },
  { id: 'user-manager', name: 'Manager User', email: 'manager@campus.edu', role: Role.MANAGER },
  { id: 'user-cashier', name: 'Cashier User', email: 'cashier@campus.edu', role: Role.CASHIER },
];

export const initialStudentProfiles: StudentProfile[] = [];
export const initialMealCards: MealCard[] = [];

// --- New Students as per Request ---
const newStudents = ['surya', 'syam', 'varun', 'saikiran', 'murali', 'ganesh'];
const departments = ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Biotechnology', 'Civil Engineering', 'Chemical Engineering'];

newStudents.forEach((name, index) => {
    const studentId = `user-student-${index + 1}`;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    initialUsers.push({
        id: studentId,
        name: capitalizedName,
        email: `${name}@campus.edu`,
        role: Role.STUDENT
    });

    initialStudentProfiles.push({
        id: `profile-${index + 1}`,
        userId: studentId,
        enrollmentNo: `ENR100${index + 1}`,
        department: departments[index % departments.length],
        year: (index % 4) + 1
    });

    initialMealCards.push({
        id: `card-${index + 1}`,
        studentId: studentId,
        cardNumber: `C100${index + 1}`,
        balance: parseFloat((100 + Math.random() * 200).toFixed(2)),
        status: CardStatus.ACTIVE
    });
});


// --- Other Seed Data ---
export const initialMeals: Meal[] = [
  { id: 'meal-1', name: 'Veggie Burger', price: 50.00, category: 'VEG', isActive: true },
  { id: 'meal-2', name: 'Chicken Curry', price: 75.50, category: 'NON-VEG', isActive: true },
  { id: 'meal-3', name: 'Paneer Tikka', price: 65.00, category: 'VEG', isActive: true },
  { id: 'meal-4', name: 'Fish and Chips', price: 80.00, category: 'NON-VEG', isActive: true },
  { id: 'meal-5', name: 'Dal Makhani', price: 60.00, category: 'VEG', isActive: true },
  { id: 'meal-6', name: 'Egg Fried Rice', price: 55.25, category: 'NON-VEG', isActive: true },
  { id: 'meal-7', name: 'Iced Coffee', price: 30.00, category: 'BEVERAGES', isActive: true },
  { id: 'meal-8', name: 'Masala Dosa', price: 45.00, category: 'VEG', isActive: false },
];

export const initialTransactions: Transaction[] = [
  { id: 'txn-1', cardId: 'card-1', type: TransactionType.RECHARGE, amount: 200.00, direction: TransactionDirection.CREDIT, createdAt: new Date('2023-10-26T10:00:00Z') },
  { id: 'txn-2', cardId: 'card-1', type: TransactionType.PURCHASE, amount: 49.25, direction: TransactionDirection.DEBIT, createdAt: new Date('2023-10-26T12:30:00Z'), cashierId: 'user-cashier', metadata: { mealName: 'Veggie Burger' } },
  { id: 'txn-3', cardId: 'card-2', type: TransactionType.RECHARGE, amount: 100.00, direction: TransactionDirection.CREDIT, createdAt: new Date('2023-10-27T09:00:00Z') },
  { id: 'txn-4', cardId: 'card-2', type: TransactionType.PURCHASE, amount: 75.00, direction: TransactionDirection.DEBIT, createdAt: new Date('2023-10-27T13:00:00Z'), cashierId: 'user-cashier', metadata: { mealName: 'Chicken Curry' } },
];

export const initialRechargeRequests: RechargeRequest[] = [
  { id: 'req-1', cardId: 'card-2', amount: 100, status: RechargeStatus.PENDING, requestedBy: 'user-student-2' },
  { id: 'req-2', cardId: 'card-1', amount: 200, status: RechargeStatus.APPROVED, requestedBy: 'user-student-1', reviewedBy: 'user-manager', reviewedAt: new Date() },
];
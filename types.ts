export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface StudentProfile {
  id: string;
  userId: string;
  enrollmentNo: string;
  department: string;
  year: number;
}

// A combined type for easier handling
export interface Student extends User {
    profile: StudentProfile;
}


export enum CardStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED'
}

export interface MealCard {
  id: string;
  studentId: string;
  cardNumber: string;
  balance: number;
  status: CardStatus;
}

export enum TransactionType {
    RECHARGE = 'RECHARGE',
    PURCHASE = 'PURCHASE',
    REFUND = 'REFUND',
    ADJUSTMENT = 'ADJUSTMENT'
}

export enum TransactionDirection {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT'
}

export interface Transaction {
  id: string;
  cardId: string;
  type: TransactionType;
  amount: number;
  direction: TransactionDirection;
  createdAt: Date;
  cashierId?: string;
  cashierName?: string;
  metadata?: { mealName?: string, quantity?: number, mealId?: string };
}

export enum RechargeStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface RechargeRequest {
  id: string;
  cardId: string;
  amount: number;
  status: RechargeStatus;
  requestedBy: string; // userId
  reviewedBy?: string; // userId
  reviewedAt?: Date;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
}

export interface CartItem extends Meal {
    quantity: number;
}
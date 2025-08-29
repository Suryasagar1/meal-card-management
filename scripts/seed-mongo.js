// This script is designed to be run from your local machine with Node.js to seed your MongoDB database.
// It is NOT part of the frontend application and should not be run in the browser.
//
// HOW TO RUN:
// 1. Make sure you have Node.js and MongoDB installed and running.
// 2. Install the MongoDB driver: `npm install mongodb`
// 3. Run the script from your project's root directory: `node scripts/seed-mongo.js`

const { MongoClient } = require('mongodb');

// --- Configuration ---
const uri = 'mongodb://localhost:27017';
const dbName = 'mealcardmanagement';

// --- Enums (mirrored from types.ts for self-containment) ---
const Role = { ADMIN: 'ADMIN', MANAGER: 'MANAGER', CASHIER: 'CASHIER', STUDENT: 'STUDENT' };
const CardStatus = { ACTIVE: 'ACTIVE', BLOCKED: 'BLOCKED' };
const TransactionType = { RECHARGE: 'RECHARGE', PURCHASE: 'PURCHASE', REFUND: 'REFUND', ADJUSTMENT: 'ADJUSTMENT' };
const TransactionDirection = { CREDIT: 'CREDIT', DEBIT: 'DEBIT' };
const RechargeStatus = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' };

// --- Seed Data ---
const initialUsers = [
  { _id: 'user-admin', name: 'Admin User', email: 'admin@campus.edu', role: Role.ADMIN },
  { _id: 'user-manager', name: 'Manager User', email: 'manager@campus.edu', role: Role.MANAGER },
  { _id: 'user-cashier', name: 'Cashier User', email: 'cashier@campus.edu', role: Role.CASHIER },
];
const initialStudentProfiles = [];
const initialMealCards = [];

const newStudents = ['surya', 'syam', 'varun', 'saikiran', 'murali', 'ganesh'];
const departments = ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Biotechnology', 'Civil Engineering', 'Chemical Engineering'];

newStudents.forEach((name, index) => {
    const studentId = `user-student-${index + 1}`;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    initialUsers.push({
        _id: studentId,
        name: capitalizedName,
        email: `${name}@campus.edu`,
        role: Role.STUDENT
    });

    initialStudentProfiles.push({
        _id: `profile-${index + 1}`,
        userId: studentId,
        enrollmentNo: `ENR100${index + 1}`,
        department: departments[index % departments.length],
        year: (index % 4) + 1
    });

    initialMealCards.push({
        _id: `card-${index + 1}`,
        studentId: studentId,
        cardNumber: `C100${index + 1}`,
        balance: parseFloat((100 + Math.random() * 200).toFixed(2)),
        status: CardStatus.ACTIVE
    });
});

const initialMeals = [
  { _id: 'meal-1', name: 'Veggie Burger', price: 50.00, category: 'VEG', isActive: true },
  { _id: 'meal-2', name: 'Chicken Curry', price: 75.50, category: 'NON-VEG', isActive: true },
  { _id: 'meal-3', name: 'Paneer Tikka', price: 65.00, category: 'VEG', isActive: true },
  { _id: 'meal-4', name: 'Fish and Chips', price: 80.00, category: 'NON-VEG', isActive: true },
  { _id: 'meal-5', name: 'Dal Makhani', price: 60.00, category: 'VEG', isActive: true },
  { _id: 'meal-6', name: 'Egg Fried Rice', price: 55.25, category: 'NON-VEG', isActive: true },
  { _id: 'meal-7', name: 'Iced Coffee', price: 30.00, category: 'BEVERAGES', isActive: true },
  { _id: 'meal-8', name: 'Masala Dosa', price: 45.00, category: 'VEG', isActive: false },
];

const initialTransactions = [
  { _id: 'txn-1', cardId: 'card-1', type: TransactionType.RECHARGE, amount: 200.00, direction: TransactionDirection.CREDIT, createdAt: new Date('2023-10-26T10:00:00Z') },
  { _id: 'txn-2', cardId: 'card-1', type: TransactionType.PURCHASE, amount: 49.25, direction: TransactionDirection.DEBIT, createdAt: new Date('2023-10-26T12:30:00Z'), cashierId: 'user-cashier', metadata: { mealName: 'Veggie Burger' } },
  { _id: 'txn-3', cardId: 'card-2', type: TransactionType.RECHARGE, amount: 100.00, direction: TransactionDirection.CREDIT, createdAt: new Date('2023-10-27T09:00:00Z') },
  { _id: 'txn-4', cardId: 'card-2', type: TransactionType.PURCHASE, amount: 75.00, direction: TransactionDirection.DEBIT, createdAt: new Date('2023-10-27T13:00:00Z'), cashierId: 'user-cashier', metadata: { mealName: 'Chicken Curry' } },
];

const initialRechargeRequests = [
  { _id: 'req-1', cardId: 'card-2', amount: 100, status: RechargeStatus.PENDING, requestedBy: 'user-student-2' },
  { _id: 'req-2', cardId: 'card-1', amount: 200, status: RechargeStatus.APPROVED, requestedBy: 'user-student-1', reviewedBy: 'user-manager', reviewedAt: new Date() },
];

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB server');

    const db = client.db(dbName);

    console.log(`\n⚠️  Dropping existing database '${dbName}'...`);
    await db.dropDatabase();
    console.log('✅ Database dropped.');

    const collections = {
        users: db.collection('users'),
        studentProfiles: db.collection('studentProfiles'),
        mealCards: db.collection('mealCards'),
        meals: db.collection('meals'),
        transactions: db.collection('transactions'),
        rechargeRequests: db.collection('rechargeRequests'),
    };
    
    console.log('\n🌱 Seeding data...');

    await collections.users.insertMany(initialUsers);
    console.log(`   - Inserted ${initialUsers.length} documents into 'users'`);

    await collections.studentProfiles.insertMany(initialStudentProfiles);
    console.log(`   - Inserted ${initialStudentProfiles.length} documents into 'studentProfiles'`);
    
    await collections.mealCards.insertMany(initialMealCards);
    console.log(`   - Inserted ${initialMealCards.length} documents into 'mealCards'`);

    await collections.meals.insertMany(initialMeals);
    console.log(`   - Inserted ${initialMeals.length} documents into 'meals'`);

    await collections.transactions.insertMany(initialTransactions);
    console.log(`   - Inserted ${initialTransactions.length} documents into 'transactions'`);
    
    await collections.rechargeRequests.insertMany(initialRechargeRequests);
    console.log(`   - Inserted ${initialRechargeRequests.length} documents into 'rechargeRequests'`);

    console.log('\n🎉 Database seeded successfully!');

  } catch (err) {
    console.error('❌ An error occurred during the seeding process:', err);
  } finally {
    await client.close();
    console.log('\n🔌 Connection to MongoDB closed.');
  }
}

seedDatabase();

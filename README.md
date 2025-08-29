# Campus Meal Card Management System

This is a full-stack application for managing campus meal cards. This version features a complete, interactive frontend that simulates the full application flow using a mocked in-memory database.

## Features

*   **Role-Based Access Control:** Separate dashboards and functionalities for four distinct user roles: Student, Cashier, Manager, and Admin.
*   **Student Dashboard:** View meal card balance, transaction history, and request balance recharges.
*   **Cashier POS:** A Point-of-Sale interface for cashiers to process meal purchases, look up student cards, and manage a shopping cart.
*   **Manager Dashboard:** A portal for managers to review, approve, or reject student recharge requests.
*   **Admin Dashboard:** A comprehensive overview of the system with key statistics, data visualizations (weekly transactions, top-selling meals), and user management capabilities.
*   **Modern UI/UX:** Built with Tailwind CSS for a responsive, clean, and dark-mode-ready interface.
*   **Interactive Charts:** Utilizes Recharts for dynamic and informative data visualization on the Admin dashboard.
*   **Toast Notifications:** Provides non-intrusive feedback for user actions.

## Tech Stack

*   **Frontend:**
    *   Framework: **React 19**
    *   Language: **TypeScript**
    *   Styling: **Tailwind CSS**
    *   Routing: **React Router v6**
    *   Charts: **Recharts**
    *   State Management: **React Context API**
*   **Backend (Mocked):**
    *   An in-memory database is simulated within the frontend using TypeScript to provide a fully interactive demo without requiring a backend setup.
*   **Backend (Example Seeding):**
    *   A Node.js script is provided to demonstrate how to seed a **MongoDB** database for a production environment.

## Getting Started

This project is configured to run directly in the browser without a build step or package installation, as dependencies are loaded from a CDN via an import map.

### Prerequisites

You only need a modern web browser and a way to serve the files locally. A simple local web server is recommended.

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Serve the files:**
    The easiest way to run a local server is using `npx serve`.
    ```bash
    npx serve
    ```
    This will start a server and give you a URL (usually `http://localhost:3000`).

3.  **Open in browser:**
    Open the provided URL in your web browser to use the application.

### Login Credentials

You can log in with the following mock credentials. The password for each role is simply `[role]@`.

| Role      | Username / Email             | Password    | Notes                                  |
| :-------- | :--------------------------- | :---------- | :------------------------------------- |
| **Student** | `surya` (or any other student name) | `student@`  | Student names: syam, varun, saikiran, murali, ganesh |
| **Cashier** | `cashier@campus.edu`         | `cashier@`  | (This is a pre-filled email)           |
| **Manager** | `manager@campus.edu`         | `manager@`  | (This is a pre-filled email)           |
| **Admin**   | `admin@campus.edu`           | `admin@`    | (This is a pre-filled email)           |


## Optional: Setting Up a Real Backend

The application is currently frontend-only. However, it includes a script to seed a MongoDB database, which can be used as a starting point for building a full-stack application.

### Prerequisites

*   [Node.js](https://nodejs.org/) installed
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### Steps

1.  **Install MongoDB Driver:**
    From the project root, run:
    ```bash
    npm install mongodb
    ```

2.  **Run the Seed Script:**
    This script will drop the existing database (if any) and populate it with fresh data.
    ```bash
    node scripts/seed-mongo.js
    ```

3.  **Next Steps:**
    To connect the frontend to this database, you would need to:
    *   Create a backend server (e.g., using Node.js/Express) with API endpoints that perform CRUD operations on the MongoDB collections.
    *   Update the functions in `src/services/apiService.ts` to use `fetch` to call your new backend API endpoints instead of the mock `dbClient`.

## Project Structure

```
.
├── public/
├── scripts/
│   └── seed-mongo.js     # Node.js script to seed a real MongoDB database
├── src/
│   ├── components/       # Reusable React components (Layout, Card, etc.)
│   ├── contexts/         # React Context for Auth and Toasts
│   ├── pages/            # Top-level page components for each role
│   ├── services/         # API calls, mock DB, and authentication logic
│   ├── App.tsx           # Main application component with routing
│   ├── index.tsx         # Entry point for React
│   └── types.ts          # TypeScript type definitions
├── index.html            # Main HTML file, includes import map for dependencies
└── README.md             # This file
```

## Available Roles & Functionality

### Student
*   **View Dashboard:** See current meal card balance and card status.
*   **Transaction History:** View a list of recent purchases and recharges.
*   **Request Recharge:** Submit a request to add funds to the meal card, which then goes to a manager for approval.

### Cashier
*   **Point of Sale (POS):** Select meals from a menu to add to a student's cart.
*   **Manage Cart:** Add/remove items and adjust quantities.
*   **Student Lookup:** Find a student's profile and balance by entering their card number.
*   **Process Payments:** Charge the total amount to the student's card if the balance is sufficient.

### Manager
*   **Review Requests:** View a table of all pending recharge requests from students.
*   **Approve/Reject:** Approve or reject requests. Approved requests immediately credit the student's balance.

### Admin
*   **Statistical Overview:** View key metrics like total students, active cards, and total balance float.
*   **Data Visualization:**
    *   See a bar chart of weekly transactions (Purchases vs. Recharges).
    *   See a pie chart of the top 5 most popular meals by sales value.
*   **User Management:** View a filterable and sortable list of all users in the system.

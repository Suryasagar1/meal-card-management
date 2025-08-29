

import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAdminStats, getAllUsers } from '../../services/apiService';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';
import { DocumentArrowDownIcon, MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from '../../components/Icons';
import { User, Role } from '../../types';

interface AdminStats {
  totalStudents: number;
  activeCards: number;
  totalBalanceFloat: number;
  todaysTransactionsCount: number;
  todaysTransactionsValue: number;
  weeklyTxns: { name: string; RECHARGE: number; PURCHASE: number }[];
  topMeals: { name: string; value: number }[];
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <Card className="text-center transition-all hover:shadow-xl hover:-translate-y-1">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-4xl font-bold text-[var(--kiet-primary)] dark:text-indigo-300">{value}</p>
    </Card>
);

const roleColors: Record<Role, string> = {
    [Role.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200',
    [Role.MANAGER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200',
    [Role.CASHIER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200',
    [Role.STUDENT]: 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200',
};

type SortableKeys = keyof User;

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });

    useEffect(() => {
        setLoading(true);
        Promise.all([getAdminStats(), getAllUsers()])
            .then(([statsData, usersData]) => {
                setStats(statsData);
                setUsers(usersData);
            })
            .catch(err => {
                console.error("Failed to load admin data", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const sortedAndFilteredUsers = useMemo(() => {
        const filteredUsers = users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower);
            const matchesRole = !roleFilter || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });

        if (sortConfig !== null) {
            filteredUsers.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredUsers;
    }, [users, searchTerm, roleFilter, sortConfig]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const handleDownloadCsv = () => {
        if (!stats) return;
        const headers = ["Day", "Purchases", "Recharges"];
        const csvRows = [
            headers.join(','),
            ...stats.weeklyTxns.map(row => 
                [row.name, row.PURCHASE ?? 0, row.RECHARGE ?? 0].join(',')
            )
        ];
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'weekly-transactions.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const SortableHeader: React.FC<{ columnKey: SortableKeys, title: string }> = ({ columnKey, title }) => {
        const isSorted = sortConfig?.key === columnKey;
        const Icon = sortConfig?.direction === 'ascending' ? ChevronUpIcon : ChevronDownIcon;
        return (
            <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => requestSort(columnKey)}
            >
                <div className="flex items-center gap-2">
                    {title}
                    {isSorted && <Icon className="w-4 h-4" />}
                </div>
            </th>
        );
    };

    if (loading) {
        return <Layout title="Admin Dashboard"><div className="flex justify-center p-8"><Spinner /></div></Layout>;
    }
    
    if (!stats) {
        return <Layout title="Admin Dashboard"><p className="text-center text-red-500">Failed to load statistics.</p></Layout>;
    }

    const COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#f97316', '#0ea5e9'];

    return (
        <Layout title="Admin Dashboard">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Students" value={stats.totalStudents} />
                    <StatCard title="Active Cards" value={stats.activeCards} />
                    <StatCard title="Balance Float" value={`₹${stats.totalBalanceFloat.toFixed(2)}`} />
                    <StatCard title="Today's Txns" value={`${stats.todaysTransactionsCount}`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <Card className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Weekly Transactions</h3>
                            <button 
                                onClick={handleDownloadCsv}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--kiet-primary)] bg-indigo-100 dark:bg-[var(--kiet-dark-bg)] dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                                <span>Download CSV</span>
                            </button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.weeklyTxns}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd' }} />
                                <Legend />
                                <Bar dataKey="PURCHASE" fill="var(--kiet-primary)" name="Purchases" />
                                <Bar dataKey="RECHARGE" fill="var(--kiet-secondary)" name="Recharges" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card className="lg:col-span-2">
                        <h3 className="font-bold text-lg mb-4">Top 5 Meals (by Value)</h3>
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.topMeals}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.topMeals.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                <Card>
                    <h3 className="font-bold text-lg mb-4">User Management</h3>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="relative flex-grow">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[var(--kiet-primary)] outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">Filter by role:</span>
                            <button onClick={() => setRoleFilter(null)} className={`px-3 py-1 text-sm rounded-full ${!roleFilter ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>All</button>
                            {Object.values(Role).map(role => (
                                <button key={role} onClick={() => setRoleFilter(role)} className={`px-3 py-1 text-sm rounded-full ${roleFilter === role ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>{role}</button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <SortableHeader columnKey="name" title="Name" />
                                    <SortableHeader columnKey="email" title="Email" />
                                    <SortableHeader columnKey="role" title="Role" />
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedAndFilteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>{user.role}</span>
                                        </td>
                                    </tr>
                                ))}
                                {sortedAndFilteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-gray-500">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
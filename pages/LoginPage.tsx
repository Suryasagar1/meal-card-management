import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

const RoleButton: React.FC<{ role: Role; selectedRole: Role; setSelectedRole: (role: Role) => void; }> = ({ role, selectedRole, setSelectedRole }) => {
    const isSelected = role === selectedRole;
    return (
        <button
            type="button"
            onClick={() => setSelectedRole(role)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                    ? 'bg-indigo-50 border-[var(--kiet-primary)] dark:bg-indigo-900/50 dark:border-indigo-400'
                    : 'bg-gray-100 border-transparent hover:border-gray-300 dark:bg-gray-700 dark:hover:border-gray-500'
            }`}
        >
            <p className={`font-bold ${isSelected ? 'text-[var(--kiet-primary)] dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
                {role.charAt(0) + role.slice(1).toLowerCase()}
            </p>
        </button>
    );
};


const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const handleRoleChange = (role: Role) => {
      setSelectedRole(role);
      setIdentifier('');
      setPassword('');
      setError(null);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const expectedPassword = `${selectedRole.toLowerCase()}@`;
    if (password !== expectedPassword) {
        setError(`Invalid password. Hint: Use '${expectedPassword}'`);
        setIsLoading(false);
        return;
    }

    try {
      let credentials: { email?: string; name?: string } = {};
      if (selectedRole === Role.STUDENT) {
        if (!identifier) {
          setError("Student name is required.");
          setIsLoading(false);
          return;
        }
        credentials.name = identifier;
      } else {
        // Default emails from seedData
        credentials.email = `${selectedRole.toLowerCase()}@campus.edu`;
      }
      await login(credentials, selectedRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login Failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--kiet-dark-bg)] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="p-3 bg-[var(--kiet-primary)] rounded-xl shadow-lg mb-4">
             <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.5 0l-1.49-1.49L2.25 12l-1.49 1.49L2.25 15l1.49-1.49zM18 19.5l-1.49-1.49L15 21l-1.49-1.49L12 21l-1.49-1.49L9 21l-1.49-1.49L6 21l-1.49-1.49L3 21m15 0l1.49-1.49L21 18l1.49 1.49L24 18l1.49 1.49L27 18" />
             </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">KIET Meal Card</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to access your account</p>
        </div>

        <div className="bg-white dark:bg-[var(--kiet-dark-card)] shadow-2xl rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-2">Select Your Role</label>
                    <div className="grid grid-cols-2 gap-3">
                        <RoleButton role={Role.STUDENT} selectedRole={selectedRole} setSelectedRole={handleRoleChange} />
                        <RoleButton role={Role.CASHIER} selectedRole={selectedRole} setSelectedRole={handleRoleChange} />
                        <RoleButton role={Role.MANAGER} selectedRole={selectedRole} setSelectedRole={handleRoleChange} />
                        <RoleButton role={Role.ADMIN} selectedRole={selectedRole} setSelectedRole={handleRoleChange} />
                    </div>
                </div>
                
                {selectedRole === Role.STUDENT && (
                    <div>
                        <label htmlFor="name" className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-2">Student Name</label>
                        <input
                            id="name"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--kiet-primary)]"
                            placeholder="e.g. surya"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="password" className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--kiet-primary)]"
                        placeholder={`e.g. ${selectedRole.toLowerCase()}@`}
                    />
                </div>
                 {error && <p className="text-red-500 text-xs text-center pt-1">{error}</p>}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center px-4 py-3 text-sm font-semibold text-white bg-[var(--kiet-primary)] rounded-lg hover:bg-[var(--kiet-primary-darker)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--kiet-primary)] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                           'Login'
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
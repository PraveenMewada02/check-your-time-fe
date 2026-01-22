/**
 * Example Authentication Component
 * Demonstrates login/register functionality
 */

'use client';

import { useState } from 'react';
import { useMutation } from '@/lib/api/hooks/useApi';
import { login, register, type LoginCredentials, type RegisterData, type AuthResponse } from '@/lib/api/services/auth';
import { ApiError } from '@/lib/api/client';

export default function AuthExample() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
  });

  const loginMutation = useMutation<AuthResponse, LoginCredentials>();
  const registerMutation = useMutation<AuthResponse, RegisterData>();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginMutation.mutate(login, loginData);
    
    if (result.data && !result.error) {
      // Successfully logged in
      alert(`Welcome, ${result.data.user.username}!`);
      // Redirect or update app state here
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerMutation.mutate(register, registerData);
    
    if (result.data && !result.error) {
      // Successfully registered
      alert(`Account created! Welcome, ${result.data.user.username}!`);
      // Redirect or update app state here
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isLogin ? 'Login' : 'Register'}
      </h1>

      <div className="mb-4 flex justify-center gap-4">
        <button
          onClick={() => setIsLogin(true)}
          className={`px-4 py-2 rounded ${isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 rounded ${!isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Register
        </button>
      </div>

      {isLogin ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.loading}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loginMutation.loading ? 'Logging in...' : 'Login'}
          </button>
          
          {loginMutation.error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {loginMutation.error.message}
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={registerMutation.loading}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {registerMutation.loading ? 'Registering...' : 'Register'}
          </button>
          
          {registerMutation.error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {registerMutation.error.message}
              {registerMutation.error.errors && (
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(registerMutation.error.errors).map(([field, messages]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {messages.join(', ')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}



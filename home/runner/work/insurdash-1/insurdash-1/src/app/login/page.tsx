
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
      headers: { 'Content-Type': 'application/json' },
    });
    
    setLoading(false);

    if (res.ok) {
        // The onAuthStateChange in AuthProvider will handle the redirect
        // to the dashboard page upon successful login.
        router.refresh(); // Refresh the page to let middleware and auth provider detect the session
    } else {
        const { error } = await res.json();
        alert(`登录失败: ${error}`);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-gray-900">登录</h1>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 sr-only">邮箱</label>
                    <input className="w-full px-4 py-2 text-gray-700 bg-gray-100 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" name="email" type="email" placeholder="邮箱" required />
                </div>
                <div>
                    <label htmlFor="password"  className="text-sm font-medium text-gray-700 sr-only">密码</label>
                    <input className="w-full px-4 py-2 text-gray-700 bg-gray-100 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" name="password" type="password" placeholder="密码" required />
                </div>
                <button disabled={loading} className="w-full px-4 py-2 font-semibold text-white transition-colors duration-300 bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                    {loading ? '登录中…' : '登录'}
                </button>
            </form>
        </div>
    </div>
  );
}

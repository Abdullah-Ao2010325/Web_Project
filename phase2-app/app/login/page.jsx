'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (role === 'Admin') {
      document.cookie = 'userRole=Admin; path=/';
      router.push('/');
    } else {
      alert('Only Admins allowed to view statistics.');
    }
  };

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <input
        type="text"
        placeholder="Enter role (e.g., Admin)"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

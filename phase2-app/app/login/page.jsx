// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import '@/app/styles/login.css';

// export default function LoginPage() {
//   const router = useRouter();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const res = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await res.json();
//       if (data.success) {
//         router.push('/stats');
//       } else {
//         setError(data.message || 'Invalid credentials');
//       }
//     } catch (err) {
//       setError('An unexpected error occurred. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <div className="login-header">
//           <i className="fas fa-lock"></i>
//           <h2>Admin Dashboard</h2>
//           <p>Secure access to system statistics</p>
//         </div>
//         <form onSubmit={handleLogin} className="login-form">
//           <div className="input-group">
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//               placeholder=" "
//               className={username ? 'filled' : ''}
//             />
//             <label>Username</label>
//           </div>
//           <div className="input-group">
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               placeholder=" "
//               className={password ? 'filled' : ''}
//             />
//             <label>Password</label>
//           </div>
//           {error && <p className="error-message">{error}</p>}
//           <button type="submit" disabled={isLoading}>
//             {isLoading ? (
//               <i className="fas fa-spinner fa-spin"></i>
//             ) : (
//               <>
//                 <i className="fas fa-sign-in-alt"></i> Login
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
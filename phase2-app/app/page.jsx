// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function LoginPage() {
//   const router = useRouter();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     const res = await fetch('/api/login', {
//       method: 'POST',
//       body: JSON.stringify({ username, password }),
//     });

//     const data = await res.json();
//     if (data.success) {
//       router.push('/stats');
//     } else {
//       setError(data.message);
//     }
//   };

//   return (
//     <>
//       <div className="blur-bg-overlay show-popup" />
//       <section className="form-interface show-popup">
//         <div className="login-form-box">
//           <div className="form-info">
//             <h2>Admin Access</h2>
//             <p>Only administrators can access system statistics.</p>
//           </div>
//           <div className="form-container">
//             <h2>Login</h2>
//             <form onSubmit={handleLogin}>
//               <div className="input-field">
//                 <input
//                   type="text"
//                   required
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                 />
//                 <label>Username</label>
//               </div>
//               <div className="input-field">
//                 <input
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//                 <label>Password</label>
//               </div>
//               <button type="submit">Login</button>
//               {error && <p style={{ color: 'red' }}>{error}</p>}
//             </form>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// 'use client'
// import React from "react";

// export default function Login() {
//   return (
//     <div className="login-container">
//       <h2>Login</h2>
//       <form>
//         <div className="input-field">
//           <input type="text" id="username" required />
//           <label htmlFor="username">Username</label>
//         </div>
//         <div className="input-field">
//           <input type="password" id="password" required />
//           <label htmlFor="password">Password</label>
//         </div>
//         <span className="forgot-pass">
//           <a href="#">Forgot password?</a>
//         </span>
//         <button className="login-btn" type="submit">Login</button>
//         <button className="github-btn" type="button">
//           <img
//             src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
//             alt="GitHub Logo"
//           />
//           Login with GitHub
//         </button>
//       </form>
//     </div>
//   );
// }


'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { signIn } from "next-auth/react";
import "@/app/styles/login.css"; 

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token"); //get the token

    if (token) {
      router.push("/stats");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Cookies.set("token", data.token, { expires: 1 / 24 }); // 1 hour 
        router.push("/stats");
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login.");
    }
  };


  const handleGitHubLogin = () => { //third party
    signIn("github");
  };


  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-field">
          <input
            type="text"
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="username">Username</label>
        </div>
        <div className="input-field">
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password">Password</label>
        </div>
        <span className="forgot-pass">
          <a href="#">Forgot password?</a>
        </span>
        <button className="login-btn" type="submit">Login</button>
        <button className="github-btn" type="button" onClick={handleGitHubLogin}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
            alt="GitHub Logo"
          />
          Login with GitHub
        </button>
      </form>
    </div>
  );
}

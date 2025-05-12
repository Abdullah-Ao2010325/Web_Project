'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";


const JWT_SECRET = process.env.JWT_SECRET;

export default function Home() {
  const router = useRouter();


  useEffect(() => {
    const token = Cookies.get('token');

    if (!token) {
      router.push('/');
    }
  }, [router]);



  const statsLinks = [
    { name: 'Total Students', path: '/stats/total-students' },
    { name: 'Total Courses', path: '/stats/total-courses' },
    { name: 'Registered Students per Term', path: '/stats/registered-students-per-term' },
    { name: 'Average CGPA', path: '/stats/average-cgpa' },
    { name: 'Students per Major', path: '/stats/students-per-major' },
    { name: 'Top Registered Courses', path: '/stats/top-registered-courses' },
    { name: 'Low CGPA Rate per Course', path: '/stats/low-cgpa-rate-per-course' },
    { name: 'Total Credit Hours Completed', path: '/stats/total-credit-hours-completed' },
    { name: 'Students per Advisor', path: '/stats/students-per-advisor' },
    { name: 'Average Courses per Student', path: '/stats/average-courses-per-student' },
    { name: 'Percentage CGPA > 3.0', path: '/stats/percentage-cgpa-above-three' },
  ];

  const handleClick = (path) => {
    router.push(path);
  };

  return (
    <div className="container">
      <h1 className="welcome-content">Statistics Overview</h1>
      <div className="course-section">
        <ul className="progress-details">
          {statsLinks.map((link, index) => (
            <li key={index} className="progress-item">
              <button onClick={() => handleClick(link.path)} className="register-btn">
                {link.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Cookies from 'js-cookie';
import {
  getTotalStudents,
  getTotalCourses,
  getTotalInstructors,
} from '@/app/server-actions/actions';
import '@/app/styles/dashboard.css';

export default function Home() {
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalInstructors: 0,
  });

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!session && !token && status !== 'loading') {
      router.push('/');
    }

    const fetchSummary = async () => {
      const totalStudents = await getTotalStudents();
      const totalCourses = await getTotalCourses();
      const totalInstructors = await getTotalInstructors();

      setSummary({
        totalStudents: totalStudents.success ? totalStudents.data.length : 0,
        totalCourses: totalCourses.success ? totalCourses.data.length : 0,
        totalInstructors: totalInstructors.success ? totalInstructors.count : 0,
      });
    };

    fetchSummary();
  }, [session, status, router]);

  const statsLinks = [
    { name: 'Total Students', path: '/stats/total-students', icon: 'fas fa-users' },
    { name: 'Total Courses', path: '/stats/total-courses', icon: 'fas fa-book' },
    { name: 'Registered Students per Term', path: '/stats/registered-students-per-term', icon: 'fas fa-calendar' },
    { name: 'Average CGPA', path: '/stats/average-cgpa', icon: 'fas fa-chart-line' },
    { name: 'Students per Major', path: '/stats/students-per-major', icon: 'fas fa-graduation-cap' },
    { name: 'Top Registered Courses', path: '/stats/top-registered-courses', icon: 'fas fa-star' },
    { name: 'Low CGPA Rate per Course', path: '/stats/low-cgpa-rate-per-course', icon: 'fas fa-exclamation-circle' },
    { name: 'Students per Advisor', path: '/stats/students-per-advisor', icon: 'fas fa-chalkboard-teacher' },
    { name: 'Average Courses per Student', path: '/stats/average-courses-per-student', icon: 'fas fa-list' },
    { name: 'Percentage CGPA > 3.0', path: '/stats/percentage-cgpa-above-three', icon: 'fas fa-check-circle' },
    { name: 'Course Completion Rates', path: '/stats/course-completion', icon: 'fas fa-book-open' },
    { name: 'Instructor Effectiveness', path: '/stats/instructor-effectiveness', icon: 'fas fa-chalkboard-teacher' },
    { name: 'Prerequisite Effectiveness', path: '/stats/prerequisite-effectiveness', icon: 'fas fa-bookmark' },
    { name: 'Student Progress', path: '/stats/student-progress', icon: 'fas fa-graduation-cap' },
    { name: 'CGPA Trends by Term', path: '/stats/cgpa-trends', icon: 'fas fa-chart-line' },
    { name: 'Advisor Workload', path: '/stats/advisor-workload', icon: 'fas fa-user-tie' },
    { name: 'Courses by Major', path: '/stats/courses-by-major', icon: 'fas fa-table' },
  ];

  const handleClick = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    Cookies.remove('token');
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <i className="fas fa-tachometer-alt"></i> Statistics Dashboard
          </h1>
          <button onClick={handleLogout} className="logout-button" aria-label="Logout">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
        <div className="stats-summary">
          <div className="card">
            <i className="fas fa-users"></i> Total Students: {summary.totalStudents}
          </div>
          <div className="card">
            <i className="fas fa-book"></i> Total Courses: {summary.totalCourses}
          </div>
          <div className="card">
            <i className="fas fa-chalkboard-teacher"></i> Total Instructors: {summary.totalInstructors}
          </div>
        </div>
        <div className="stats-navigation">
          {statsLinks.map((link, index) => (
            <button
              key={index}
              className="nav-button"
              onClick={() => handleClick(link.path)}
              aria-label={`View ${link.name} statistics`}
            >
              <i className={link.icon}></i> {link.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

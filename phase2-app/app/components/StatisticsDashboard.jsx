'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Cookies from 'js-cookie';
import {
  getTotalStudents,
  getTotalCourses,
  getTotalInstructors,
  getRegisteredStudentsPerTerm,
  getDynamicAverageGPA,
  getStudentsPerMajor,
  getTopRegisteredCourses,
  getLowCGPARatePerCourse,
  getStudentsPerAdvisor,
  getAverageCoursesPerStudent,
  getPercentageCGPAAboveThree,
  getCourseCompletionRate,
  getInstructorEffectiveness,
  getPrerequisiteEffectiveness,
  getStudentProgress,
  getCGPATrendsByTerm,
  getAdvisorWorkload,
  getCoursesByMajor,
} from '@/app/server-actions/actions';
import '@/app/styles/dashboard.css';

export default function StatisticsDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalInstructors: 0,
    registeredPerTerm: [],
    averageCGPA: 0,
    studentsPerMajor: [],
    topCourses: [],
    failureRates: [],
    studentsPerAdvisor: [],
    averageCoursesPerStudent: 0,
    percentageAboveThree: 0,
    courseCompletionRate: [],
    instructorEffectiveness: [],
    prerequisiteEffectiveness: [],
    studentProgress: [],
    cgpaTrendsByTerm: [],
    advisorWorkload: [],
    coursesByMajor: [],
  });

  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }

    const fetchStats = async () => {
      const [
        totalStudentsRes,
        totalCoursesRes,
        totalInstructorsRes,
        registeredPerTermRes,
        averageCGPARes,
        studentsPerMajorRes,
        topCoursesRes,
        failureRatesRes,
        studentsPerAdvisorRes,
        averageCoursesRes,
        percentageAboveThreeRes,
        courseCompletionRes,
        instructorEffectivenessRes,
        prerequisiteEffectivenessRes,
        studentProgressRes,
        cgpaTrendsRes,
        advisorWorkloadRes,
        coursesByMajorRes,
      ] = await Promise.all([
        getTotalStudents(),
        getTotalCourses(),
        getTotalInstructors(),
        getRegisteredStudentsPerTerm(),
        getDynamicAverageGPA(),
        getStudentsPerMajor(),
        getTopRegisteredCourses(),
        getLowCGPARatePerCourse(),
        getStudentsPerAdvisor(),
        getAverageCoursesPerStudent(),
        getPercentageCGPAAboveThree(),
        getCourseCompletionRate(),
        getInstructorEffectiveness(),
        getPrerequisiteEffectiveness(),
        getStudentProgress(),
        getCGPATrendsByTerm(),
        getAdvisorWorkload(),
        getCoursesByMajor(),
      ]);

      setStats({
        totalStudents: totalStudentsRes.success ? totalStudentsRes.data.length : 0,
        totalCourses: totalCoursesRes.success ? totalCoursesRes.data.length : 0,
        totalInstructors: totalInstructorsRes.success ? totalInstructorsRes.count : 0,
        registeredPerTerm: registeredPerTermRes.success ? registeredPerTermRes.data : [],
        averageCGPA: averageCGPARes.success ? averageCGPARes.data : 0,
        studentsPerMajor: studentsPerMajorRes.success ? studentsPerMajorRes.data : [],
        topCourses: topCoursesRes.success ? topCoursesRes.data : [],
        failureRates: failureRatesRes.success ? failureRatesRes.data : [],
        studentsPerAdvisor: studentsPerAdvisorRes.success ? studentsPerAdvisorRes.data : [],
        averageCoursesPerStudent: averageCoursesRes.success
          ? averageCoursesRes.data.reduce((sum, s) => sum + (s.completedCoursesCount || 0), 0) /
            (averageCoursesRes.data.length || 1)
          : 0,
        percentageAboveThree: percentageAboveThreeRes.success ? percentageAboveThreeRes.data : 0,
        courseCompletionRate: courseCompletionRes.success ? courseCompletionRes.data : [],
        instructorEffectiveness: instructorEffectivenessRes.success ? instructorEffectivenessRes.data : [],
        prerequisiteEffectiveness: prerequisiteEffectivenessRes.success ? prerequisiteEffectivenessRes.data : [],
        studentProgress: studentProgressRes.success ? studentProgressRes.data : [],
        cgpaTrendsByTerm: cgpaTrendsRes.success ? cgpaTrendsRes.data : [],
        advisorWorkload: advisorWorkloadRes.success ? advisorWorkloadRes.data : [],
        coursesByMajor: coursesByMajorRes.success ? coursesByMajorRes.data : [],
      });
    };
    fetchStats();
  }, []);

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
            <i className="fas fa-tachometer-alt"></i> Student Management Statistics
          </h1>
          <button onClick={handleLogout} className="logout-button" aria-label="Logout">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
        <div className="stats-summary">
          <div className="card">
            <i className="fas fa-users"></i> Total Students: {stats.totalStudents}
          </div>
          <div className="card">
            <i className="fas fa-book"></i> Total Courses: {stats.totalCourses}
          </div>
          <div className="card">
            <i className="fas fa-chalkboard-teacher"></i> Total Instructors: {stats.totalInstructors}
          </div>
          <div className="card">
            <i className="fas fa-calendar"></i> Registered Students per Term:{' '}
            {stats.registeredPerTerm.map((item, index) => (
              <span key={index}>
                {item.term}: {item.count}
                {index < stats.registeredPerTerm.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-chart-line"></i> Average CGPA: {stats.averageCGPA.toFixed(2)}
          </div>
          <div className="card">
            <i className="fas fa-graduation-cap"></i> Students per Major:{' '}
            {stats.studentsPerMajor.map((item, index) => (
              <span key={index}>
                {item.majorName}: {item.count}
                {index < stats.studentsPerMajor.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-star"></i> Top 3 Courses:{' '}
            {stats.topCourses.map((item, index) => (
              <span key={index}>
                {item.courseName}: {item.registrations}
                {index < stats.topCourses.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-exclamation-circle"></i> Low CGPA Rate per Course:{' '}
            {stats.failureRates.map((item, index) => (
              <span key={index}>
                {item.courseName}: {item.failureRate.toFixed(2)}%
                {index < stats.failureRates.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-chalkboard-teacher"></i> Students per Advisor:{' '}
            {stats.studentsPerAdvisor.map((item, index) => (
              <span key={index}>
                {item.advisor}: {item.count}
                {index < stats.studentsPerAdvisor.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-list"></i> Average Courses per Student: {stats.averageCoursesPerStudent.toFixed(2)}
          </div>
          <div className="card">
            <i className="fas fa-check-circle"></i> Percentage CGPA {'>'} 3.0: {stats.percentageAboveThree.toFixed(2)}%
          </div>
          <div className="card">
            <i className="fas fa-book-open"></i> Course Completion Rates:{' '}
            {stats.courseCompletionRate.slice(0, 3).map((item, index) => (
              <span key={index}>
                {item.courseName}: {item.completionRate.toFixed(2)}%
                {index < Math.min(stats.courseCompletionRate.length, 3) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-chalkboard-teacher"></i> Instructor Effectiveness:{' '}
            {stats.instructorEffectiveness.slice(0, 3).map((item, index) => (
              <span key={index}>
                {item.instructorName}: {item.averageStudentCGPA.toFixed(2)}
                {index < Math.min(stats.instructorEffectiveness.length, 3) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-bookmark"></i> Prerequisite Effectiveness:{' '}
            {stats.prerequisiteEffectiveness.slice(0, 3).map((item, index) => (
              <span key={index}>
                {item.courseName}: {item.avgCGPAWithPrereq.toFixed(2)}
                {index < Math.min(stats.prerequisiteEffectiveness.length, 3) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-graduation-cap"></i> Student Progress:{' '}
            {stats.studentProgress.slice(0, 3).map((item, index) => (
              <span key={index}>
                {item.fullName}: {item.progressPercentage.toFixed(2)}%
                {index < Math.min(stats.studentProgress.length, 3) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-chart-line"></i> CGPA Trends by Term:{' '}
            {stats.cgpaTrendsByTerm.slice(0, 3).map((item, index) => (
              <span key={index}>
                {item.term}: {item.averageCGPA.toFixed(2)}
                {index < Math.min(stats.cgpaTrendsByTerm.length, 3) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-user-tie"></i> Advisor Workload:{' '}
            {stats.advisorWorkload.slice(0, 3).map((item, index) => (
              <span key={index}>
                {item.advisor}: {item.studentCount}
                {index < Math.min(stats.advisorWorkload.length, 3) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="card">
            <i className="fas fa-table"></i> Courses by Major:{' '}
            {stats.coursesByMajor.slice(0, 3).map((item, index) => (
              <span key={index}>
                {item.major}: {item.courses.join(', ')}
                {index < Math.min(stats.coursesByMajor.length, 3) - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

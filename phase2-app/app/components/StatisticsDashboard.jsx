'use client';

import { useState, useEffect } from 'react';
import {
  getTotalStudents,
  getTotalCourses,
  getRegisteredStudentsPerTerm,
  getAverageCGPA,
  getStudentsPerMajor,
  getTopRegisteredCourses,
  getFailureRatePerCourse,
  getTotalCreditHoursCompleted,
  getStudentsPerAdvisor,
  getAverageCoursesPerStudent,
  getPercentageCGPAAboveThree,
} from 'app/server-actions/stats-repo';

export default function StatisticsDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    registeredPerTerm: [],
    averageCGPA: 0,
    studentsPerMajor: [],
    topCourses: [],
    failureRates: [],
    totalCreditHours: 0,
    studentsPerAdvisor: [],
    averageCoursesPerStudent: 0,
    percentageAboveThree: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        totalStudentsRes,
        totalCoursesRes,
        registeredPerTermRes,
        averageCGPARes,
        studentsPerMajorRes,
        topCoursesRes,
        failureRatesRes,
        totalCreditHoursRes,
        studentsPerAdvisorRes,
        averageCoursesRes,
        percentageAboveThreeRes,
      ] = await Promise.all([
        getTotalStudents(),
        getTotalCourses(),
        getRegisteredStudentsPerTerm(),
        getAverageCGPA(),
        getStudentsPerMajor(),
        getTopRegisteredCourses(),
        getFailureRatePerCourse(),
        getTotalCreditHoursCompleted(),
        getStudentsPerAdvisor(),
        getAverageCoursesPerStudent(),
        getPercentageCGPAAboveThree(),
      ]);

      setStats({
        totalStudents: totalStudentsRes.success ? totalStudentsRes.data : 0,
        totalCourses: totalCoursesRes.success ? totalCoursesRes.data : 0,
        registeredPerTerm: registeredPerTermRes.success ? registeredPerTermRes.data : [],
        averageCGPA: averageCGPARes.success ? averageCGPARes.data : 0,
        studentsPerMajor: studentsPerMajorRes.success ? studentsPerMajorRes.data : [],
        topCourses: topCoursesRes.success ? topCoursesRes.data : [],
        failureRates: failureRatesRes.success ? failureRatesRes.data : [],
        totalCreditHours: totalCreditHoursRes.success ? totalCreditHoursRes.data : 0,
        studentsPerAdvisor: studentsPerAdvisorRes.success ? studentsPerAdvisorRes.data : [],
        averageCoursesPerStudent: averageCoursesRes.success ? averageCoursesRes.data : 0,
        percentageAboveThree: percentageAboveThreeRes.success ? percentageAboveThreeRes.data : 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="container">
      <h1 className="welcome-content">Student Management Statistics</h1>
      <div className="course-section">
        <ul className="progress-details">
          <li className="progress-item">Total Students: {stats.totalStudents}</li>
          <li className="progress-item">Total Courses: {stats.totalCourses}</li>
          <li className="progress-item">
            Registered Students per Term: {stats.registeredPerTerm.map((item, index) => (
              <span key={index}>{item.term}: {item.count} {index < stats.registeredPerTerm.length - 1 ? ', ' : ''}</span>
            ))}
          </li>
          <li className="progress-item">Average CGPA: {stats.averageCGPA.toFixed(2)}</li>
          <li className="progress-item">
            Students per Major: {stats.studentsPerMajor.map((item, index) => (
              <span key={index}>{item.majorName}: {item.count} {index < stats.studentsPerMajor.length - 1 ? ', ' : ''}</span>
            ))}
          </li>
          <li className="progress-item">
            Top 3 Courses: {stats.topCourses.map((item, index) => (
              <span key={index}>{item.courseName}: {item.registrations} {index < stats.topCourses.length - 1 ? ', ' : ''}</span>
            ))}
          </li>
          <li className="progress-item">
            Failure Rate per Course: {stats.failureRates.map((item, index) => (
              <span key={index}>{item.courseName}: {item.failureRate.toFixed(2)}% {index < stats.failureRates.length - 1 ? ', ' : ''}</span>
            ))}
          </li>
          <li className="progress-item">Total Credit Hours Completed: {stats.totalCreditHours.toFixed(2)}</li>
          <li className="progress-item">
            Students per Advisor: {stats.studentsPerAdvisor.map((item, index) => (
              <span key={index}>{item.advisorId}: {item.count} {index < stats.studentsPerAdvisor.length - 1 ? ', ' : ''}</span>
            ))}
          </li>
          <li className="progress-item">Average Courses per Student: {stats.averageCoursesPerStudent.toFixed(2)}</li>
          <li className="progress-item">Percentage CGPA {'>'} 3.0: {stats.percentageAboveThree.toFixed(2)}%</li>
        </ul>
      </div>
    </div>
  );
}
'use server';

import statisticsRepo from '../repo/stats-repo';

export async function getTotalStudents() {
  return  await statisticsRepo.getTotalStudents();
}

export async function getTotalCourses() {
  return await statisticsRepo.getTotalCourses();
}

export async function getRegisteredStudentsPerTerm() {
  return await statisticsRepo.getRegisteredStudentsPerTerm() ;
}

export async function getAverageCGPA() {
  return await statisticsRepo.getAverageCGPA() ;
}

export async function getStudentsPerMajor() {
  return await statisticsRepo.getStudentsPerMajor() ;
}

export async function getTopRegisteredCourses() {
  return await statisticsRepo.getTopRegisteredCourses() ;
}

export async function getFailureRatePerCourse() {
  return await statisticsRepo.getFailureRatePerCourse() ;
}

export async function getTotalCreditHoursCompleted() {
  return await statisticsRepo.getTotalCreditHoursCompleted() ;
}

export async function getStudentsPerAdvisor() {
  return await statisticsRepo.getStudentsPerAdvisor() ;
}

export async function getAverageCoursesPerStudent() {
  return await statisticsRepo.getAverageCoursesPerStudent() ;
}

export async function getPercentageCGPAAboveThree() {
  return await statisticsRepo.getPercentageCGPAAboveThree() ;
}
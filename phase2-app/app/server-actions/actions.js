'use server';

import statisticsRepo from '@/app/repo/stats-repo';

export const getTotalStudents = async () => await statisticsRepo.getTotalStudents();
export const getTotalCourses = async () => await statisticsRepo.getTotalCourses();
export const getTotalInstructors = async () => await statisticsRepo.getTotalInstructors();
export const getRegisteredStudentsPerTerm = async () => await statisticsRepo.getRegisteredStudentsPerTerm();
export const getDynamicAverageGPA = async () => await statisticsRepo.getDynamicAverageGPA();
export const getStudentsPerMajor = async () => await statisticsRepo.getStudentsPerMajor();
export const getTopRegisteredCourses = async () => await statisticsRepo.getTopRegisteredCourses();
export const getLowCGPARatePerCourse = async () => await statisticsRepo.getLowCGPARatePerCourse();
export const getStudentsPerAdvisor = async () => await statisticsRepo.getStudentsPerAdvisor();
export const getAverageCoursesPerStudent = async () => await statisticsRepo.getAverageCoursesPerStudent();
export const getPercentageCGPAAboveThree = async () => await statisticsRepo.getPercentageCGPAAboveThree();
export const getCourseCompletionRate = async () => await statisticsRepo.getCourseCompletionRate();
export const getInstructorEffectiveness = async () => await statisticsRepo.getInstructorEffectiveness();
export const getPrerequisiteEffectiveness = async () => await statisticsRepo.getPrerequisiteEffectiveness();
export const getStudentProgress = async () => await statisticsRepo.getStudentProgress();
export const getCGPATrendsByTerm = async () => await statisticsRepo.getCGPATrendsByTerm();
export const getAdvisorWorkload = async () => await statisticsRepo.getAdvisorWorkload();
export const getCoursesByMajor = async () => await statisticsRepo.getCoursesByMajor();
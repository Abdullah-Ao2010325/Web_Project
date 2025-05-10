import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Statistics {
  async getTotalStudents() {
    return await prisma.student.count();
  }

  async getTotalCourses() {
    return await prisma.course.count();
  }

  async getRegisteredStudentsPerTerm() {
    const result = await prisma.$queryRaw`
      SELECT term, COUNT(DISTINCT r.studentId) as count
      FROM Registration r
      JOIN Class c ON r.classId = c.classId
      GROUP BY c.term
    `;
    return result;
  }

  async getAverageCGPA() {
    const students = await prisma.student.findMany({
      select: { cgpa: true },
    });
    const totalCGPA = students.reduce((sum, student) => sum + (student.cgpa || 0), 0);
    return students.length > 0 ? totalCGPA / students.length : 0;
  }

  async getStudentsPerMajor() {
    return await prisma.$queryRaw`
      SELECT majorName, COUNT(*) as count
      FROM Student
      GROUP BY majorName
    `;
  }

  async getTopRegisteredCourses() {
    return await prisma.$queryRaw`
      SELECT c.courseId, c.courseName, COUNT(r.registrationId) as registrations
      FROM Course c
      LEFT JOIN Class cl ON c.courseId = cl.courseId
      LEFT JOIN Registration r ON cl.classId = r.classId
      GROUP BY c.courseId, c.courseName
      ORDER BY registrations DESC
      LIMIT 3
    `;
  }

  async getFailureRatePerCourse() {
    // Assuming a failure is a grade < 60 (dynamic CGPA will need grade data)
    return await prisma.$queryRaw`
      SELECT c.courseId, c.courseName,
        (COUNT(CASE WHEN s.cgpa < 2.0 THEN 1 END) * 100.0 / COUNT(r.registrationId)) as failureRate
      FROM Course c
      LEFT JOIN Class cl ON c.courseId = cl.courseId
      LEFT JOIN Registration r ON cl.classId = r.classId
      LEFT JOIN Student s ON r.studentId = s.studentId
      GROUP BY c.courseId, c.courseName
    `;
  }

  async getTotalCreditHoursCompleted() {
    const students = await prisma.student.findMany({
      include: { major: true },
    });
    return students.reduce((sum, student) => {
      const completed = JSON.parse(student.completedCourses || '[]').length;
      return sum + (completed * (student.major?.totalCreditHours / student.major?.totalNumCourses || 0));
    }, 0);
  }

  async getStudentsPerAdvisor() {
    return await prisma.$queryRaw`
      SELECT advisorId, COUNT(*) as count
      FROM Student
      GROUP BY advisorId
    `;
  }

  async getAverageCoursesPerStudent() {
    const students = await prisma.student.findMany({
      include: { registrations: true },
    });
    const totalCourses = students.reduce((sum, student) => sum + student.registrations.length, 0);
    return students.length > 0 ? totalCourses / students.length : 0;
  }

  async getPercentageCGPAAboveThree() {
    const students = await prisma.student.findMany({
      select: { cgpa: true },
    });
    const aboveThree = students.filter(student => (student.cgpa || 0) > 3.0).length;
    return students.length > 0 ? (aboveThree / students.length) * 100 : 0;
  }
}

export default new Statistics();
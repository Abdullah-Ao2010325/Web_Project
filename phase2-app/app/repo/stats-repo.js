import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Statistics {
  async getStudentGPA(studentId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { completedCourses: true },
    });

    if (!student || !student.completedCourses) return 0;

    const completed = student.completedCourses.split(',').filter(c => c);
    const gradePoints = {
      'A': 4.0, 'B+': 3.5, 'B': 3.0,
      'C+': 2.5, 'C': 2.0, 'D+': 1.5,
      'D': 1.0, 'F': 0.0
    };

    let totalPoints = 0;
    let courseCount = 0;

    for (const entry of completed) {
      const [, grade] = entry.split(':');
      const point = gradePoints[grade?.trim()];
      if (point !== undefined) {
        totalPoints += point;
        courseCount += 1;
      }
    }

    return courseCount > 0 ? totalPoints / courseCount : 0;
  }

  async getTotalStudents() {
    const count = await prisma.student.count();
    return { success: true, data: count };
  }

  async getTotalCourses() {
    const count = await prisma.course.count();
    return { success: true, data: count };
  }

  async getRegisteredStudentsPerTerm() {
    const result = await prisma.$queryRaw`
      SELECT term, COUNT(DISTINCT r.studentId) as count
      FROM Registration r
      JOIN Class c ON r.classId = c.id
      GROUP BY c.term
    `;
    return { success: true, data: result };
  }

  async getAverageCGPA() {
    const students = await prisma.student.findMany({
      select: { cgpa: true },
    });
    const totalCGPA = students.reduce((sum, student) => sum + (student.cgpa || 0), 0);
    const average = students.length > 0 ? totalCGPA / students.length : 0;
    return { success: true, data: average };
  }

  async getStudentsPerMajor() {
    const result = await prisma.$queryRaw`
      SELECT majorName, COUNT(*) as count
      FROM Student
      GROUP BY majorName
    `;
    return { success: true, data: result };
  }

  async getTopRegisteredCourses() {
  const result = await prisma.$queryRaw`
    SELECT c.id as courseId, c.courseName, COUNT(r.id) as registrations
    FROM Course c
    LEFT JOIN Class cl ON c.id = cl.courseId
    LEFT JOIN Registration r ON cl.id = r.classId
    GROUP BY c.id, c.courseName
    ORDER BY registrations DESC
    LIMIT 3
  `;
  return { success: true, data: result };
  }

  async getLowCGPARatePerCourse() {
  const result = await prisma.$queryRaw`
    SELECT c.id AS courseId, c.courseName,
           (COUNT(CASE WHEN s.cgpa < 2.0 THEN 1 END) * 100.0 / COUNT(r.id)) AS failureRate
    FROM Course c
    JOIN Class cl ON c.id = cl.courseId
    JOIN Registration r ON cl.id = r.classId
    JOIN Student s ON r.studentId = s.id
    GROUP BY c.id, c.courseName
  `;
  return { success: true, data: result };
  }


  async getTotalCreditHoursCompleted() {
    const students = await prisma.student.findMany({
      include: { major: true },
    });
    const total = students.reduce((sum, student) => {
      const completed = (student.completedCourses || '').split(',').filter(c => c).length;
      return sum + (completed * (student.major?.totalCreditHours / student.major?.totalNumberOfCourses || 0));
    }, 0);
    return { success: true, data: total };
  }

  async getStudentsPerAdvisor() {
    const result = await prisma.$queryRaw`
      SELECT advisor, COUNT(*) as count FROM Student GROUP BY advisor
    `;
    return { success: true, data: result };
  }

  async getAverageCoursesPerStudent() {
    const students = await prisma.student.findMany({
      include: { registrations: true },
    });
    const totalCourses = students.reduce((sum, student) => sum + student.registrations.length, 0);
    const average = students.length > 0 ? totalCourses / students.length : 0;
    return { success: true, data: average };
  }

  async getPercentageCGPAAboveThree() {
    const students = await prisma.student.findMany({
      select: { cgpa: true },
    });
    const aboveThree = students.filter(student => (student.cgpa || 0) > 3.0).length;
    const percentage = students.length > 0 ? (aboveThree / students.length) * 100 : 0;
    return { success: true, data: percentage };
  }

  async getEnrollmentPerCourse() {
    const result = await prisma.$queryRaw`
      SELECT c.courseName, COUNT(r.registrationId) as enrolled
      FROM Course c
      LEFT JOIN Class cl ON c.id = cl.courseId
      LEFT JOIN Registration r ON cl.id = r.classId
      GROUP BY c.courseName
    `;
    return { success: true, data: result };
  }

  async getCGPAAveragePerMajor() {
    const result = await prisma.$queryRaw`
      SELECT majorName, AVG(cgpa) as averageCGPA
      FROM Student
      GROUP BY majorName
    `;
    return { success: true, data: result };
  }

  async getMostPopularInstructors() {
    const result = await prisma.$queryRaw`
      SELECT i.firstName || ' ' || i.lastName AS instructorName,
             COUNT(r.registrationId) AS totalRegistrations
      FROM Instructor i
      JOIN Class c ON i.id = c.instructorId
      JOIN Registration r ON c.id = r.classId
      GROUP BY i.id
      ORDER BY totalRegistrations DESC
      LIMIT 3
    `;
    return { success: true, data: result };
  }

  async getTopStudentsByCGPA(limit = 5) {
    const result = await prisma.student.findMany({
      orderBy: { cgpa: 'desc' },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        cgpa: true,
        majorName: true
      },
    });
    return { success: true, data: result };
  }

  async getDynamicAverageGPA() {
    const students = await prisma.student.findMany({ select: { id: true } });

    let total = 0;
    for (const s of students) {
      const gpa = await this.getStudentGPA(s.id);
      total += gpa;
    }

    const average = students.length > 0 ? total / students.length : 0;
    return { success: true, data: average };
  }
}

export default new Statistics();

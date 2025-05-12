const { PrismaClient } = require('@prisma/client');

class Statistics {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getTotalStudents() {
    const students = await this.prisma.student.findMany();
    return { success: true, data: students };
  }

  async getTotalCourses() {
    const courses = await this.prisma.course.findMany();
    return { success: true, data: courses };
  }

  async getTotalInstructors() {
    const result = await this.prisma.class.groupBy({
      by: ['instructorId'],
      _count: {
        instructorId: true,
      },
    });
    return {
      success: true,
      data: result,
      count: result.length,
    };
  }

  async getRegisteredStudentsPerTerm() {
    const result = await this.prisma.$queryRaw`
      SELECT cl.term, COUNT(DISTINCT r.studentId) AS count
      FROM Class cl
      JOIN Registration r ON cl.id = r.classId
      GROUP BY cl.term
    `;
    return { success: true, data: result };
  }

  async getDynamicAverageGPA() {
    const result = await this.prisma.student.aggregate({
      _avg: { cgpa: true },
    });
    return { success: true, data: result._avg.cgpa || 0 };
  }

  async getStudentsPerMajor() {
    const result = await this.prisma.$queryRaw`
      SELECT s.majorName,
             COUNT(*) AS count,
             AVG(s.cgpa) AS averageCGPA,
             MAX(s.cgpa) AS highestCGPA,
             MIN(s.cgpa) AS lowestCGPA,
             SUM(CASE WHEN s.cgpa > 3.0 THEN 1 ELSE 0 END) AS studentsAboveThree,
             SUM(CASE WHEN s.cgpa < 2.0 THEN 1 ELSE 0 END) AS studentsBelowTwo
      FROM Student s
      GROUP BY s.majorName
    `;
    return { success: true, data: result };
  }

  async getTopRegisteredCourses() {
    const result = await this.prisma.$queryRaw`
      SELECT c.courseName, 
             COUNT(r.id) AS registrations,
             AVG(s.cgpa) AS averageCGPA,
             COUNT(CASE WHEN s.cgpa < 2.0 THEN 1 END) * 100.0 / NULLIF(COUNT(r.id), 0) AS failureRate
      FROM Course c
      LEFT JOIN Class cl ON c.id = cl.courseId
      LEFT JOIN Registration r ON cl.id = r.classId
      LEFT JOIN Student s ON r.studentId = s.id
      GROUP BY c.courseName
      ORDER BY registrations DESC
      LIMIT 3
    `;
    return { success: true, data: result };
  }

  async getLowCGPARatePerCourse() {
    const result = await this.prisma.$queryRaw`
      SELECT c.courseName,
             COUNT(CASE WHEN s.cgpa < 2.0 THEN 1 END) * 100.0 / NULLIF(COUNT(r.id), 0) AS failureRate,
             COUNT(r.id) AS registrations,
             AVG(s.cgpa) AS averageCGPA
      FROM Course c
      JOIN Class cl ON c.id = cl.courseId
      JOIN Registration r ON cl.id = r.classId
      JOIN Student s ON r.studentId = s.id
      GROUP BY c.courseName
      ORDER BY failureRate DESC
    `;
    return { success: true, data: result };
  }

  async getStudentsPerAdvisor() {
    const result = await this.prisma.$queryRaw`
      SELECT s.advisor,
             COUNT(*) AS count,
             AVG(s.cgpa) AS averageCGPA,
             SUM(CASE WHEN s.cgpa > 3.0 THEN 1 ELSE 0 END) AS studentsAboveThree,
             SUM(CASE WHEN s.cgpa < 2.0 THEN 1 ELSE 0 END) AS studentsBelowTwo
      FROM Student s
      GROUP BY s.advisor
    `;
    return { success: true, data: result };
  }

  async getAverageCoursesPerStudent() {
    const students = await this.prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        majorName: true,
        registrations: {
          select: {
            classId: true,
          },
        },
      },
    });

    const result = students.map((student) => ({
      student_id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      major: student.majorName,
      completedCoursesCount: student.registrations.length,
    }));

    return { success: true, data: result };
  }

  async getPercentageCGPAAboveThree() {
    const result = await this.prisma.$queryRaw`
      SELECT COUNT(CASE WHEN cgpa > 3.0 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS percentage
      FROM Student
    `;
    return { success: true, data: result[0].percentage || 0 };
  }

  async getCourseCompletionRate() {
    const students = await this.prisma.student.findMany({
      select: {
        id: true,
        completedCourses: true,
      },
    });

    const courseCompletions = {};
    students.forEach((student) => {
      const courseData = (student.completedCourses || '').trim();
      if (!courseData) return;

      const courses = courseData.split(',').map(item => {
        const [classId, grade] = item.trim().split(':').map(part => part.trim());
        return { class_id: parseInt(classId, 10), grade };
      });

      courses.forEach((course) => {
        const classId = course.class_id;
        const grade = course.grade;
        if (!courseCompletions[classId]) {
          courseCompletions[classId] = { completed: 0, total: 0 };
        }
        courseCompletions[classId].total += 1;
        if (['A', 'B', 'C', 'D'].includes(grade)) {
          courseCompletions[classId].completed += 1;
        }
      });
    });

    const classes = await this.prisma.class.findMany({
      select: {
        id: true,
        course: { select: { courseName: true } },
      },
    });

    const result = classes
      .filter((cls) => courseCompletions[cls.id])
      .map((cls) => ({
        courseName: cls.course.courseName,
        completionRate:
          (courseCompletions[cls.id].completed * 100.0) / courseCompletions[cls.id].total,
        completed: courseCompletions[cls.id].completed,
        enrolled: courseCompletions[cls.id].total,
      }));

    return { success: true, data: result };
  }

  async getInstructorEffectiveness() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        i.id AS instructorId,
        i.firstName || ' ' || i.lastName AS instructorName,
        COUNT(DISTINCT r.studentId) AS studentCount,
        AVG(s.cgpa) AS averageStudentCGPA,
        COUNT(r.id) AS totalEnrollments,
        COUNT(CASE WHEN s.cgpa >= 3.0 THEN 1 END) * 100.0 / NULLIF(COUNT(r.id), 0) AS highCGPARate
      FROM Instructor i
      JOIN Class cl ON cl.instructorId = i.id
      JOIN Registration r ON r.classId = cl.id
      JOIN Student s ON r.studentId = s.id
      GROUP BY i.id, i.firstName, i.lastName
      ORDER BY averageStudentCGPA DESC;
    `;
    return { success: true, data: result };
  }

  async getPrerequisiteEffectiveness() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        c.courseName,
        c.id AS courseId,
        AVG(s.cgpa) AS avgCGPAWithPrereq,
        COUNT(DISTINCT CASE WHEN s.completedCourses LIKE '%' || p.id || '%' THEN s.id END) AS studentsWithPrereq,
        COUNT(DISTINCT s.id) AS totalStudents
      FROM Course c
      JOIN Class cl ON cl.courseId = c.id
      JOIN Registration r ON r.classId = cl.id
      JOIN Student s ON r.studentId = s.id
      LEFT JOIN Course p ON c.prerequisites LIKE '%' || p.id || '%'
      WHERE c.prerequisites IS NOT NULL AND c.prerequisites != ''
      GROUP BY c.id, c.courseName
      HAVING studentsWithPrereq > 0;
    `;
    return { success: true, data: result };
  }

  async getStudentProgress() {
    const students = await this.prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        majorName: true,
        completedCourses: true,
        major: {
          select: { totalCreditHours: true },
        },
      },
    });

    const result = students.map((student) => {
      const courseData = (student.completedCourses || '').trim();
      let completedCreditHours = 0;
      if (courseData) {
        const courses = courseData.split(',').map(item => {
          const [classId, grade] = item.trim().split(':').map(part => part.trim());
          return { class_id: parseInt(classId, 10), grade };
        });
        completedCreditHours = courses.length * 3;
      }

      const progressPercentage =
        (completedCreditHours / student.major.totalCreditHours) * 100;

      return {
        studentId: student.id,
        fullName: `${student.firstName} ${student.lastName}`,
        major: student.majorName,
        completedCreditHours,
        totalCreditHours: student.major.totalCreditHours,
        progressPercentage: Math.min(progressPercentage, 100),
      };
    });

    return { success: true, data: result };
  }

  async getCGPATrendsByTerm() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        cl.term,
        AVG(s.cgpa) AS averageCGPA,
        COUNT(DISTINCT s.id) AS studentCount,
        MIN(s.cgpa) AS minCGPA,
        MAX(s.cgpa) AS maxCGPA
      FROM Class cl
      JOIN Registration r ON r.classId = cl.id
      JOIN Student s ON r.studentId = s.id
      GROUP BY cl.term
      ORDER BY cl.term;
    `;
    return { success: true, data: result };
  }

  async getAdvisorWorkload() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        advisor,
        COUNT(*) AS studentCount,
        AVG(cgpa) AS averageStudentCGPA,
        SUM(CASE WHEN cgpa < 2.0 THEN 1 ELSE 0 END) AS strugglingStudents
      FROM Student
      WHERE advisor IS NOT NULL
      GROUP BY advisor
      ORDER BY studentCount DESC;
    `;
    return { success: true, data: result };
  }

  async getCoursesByMajor() {
    const result = await this.prisma.course.groupBy({
      by: ['major'],
      _count: {
        id: true,
      },
      orderBy: {
        major: 'asc',
      },
    });

    const courses = await this.prisma.course.findMany({
      select: {
        courseName: true,
        major: true,
      },
      orderBy: {
        major: 'asc',
      },
    });

    const groupedCourses = result.map((majorGroup) => ({
      major: majorGroup.major,
      courseCount: majorGroup._count.id,
      courses: courses
        .filter((course) => course.major === majorGroup.major)
        .map((course) => course.courseName),
    }));

    return { success: true, data: groupedCourses };
  }
}

export default new Statistics();
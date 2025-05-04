const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');

const prisma = new PrismaClient();

const majorsPath = path.join('assets/data/majors.json');
const coursesPath = path.join('assets/data/courses.json');
const classesPath = path.join('assets/data/classes.json');
const users_path = path.join('assets/data/users.json');

async function seed() {
    try {
        const majors = await fs.readJson(majorsPath);
        const courses = await fs.readJson(coursesPath);
        const classes = await fs.readJson(classesPath);
        const users = await fs.readJson(users_path);

        for (const major of majors) {
            await prisma.major.create({
                data: {
                    name: major.major,
                    totalCreditHours: major.totalCreditHours,
                    totalNumberOfCourses: major.totalNumberofCourses,
                    courses: major.courses.join(','),
                },
            });
        }

        for (const c of courses) {
            const majors = Array.isArray(c.major) ? c.major.join(',') : c.major; //check if its an array
            await prisma.course.create({
                data: {
                    courseName: c.course_name,
                    courseNumber: c.course_number,
                    major: majors,
                    prerequisites: c.prerequisites.join(","),
                    status: c.status,
                },
            });
        }

        for (const c of classes) {
            await prisma.class.create({
                data: {
                    courseId: c.course_id,
                    term: c.term,
                    section: c.section,
                    instructorId: c.instructor_id,
                    capacity: c.capacity,
                    status: c.status,
                    registeredStudents: c.registered_students.join(",") //storing array as csv value
                }
            });
        }


        for (const user of users) {
            switch (user.role) {
                case 'Student':
                    await prisma.student.create({
                        data: {
                            id: user.student_id,
                            username: user.username,
                            password: user.password,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            majorName: user.major,
                            advisor: user.advisor,
                            cgpa: parseFloat(user.cgpa),
                            completedCourses: user.completed_courses
                                .map((course) => `${course.class_id}:${course.grade}`)
                                .join(","),
                        }
                    });
                    break;
                case 'Instructor':
                    await prisma.instructor.create({
                        data: {
                            id: user.instructor_id,
                            username: user.username,
                            password: user.password,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            expertise: user.expertise,
                        }
                    });
                    break;
                case 'Admin':
                    await prisma.admin.create({
                        data: {
                            id: user.admin_id,
                            username: user.username,
                            password: user.password,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        }
                    });
                    break;
            }
        }

        console.log('Seeded done.');
    } catch (error) {
        console.error('Error  seeding :' + error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();

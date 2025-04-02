document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        window.location.href = '../index.html';
        return;
    }

    async function fetchJSON(fileName, paths) {
        for (const path of paths) {
            try {
                const response = await fetch(path);
                const data = await response.json();
                return data;
            } catch (e) {
                console.warn(`Attempt failed for ${path}: ${e.message}`);
            }
        }
        throw new Error(`All paths failed for ${fileName}`);
    }

    let instructorData = null;
    let assignedClasses = [];
    let courses = [];
    let registrations = [];
    let users = [];
    let currentClassId = null;

    try {
        users = await fetchJSON('users.json', ['../../assets/data/users.json']);
        instructorData = users.find(user => user.role === 'Instructor' && user.username === loggedInUsername);

        if (!instructorData) {
            alert('Instructor data not found.');
            window.location.href = '../index.html';
            return;
        }

        const classes = await fetchJSON('classes.json', ['../../assets/data/classes.json']);
        assignedClasses = classes.filter(c => c.instructor_id === instructorData.instructor_id);

        courses = await fetchJSON('courses.json', ['../../assets/data/courses.json']);
        registrations = await fetchJSON('registrations.json', ['../../assets/data/registrations.json']);

        const classMap = {};
        assignedClasses.forEach(cls => {
            const course = courses.find(course => course.course_id === cls.course_id);
            const courseName = course ? course.course_name : 'Unknown Course';
            if (!classMap[courseName]) {
                classMap[courseName] = [];
            }
            classMap[courseName].push(cls.section);
        });

        const container = document.getElementById('Classes_Cards');
        const studentSection = document.querySelector('.Students_List');

        container.innerHTML = '';
        studentSection.style.display = 'none';

        for (const courseName in classMap) {
            const card = document.createElement('section');
            card.id = 'CCard';

            const title = document.createElement('h3');
            title.textContent = courseName;
            card.appendChild(title);

            const sectionDiv = document.createElement('div');
            sectionDiv.id = 'Sections';

            classMap[courseName].forEach(sectionName => {
                const sectionLink = document.createElement('a');
                sectionLink.id = 'Section';
                sectionLink.href = '#';
                sectionLink.textContent = sectionName;

                const matchedClass = assignedClasses.find(cls => {
                    const course = courses.find(course => course.course_id === cls.course_id);
                    return course && course.course_name === courseName && cls.section === sectionName;
                });

                if (matchedClass) {
                    sectionLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        container.style.display = 'none';
                        studentSection.style.display = 'block';
                        currentClassId = matchedClass.class_id;
                        renderStudentsForClass(currentClassId);
                    });
                }

                sectionDiv.appendChild(sectionLink);
            });

            card.appendChild(sectionDiv);
            container.appendChild(card);
        }

        window.assignedClasses = assignedClasses;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data.');
        window.location.href = '../index.html';
    }

    function renderStudentsForClass(classId) {
        const tableBody = document.querySelector('.Students_List tbody');
        tableBody.innerHTML = '';

        const registeredStudents = registrations.filter(reg => reg.class_id === classId);
        const studentList = users.filter(user => registeredStudents.some(reg => reg.student_id === user.student_id));

        studentList.forEach(student => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = `${student.firstName} ${student.lastName}`;
            row.appendChild(nameCell);

            const idCell = document.createElement('td');
            idCell.textContent = student.student_id;
            row.appendChild(idCell);

            const gradeCell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.min = 0;
            input.max = 100;
            input.style.width = '60px';
            input.dataset.studentId = student.student_id;
            gradeCell.appendChild(input);
            row.appendChild(gradeCell);

            tableBody.appendChild(row);
        });
    }

    document.getElementById('saveGradesBtn').addEventListener('click', () => {
        const inputs = document.querySelectorAll('.Students_List input[type="number"]');
        const currentClass = assignedClasses.find(cls => cls.class_id === currentClassId);
        const courseId = currentClass ? currentClass.course_id : null;

        inputs.forEach(input => {
            const studentId = parseInt(input.dataset.studentId);
            const grade = parseInt(input.value);
            const student = users.find(u => u.student_id === studentId);

            if (student && !isNaN(grade)) {
                const alreadyCompleted = student.completed_courses.some(cc => cc.class_id === currentClassId);

                if (!alreadyCompleted) {
                    student.completed_courses.push({
                        course_id: courseId,
                        class_id: currentClassId,
                        grade: grade
                    });
                }

                const registrationIndex = registrations.findIndex(r => r.student_id === studentId && r.class_id === currentClassId);
                if (registrationIndex !== -1) {
                    registrations.splice(registrationIndex, 1);
                }
            }
        });

        alert('Grades saved successfully!');
    });
});

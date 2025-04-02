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

    const container = document.getElementById('Classes_Cards');
    const studentSection = document.querySelector('.Students_List');

    document.querySelector('.nav-links li:nth-child(1) a').addEventListener('click', (e) => {
        e.preventDefault();
        container.style.display = 'block';
        studentSection.style.display = 'none';
    });

    document.querySelector('.logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInUsername');
        window.location.href = '../index.html';
    });

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

        const savedGrades = JSON.parse(localStorage.getItem(`grades_${classId}`)) || [];

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

            const existingGrade = savedGrades.find(g => g.student_id === student.student_id);
            if (existingGrade) {
                input.value = existingGrade.grade;
            }

            gradeCell.appendChild(input);
            row.appendChild(gradeCell);

            tableBody.appendChild(row);
        });
    }

    document.getElementById('saveGradesBtn').addEventListener('click', () => {
        const inputs = document.querySelectorAll('.Students_List input[type="number"]');
        const currentClass = assignedClasses.find(cls => cls.class_id === currentClassId);
        const courseId = currentClass ? currentClass.course_id : null;

        const savedGrades = [];

        inputs.forEach(input => {
            const studentId = parseInt(input.dataset.studentId);
            const grade = parseInt(input.value);

            if (!isNaN(studentId) && !isNaN(grade)) {
                savedGrades.push({
                    student_id: studentId,
                    class_id: currentClassId,
                    course_id: courseId,
                    grade: grade
                });
            }
        });

        localStorage.setItem(`grades_${currentClassId}`, JSON.stringify(savedGrades));
        alert('Grades saved to localStorage!');
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        window.location.href = '../index.html';
        return;
    }

    users = JSON.parse(localStorage.users);
    courses = JSON.parse(localStorage.courses);
    classes = JSON.parse(localStorage.classes);
    registrations = JSON.parse(localStorage.registrations);

    let instructorData = null;
    let assignedClasses = [];
    let currentClassId = null;

    const header = document.querySelector('header');
    const dashboardHeader = document.querySelector('.dashboard-header');
    const container = document.querySelector('.Classes_Cards');
    const studentSection = document.querySelector('.Students_List');
    const footer = document.querySelector('footer');

    const filterSelect = document.createElement('select');
    filterSelect.className = 'class-status-filter';
    filterSelect.innerHTML = `
        <option value="all">All</option>
        <option value="completed">Completed</option>
        <option value="in-progress">In Progress</option>
    `;

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-bar';
    filterContainer.appendChild(filterSelect);
    container.parentElement.insertBefore(filterContainer, container);

    document.querySelector('.nav-links li:nth-child(1) a').addEventListener('click', (e) => {
        e.preventDefault();
        header.style.display = 'block';
        dashboardHeader.style.display = 'block';
        filterContainer.style.display = 'flex';
        container.style.display = 'grid';
        studentSection.style.display = 'none';
        footer.style.display = 'block';
        currentClassId = null;
        renderClasses();
    });

    filterSelect.addEventListener('change', () => {
        renderClasses();
        studentSection.style.display = 'none';
        currentClassId = null;
    });

    document.querySelector('.logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showConfirmationModal();
    });

    try {
        instructorData = users.find(user => user.role === 'Instructor' && user.username === loggedInUsername);

        if (!instructorData) {
            showMessage('Error', 'Instructor data not found.');
            window.location.href = '../index.html';
            return;
        }


        assignedClasses = classes.filter(c => parseInt(c.instructor_id) === parseInt(instructorData.instructor_id));


        const validatedOrCompletedClasses = assignedClasses.filter(
            cls => cls.status === 'validated' || cls.status === 'completed'
        );


        let totalStudents = 0;
        validatedOrCompletedClasses.forEach(cls => {
            const classId = parseInt(cls.class_id);
            if (cls.status === 'completed') {
                const classRegistrations = registrations.filter(reg => parseInt(reg.class_id) === classId);
                const studentList = users.filter(user =>
                    user.role === 'Student' &&
                    classRegistrations.some(reg => parseInt(reg.student_id) === parseInt(user.student_id))
                );
                totalStudents += studentList.length;
            } else if (cls.status === 'validated') {
                const classRegistrations = registrations.filter(reg => parseInt(reg.class_id) === classId);
                totalStudents += classRegistrations.length;
            }
        });


        document.querySelector('.total-classes').textContent = validatedOrCompletedClasses.length;
        document.querySelector('.total-students').textContent = totalStudents;
        document.querySelector('.instructor-name').textContent = instructorData.firstName;

        studentSection.style.display = 'none';
        container.style.display = 'grid';
        filterContainer.style.display = 'flex';
        renderClasses();
    } catch (error) {
        showMessage('Error', 'Failed to load data from localStorage.');
        window.location.href = '../index.html';
    }

    // Function to render classes assigned to the instructor.
    function renderClasses() {
        try {
            classes = JSON.parse(localStorage.classes);
            assignedClasses = classes.filter(c => parseInt(c.instructor_id) === parseInt(instructorData.instructor_id));
            const displayClasses = assignedClasses.filter(cls => cls.status === 'validated' || cls.status === 'completed');
        } catch (error) {
            showMessage('Error', 'Failed to reload class data.');
            return;
        }

        const filterValue = filterSelect.value;
        let filteredClasses = assignedClasses;

        if (filterValue === 'all') {
            filteredClasses = assignedClasses.filter(cls => cls.status === 'validated' || cls.status === 'completed');
        } else if (filterValue === 'completed') {
            filteredClasses = assignedClasses.filter(cls => cls.status === 'completed');
        } else if (filterValue === 'in-progress') {
            filteredClasses = assignedClasses.filter(cls => cls.status === 'validated');
        }


        const classMap = {};
        filteredClasses.forEach(cls => {
            const course = courses.find(course => parseInt(course.course_id) === parseInt(cls.course_id));
            const courseName = course ? course.course_name : 'Unknown Course';
            if (!classMap[courseName]) {
                classMap[courseName] = [];
            }
            classMap[courseName].push(cls);
        });

        container.innerHTML = '';
        if (Object.keys(classMap).length === 0) {
            container.innerHTML = '<p>No classes available to display.</p>';
        }
        for (const courseName in classMap) {
            const card = document.createElement('section');
            card.className = 'class-card';

            const title = document.createElement('h3');
            title.textContent = courseName;
            card.appendChild(title);

            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'sections';

            classMap[courseName].forEach(cls => {
                const sectionLink = document.createElement('a');
                sectionLink.className = 'section-link';
                sectionLink.href = '#';
                sectionLink.textContent = cls.section;

                sectionLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const currentFilter = filterSelect.value;
                    if (currentFilter === 'in-progress' && cls.status === 'completed') {
                        showMessage('Not Available', 'This class is completed and cannot be viewed under the "In Progress" filter.');
                        studentSection.style.display = 'none';
                        currentClassId = null;
                        return;
                    }
                    if (currentFilter === 'completed' && cls.status === 'validated') {
                        showMessage('Not Available', 'This class is in progress and cannot be viewed under the "Completed" filter.');
                        studentSection.style.display = 'none';
                        currentClassId = null;
                        return;
                    }
                    studentSection.style.display = 'block';
                    currentClassId = cls.class_id;
                    renderStudentsForClass(currentClassId);
                    studentSection.scrollIntoView({ behavior: 'smooth' });
                });

                sectionDiv.appendChild(sectionLink);
            });

            card.appendChild(sectionDiv);
            container.appendChild(card);
        }
    }

    // Function to render students for a specific class.
    // This function is called when a class is clicked in the class card.
    // It retrieves the students registered for that class and displays them in a table.
    function renderStudentsForClass(classId) {
        const tableBody = document.querySelector('.Students_List tbody');
        const table = document.querySelector('.Students_List table');
        tableBody.innerHTML = '';

        const currentClass = assignedClasses.find(cls => cls.class_id === classId);
        const course = courses.find(c => parseInt(c.course_id) === parseInt(currentClass.course_id));

        const gradesSubmitted = currentClass.status === 'completed';

        const classRegistrations = registrations.filter(
            reg => parseInt(reg.class_id) === parseInt(classId)
        );
        let studentList = users.filter(user =>
            user.role === 'Student' &&
            classRegistrations.some(reg => parseInt(reg.student_id) === parseInt(user.student_id))
        );

        let header = document.querySelector('.class-info-header');
        if (!header) {
            header = document.createElement('h2');
            header.className = 'class-info-header';
            header.style.textAlign = 'center';
            header.style.marginBottom = '20px';
            table.parentElement.insertBefore(header, table);
        }
        header.textContent = `${course.course_name} - ${currentClass.section}`;

        const saveGradesBtn = document.querySelector('.saveGradesBtn');
        if (gradesSubmitted) {
            saveGradesBtn.style.display = 'none';
        } else {
            saveGradesBtn.style.display = 'block';
        }

        if (studentList.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3;
            cell.textContent = 'No students registered in this class.';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        studentList.forEach(student => {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = `${student.firstName} ${student.lastName}`;
            row.appendChild(nameCell);

            const idCell = document.createElement('td');
            idCell.textContent = student.student_id;
            row.appendChild(idCell);

            const gradeCell = document.createElement('td');
            if (gradesSubmitted) {
                const completedCourse = student.completed_courses?.find(
                    cc => parseInt(cc.class_id) === parseInt(classId)
                );
                gradeCell.textContent = completedCourse ? completedCourse.grade : 'Not Graded';
            } else {
                const select = document.createElement('select');
                select.dataset.studentId = student.student_id;
                const grades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
                select.innerHTML = `<option value="">Select Grade</option>` +
                    grades.map(grade => `<option value="${grade}">${grade}</option>`).join('');

                const existingGrade = student.completed_courses?.find(
                    cc => parseInt(cc.class_id) === parseInt(classId)
                );
                if (existingGrade) {
                    select.value = existingGrade.grade;
                }

                gradeCell.appendChild(select);
            }
            row.appendChild(gradeCell);

            tableBody.appendChild(row);
        });
    }

    document.querySelector('.saveGradesBtn').addEventListener('click', () => {
        const currentClass = assignedClasses.find(cls => cls.class_id === currentClassId);
        const gradesSubmitted = currentClass.status === 'completed';
        if (gradesSubmitted) {
            showMessage('Submission Error', 'Grades have already been submitted and cannot be modified.');
            return;
        }

        const selects = document.querySelectorAll('.Students_List select');
        const courseId = currentClass ? currentClass.course_id : null;

        const savedGrades = [];
        let valid = true;

        selects.forEach(select => {
            const studentId = parseInt(select.dataset.studentId);
            const grade = select.value;

            if (grade === '') {
                valid = false;
                select.style.border = '2px solid red';
            } else {
                select.style.border = '';
                savedGrades.push({
                    student_id: studentId,
                    class_id: currentClassId,
                    course_id: courseId,
                    grade: grade
                });
            }
        });

        if (!valid) {
            showMessage('Validation Error', 'Please select a grade for all students.');
            return;
        }

        showGradeSubmissionModal();
    });

    function showMessage(title, message) {
        const existingModal = document.querySelector('.confirmation-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <p>${message}</p>
                <button class="modal-ok">OK</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.querySelector('.modal-ok').addEventListener('click', () => {
            modal.remove();
        });
    }

    // Function to show the logout confirmation modal.
    function showConfirmationModal() {
        const existingModal = document.querySelector('.confirmation-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Confirm Logout</h2>
                <p>Are you sure you want to logout?</p>
                <button class="confirm-submit">Yes</button>
                <button class="cancel-submit">Cancel</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.querySelector('.confirm-submit').addEventListener('click', () => {
            modal.remove();
            localStorage.removeItem('loggedInUsername');
            window.location.href = '../index.html';
        });

        document.querySelector('.cancel-submit').addEventListener('click', () => {
            modal.remove();
        });
    }
    // Function to show the grade submission confirmation modal.
    function showGradeSubmissionModal() {
        const existingModal = document.querySelector('.confirmation-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Confirm Grade Submission</h2>
                <p>Are you sure you want to submit these grades? This action cannot be undone.</p>
                <button class="confirm-submit">Yes</button>
                <button class="cancel-submit">Cancel</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.querySelector('.confirm-submit').addEventListener('click', async () => {
            const selects = document.querySelectorAll('.Students_List select');
            const currentClass = assignedClasses.find(cls => cls.class_id === currentClassId);
            const courseId = currentClass ? currentClass.course_id : null;

            const savedGrades = [];
            selects.forEach(select => {
                const studentId = parseInt(select.dataset.studentId);
                const grade = select.value;
                savedGrades.push({
                    student_id: studentId,
                    class_id: currentClassId,
                    course_id: courseId,
                    grade: grade
                });
            });
            
            let updatedUsers = Array.from(users);
            let updatedRegistrations = Array.from(registrations);

            savedGrades.forEach(grade => {
                const student = updatedUsers.find(u => u.student_id === grade.student_id);
                if (student) {
                    if (!student.completed_courses) {
                        student.completed_courses = [];
                    }
                    student.completed_courses = student.completed_courses.filter(
                        cc => {
                            const classItem = classes.find(cls => cls.class_id === cc.class_id);
                            const isSameCourse = classItem && classItem.course_id === grade.course_id;
                            return !(isSameCourse && cc.grade === 'F');
                        }
                    );
                    student.completed_courses.push({
                        class_id: grade.class_id,
                        grade: grade.grade
                    });

                    updatedRegistrations = updatedRegistrations.map(reg => {
                        if (reg.student_id === grade.student_id && reg.class_id === currentClassId) {
                            return { ...reg, status: 'completed' };
                        }
                        return reg;
                    });
                }
            });

            const updatedClasses = Array.from(classes);
            const classIndex = updatedClasses.findIndex(cls => cls.class_id === currentClassId);
            if (classIndex !== -1) {
                updatedClasses[classIndex].status = 'completed';
            }

            try {
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                localStorage.setItem('classes', JSON.stringify(updatedClasses));
                localStorage.setItem('registrations', JSON.stringify(updatedRegistrations));

                users = updatedUsers;
                classes = updatedClasses;
                registrations = updatedRegistrations;
                assignedClasses = classes.filter(c => parseInt(c.instructor_id) === parseInt(instructorData.instructor_id));

                showMessage('Success', 'Grades submitted successfully!');
                renderStudentsForClass(currentClassId);
            } catch (error) {
                showMessage('Error', 'Failed to submit grades. Please try again.');
            }

            modal.remove();
        });

        document.querySelector('.cancel-submit').addEventListener('click', () => {
            modal.remove();
        });
    }
});
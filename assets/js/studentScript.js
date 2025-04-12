document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        window.location.href = '../index.html';
        return;
    }
    
    // to get data from local storage
    let users, courses, classes, registrations, majors;
    users = JSON.parse(localStorage.users);
    courses = JSON.parse(localStorage.courses);
    classes = JSON.parse(localStorage.classes);
    registrations = JSON.parse(localStorage.registrations);
    majors = JSON.parse(localStorage.majors);
   
    

    let studentData = users.find(user => user.role === 'Student' && user.username === loggedInUsername);
    if (!studentData) {
        showMessage('Error', 'Student data not found. Redirecting to login.');
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('student-name').textContent = studentData.firstName;
    document.getElementById('major').textContent = studentData.major;
    document.getElementById('cgpa').textContent = studentData.cgpa;
    document.getElementById('advisor').textContent = studentData.advisor;

    const completedCourses = studentData.completed_courses
        ? studentData.completed_courses
            .filter(cc => cc.grade !== 'F')
            .map(cc => {
                const classItem = classes.find(cls => cls.class_id === cc.class_id);
                return classItem ? classItem.course_id : null;
            })
            .filter(id => id !== null)
        : [];

    const failedClasses = studentData.completed_courses
        ? studentData.completed_courses
            .filter(cc => cc.grade === 'F')
            .map(cc => cc.class_id)
        : [];
    
    let studentRegistrations = registrations.filter(reg => reg.student_id === studentData.student_id);
    const registeredCourses = studentRegistrations
        .map(reg => {
            const classItem = classes.find(cls => cls.class_id === reg.class_id);
            if (classItem && classItem.status !== 'completed') {
                return classItem.course_id;
            }
            return null;
        })
        .filter(id => id !== null);

    const taken = completedCourses.length;
    const registered = registeredCourses.length;
    const majorData = majors.find(m => m.major === studentData.major);
    const totalCourses = majorData ? parseInt(majorData.totalNumberofCourses) || 0 : 0;
    const remaining = totalCourses - taken - registered;

    document.getElementById('taken').textContent = taken;
    document.getElementById('registered').textContent = registered;
    document.getElementById('remaining').textContent = remaining >= 0 ? remaining : 0;

    if (totalCourses > 0) {
        const takenPercent = (taken / totalCourses) * 100;
        const registeredPercent = (registered / totalCourses) * 100;
        const remainingPercent = (remaining / totalCourses) * 100;

        document.querySelector('.progress-bar-taken').style.width = `${takenPercent}%`;
        document.querySelector('.progress-bar-registered').style.width = `${registeredPercent}%`;
        document.querySelector('.progress-bar-remaining').style.width = `${remainingPercent}%`;
    }

    const availableCourses = courses.filter(course => {
        if (course.status !== 'open-for-registration') return false;

        const isNotTaken = !completedCourses.includes(course.course_id);
        if (!isNotTaken) return false;

        const courseClasses = classes.filter(cls => cls.course_id === course.course_id);
        const hasOpenClass = courseClasses.some(cls => {
            if (failedClasses.includes(cls.class_id)) return false;

            const registeredStudents = registrations.filter(reg => reg.class_id === cls.class_id).length;
            const availableSeats = cls.capacity - registeredStudents;
            return cls.status === 'open-for-registration' && availableSeats > 0;
        });

        return hasOpenClass; 
    });

    renderCourses(availableCourses, studentRegistrations);

    const majorFilter = document.getElementById('Major');
    const termFilter = document.getElementById('Terms');
    const searchInput = document.getElementById('courseSearch');

    majorFilter.addEventListener('change', filterCourses);
    termFilter.addEventListener('change', filterCourses);
    searchInput.addEventListener('input', filterCourses);

    // function to filter courses
    function filterCourses() {
        const selectedMajor = majorFilter.value;
        const selectedTerm = termFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        const filteredCourses = availableCourses.filter(course => {
            const courseClasses = classes.filter(cls => cls.course_id === course.course_id);
            const matchesMajor = !selectedMajor || (Array.isArray(course.major) ? course.major.includes(selectedMajor) : course.major === selectedMajor);
            const matchesTerm = !selectedTerm || courseClasses.some(cls => cls.term === selectedTerm);
            const matchesSearch = !searchTerm || course.course_name.toLowerCase().includes(searchTerm);
            return matchesMajor && matchesTerm && matchesSearch;
        });

        renderCourses(filteredCourses, studentRegistrations);
    }

    // function to display available courses
    function renderCourses(coursesToRender, studentRegistrations) {
        const courseBoxesContainer = document.querySelector('.course-boxes');
        courseBoxesContainer.innerHTML = '';
    
        if (coursesToRender.length === 0) {
            courseBoxesContainer.innerHTML = '<p>No courses available for registration at this time.</p>';
            return;
        }
    
        coursesToRender.forEach(course => {
            const courseClasses = classes.filter(cls => cls.course_id === course.course_id);
            if (courseClasses.length === 0) return;
    
            const hasFailedClass = failedClasses.some(classId => {
                const failedClass = classes.find(cls => cls.class_id === classId);
                return failedClass && failedClass.course_id === course.course_id;
            });
    
            const studentReg = studentRegistrations.find(reg => 
                reg.student_id === studentData.student_id && 
                courseClasses.some(cls => cls.class_id === reg.class_id)
            );
            const isRegistered = !!studentReg && !hasFailedClass; 
            const showRegisterButton = hasFailedClass || !isRegistered;
            const registeredClass = isRegistered ? classes.find(cls => cls.class_id === studentReg.class_id) : null;
            const availableSections = courseClasses
                .filter(cls => cls.status === 'open-for-registration' && !failedClasses.includes(cls.class_id))
                .map(cls => cls.section)
                .join(', ');
    
            if (!availableSections) return;
    
            const courseBox = document.createElement('div');
            courseBox.classList.add('course-box');
            courseBox.innerHTML = `
                <div class="course-header">
                    <h3 title="${course.course_name}">${course.course_name || 'Unnamed Course'}</h3>
                </div>
                <div class="course-details">
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">tag</span>Course Number:</span>
                        <span class="value">${course.course_number}</span>
                    </div>
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">school</span>Major:</span>
                        <span class="value">${Array.isArray(course.major) ? course.major.join(', ') : course.major}</span>
                    </div>
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">class</span>${isRegistered ? 'Registered Section' : 'Sections Available'}:</span>
                        <span class="value">${
                            isRegistered 
                                ? (registeredClass ? registeredClass.section : 'N/A') 
                                : availableSections
                        }</span>
                    </div>
                    <div class="course-actions">
                        ${showRegisterButton ? `
                            <button class="register-btn" data-course-id="${course.course_id}" style="width: 100px;">Register</button>
                        ` : `
                            <button class="change-section-btn" data-course-id="${course.course_id}" style="width: 100px;">Change Section</button>
                            <button class="withdraw-btn" data-course-id="${course.course_id}" style="width: 100px;">Withdraw</button>
                        `}
                    </div>
                </div>
            `;
            courseBoxesContainer.appendChild(courseBox);
        });
    
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = parseInt(e.target.getAttribute('data-course-id'));
                handleRegistration(courseId);
            });
        });
    
        document.querySelectorAll('.change-section-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = parseInt(e.target.getAttribute('data-course-id'));
                handleChangeSection(courseId);
            });
        });
    
        document.querySelectorAll('.withdraw-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = parseInt(e.target.getAttribute('data-course-id'));
                handleWithdrawal(courseId);
            });
        });
    }

    // function to handle registration
    function handleRegistration(courseId) {
        const course = courses.find(c => c.course_id === courseId);
        const courseClasses = classes.filter(cls => cls.course_id === courseId && !failedClasses.includes(cls.class_id));

        const completedCourseIds = studentData.completed_courses
            .filter(cc => cc.grade !== 'F')
            .map(cc => {
                const classItem = classes.find(cls => cls.class_id === cc.class_id);
                return classItem ? classItem.course_id : null;
            })
            .filter(id => id !== null);

        const prerequisitesMet = course.prerequisites.every(prereqCourseId => {
            const hasCompletedCourse = completedCourseIds.includes(prereqCourseId);
            const hasPassingGrade = studentData.completed_courses.some(cc => {
                const classItem = classes.find(cls => cls.class_id === cc.class_id);
                return classItem && classItem.course_id === prereqCourseId && cc.grade !== 'F';
            });
            return hasCompletedCourse && hasPassingGrade;
        });

        if (!prerequisitesMet) {
            const missingPrereqs = course.prerequisites
                .filter(prereq => {
                    const hasCompleted = completedCourseIds.includes(prereq);
                    const hasPassingGrade = studentData.completed_courses.some(cc => {
                        const classItem = classes.find(cls => cls.class_id === cc.class_id);
                        return classItem && classItem.course_id === prereq && cc.grade !== 'F';
                    });
                    return !(hasCompleted && hasPassingGrade);
                })
                .map(prereq => {
                    const prereqCourse = courses.find(c => c.course_id === prereq);
                    return prereqCourse ? prereqCourse.course_name : 'Unknown Course';
                });
            showMessage('Prerequisites Not Met', `You cannot register for "${course.course_name}" because you haven't completed: ${missingPrereqs.join(', ')}.`);
            return;
        }

        showClassSelectionPopup(course, courseClasses);
    }

    // function to handle change section
    function handleChangeSection(courseId) {
        const course = courses.find(c => c.course_id === courseId);
        const courseClasses = JSON.parse(localStorage.classes).filter(cls => cls.course_id === courseId && !failedClasses.includes(cls.class_id));
        showClassSelectionPopup(course, courseClasses);
    }

    // function to show class selection popup
    function showClassSelectionPopup(course, courseClasses) {
        const modal = document.createElement('div');
        modal.className = 'class-selection-modal';
        let optionsHtml = '';

        registrations = JSON.parse(localStorage.registrations);
        classes = JSON.parse(localStorage.classes);
        const currentRegistrations = registrations.filter(reg => reg.student_id === studentData.student_id);
        const currentRegistration = currentRegistrations.find(reg =>
            courseClasses.some(cls => cls.class_id === reg.class_id)
        );

        courseClasses.forEach(cls => {
            const instructor = users.find(user => user.instructor_id === cls.instructor_id);
            const instructorName = instructor ? instructor.firstName : 'N/A';
            const registeredStudents = registrations.filter(reg => reg.class_id === cls.class_id).length;
            const availableSeats = cls.capacity - registeredStudents;
            const isRegistered = currentRegistration && currentRegistration.class_id === cls.class_id;

            optionsHtml += `
                <div class="class-option">
                    <span>${course.course_name} (${cls.section}) - ${instructorName} (${cls.term}) - Seats: ${availableSeats}</span>
                    <button data-class-id="${cls.class_id}" ${isRegistered ? 'disabled' : ''}>
                        ${isRegistered ? 'Selected' : 'Select'}
                    </button>
                </div>
            `;
        });

        if (!optionsHtml) {
            showMessage('No Classes Available', `No classes for "${course.course_name}" are open for registration or have available seats.`);
            return;
        }

        modal.innerHTML = `
            <h2>Select a Class</h2>
            <p>Please choose a class for "${course.course_name}":</p>
            ${optionsHtml}
            <button class="close-btn">Cancel</button>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('.class-option button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const classId = parseInt(e.target.getAttribute('data-class-id'));
                const selectedClass = classes.find(cls => cls.class_id === classId);
                const registeredStudents = registrations.filter(reg => reg.class_id === classId).length;
                const availableSeats = selectedClass.capacity - registeredStudents;

                if (selectedClass.status === 'validated') {
                    showMessage('Class Started', 'This class has already started.');
                    return;
                } else if (selectedClass.status === 'closed') {
                    showMessage('Class Closed', 'This class is closed for registration.');
                    return;
                } else if (availableSeats <= 0) {
                    showMessage('No Seats', 'No available seats for this class.');
                    return;
                } else if (selectedClass.status !== 'open-for-registration') {
                    showMessage('Invalid Status', 'You can only register in classes that are open for registration.');
                    return;
                }

                modal.remove();
                confirmRegistration(classId, currentRegistration).then(() => {
                    registrations = JSON.parse(localStorage.registrations);
                    classes = JSON.parse(localStorage.classes);
                    studentRegistrations = registrations.filter(reg => reg.student_id === studentData.student_id);
                    renderCourses(availableCourses, studentRegistrations);
                });
            });
        });

        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
    }

    // function to confirm registration
    async function confirmRegistration(classId, existingRegistration) {
        let allRegistrations = JSON.parse(localStorage.registrations);
        let allClasses = JSON.parse(localStorage.classes);
        const classItem = allClasses.find(c => c.class_id === classId);
        const course = courses.find(c => c.course_id === classItem.course_id);

        if (!existingRegistration && allRegistrations.some(reg => reg.student_id === studentData.student_id && reg.class_id === classId)) {
            showMessage('Error', `You are already registered for "${course.course_name}" in this class.`);
            return Promise.resolve();
        }

        if (existingRegistration) {
            allRegistrations = allRegistrations.filter(reg => reg.registration_id !== existingRegistration.registration_id);
        }

        const newRegistration = { 
            registration_id: allRegistrations.length ? Math.max(...allRegistrations.map(r => r.registration_id)) + 1 : 1, 
            student_id: studentData.student_id, 
            class_id: classId 
        };
        allRegistrations.push(newRegistration);

        localStorage.setItem('registrations', JSON.stringify(allRegistrations));
        localStorage.setItem('classes', JSON.stringify(allClasses));

        updateProgressStats();
        showMessage('Registration Submitted', `You have successfully ${existingRegistration ? 'changed your section for' : 'registered for'} "${course.course_name} (${classItem.section})".`);
        return Promise.resolve();
    }

    // function to handle withdrawal from a course
    async function handleWithdrawal(courseId) {
        const course = courses.find(c => c.course_id === courseId);
        const courseClasses = classes.filter(cls => cls.course_id === courseId);

        let allRegistrations = JSON.parse(localStorage.registrations);
        let allClasses = JSON.parse(localStorage.classes);

        const registration = allRegistrations.find(reg =>
            reg.student_id === studentData.student_id &&
            courseClasses.some(cls => cls.class_id === reg.class_id)
        );

        if (!registration) {
            showMessage('Error', `You are not registered for "${course.course_name}".`);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'registration-modal';
        modal.innerHTML = `
            <h2>Confirm Withdrawal</h2>
            <p>Are you sure you want to withdraw from "${course.course_name}"?</p>
            <div class="logout-buttons">
                <button class="logout-btn confirm-btn">Yes</button>
                <button class="logout-btn cancel-btn">No</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.confirm-btn').addEventListener('click', async () => {
            allRegistrations = allRegistrations.filter(reg => reg.registration_id !== registration.registration_id);

            localStorage.setItem('registrations', JSON.stringify(allRegistrations));
            localStorage.setItem('classes', JSON.stringify(allClasses));

            updateProgressStats();
            showMessage('Withdrawal Successful', `You have successfully withdrawn from "${course.course_name}".`);
            registrations = JSON.parse(localStorage.registrations);
            classes = JSON.parse(localStorage.classes);
            studentRegistrations = registrations.filter(reg => reg.student_id === studentData.student_id);
            renderCourses(availableCourses, studentRegistrations);
            modal.remove();
        });

        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.remove();
        });
    }
    // Function to update progress stats
    function updateProgressStats() {
        const completedCourses = studentData.completed_courses
            ? studentData.completed_courses
                .filter(cc => cc.grade !== 'F')
                .map(cc => {
                    const classItem = classes.find(cls => cls.class_id === cc.class_id);
                    return classItem ? classItem.course_id : null;
                })
                .filter(id => id !== null)
            : [];
    
        const registeredCourses = registrations
            .filter(reg => reg.student_id === studentData.student_id)
            .map(reg => {
                const classItem = classes.find(cls => cls.class_id === reg.class_id);
                // Exclude registrations for completed classes
                if (classItem && classItem.status !== 'completed') {
                    return classItem.course_id;
                }
                return null;
            })
            .filter(id => id !== null);
    
        const taken = completedCourses.length;
        const registered = registeredCourses.length;
        const majorData = majors.find(m => m.major === studentData.major);
        const totalCourses = majorData ? parseInt(majorData.totalNumberofCourses) || 0 : 0;
        const remaining = totalCourses - taken - registered;
    
        document.getElementById('taken').textContent = taken;
        document.getElementById('registered').textContent = registered;
        document.getElementById('remaining').textContent = remaining >= 0 ? remaining : 0;
    
        if (totalCourses > 0) {
            const takenPercent = (taken / totalCourses) * 100;
            const registeredPercent = (registered / totalCourses) * 100;
            const remainingPercent = (remaining / totalCourses) * 100;
    
            document.querySelector('.progress-bar-taken').style.width = `${takenPercent}%`;
            document.querySelector('.progress-bar-registered').style.width = `${registeredPercent}%`;
            document.querySelector('.progress-bar-remaining').style.width = `${remainingPercent}%`;
        }
    }
    // function to show popup messages
    function showMessage(title, message) {
        const existingModal = document.querySelector('.registration-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'registration-modal';
        modal.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <button>OK</button>
        `;
        document.body.appendChild(modal);

        modal.querySelector('button').addEventListener('click', () => {
            modal.remove();
        });
    }
});
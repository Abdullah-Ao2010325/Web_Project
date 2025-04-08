import { loadData, saveData } from '../js/dataManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        window.location.href = '../index.html';
        return;
    }

    let allData = { 
        users: [], 
        courses: [], 
        classes: [], 
        registrations: [], 
        majors: [] 
    };
    let studentData = null;
    allData = await loadData();

    let allUsers = allData.users;
    let allCourses = allData.courses;
    let allClasses = allData.classes;
    let allRegistrations = allData.registrations;
    let allMajors = allData.majors;

    // Update registered_students in classes based on approved registrations
    allRegistrations.forEach(reg => {
        if (reg.status === 'Approved') {
            const classItem = allClasses.find(cls => cls.class_id === reg.class_id);
            if (classItem && !classItem.registered_students.includes(reg.student_id)) {
                classItem.registered_students.push(reg.student_id);
            }
        }
    });

    studentData = allUsers.find(user => user.role === 'Student' && user.username === loggedInUsername);
    if (!studentData) {
        alert('Student data not found. Redirecting to login.');
        window.location.href = '../index.html';
        return;
    }

    // Update student information
    document.getElementById('student-name').textContent = studentData.firstName;
    document.getElementById('major').textContent = studentData.major;
    document.getElementById('cgpa').textContent = studentData.cgpa;
    document.getElementById('advisor').textContent = studentData.advisor;

    // Get completed course IDs
    const completedCourses = studentData.completed_courses ? studentData.completed_courses.map(cc => {
        const classItem = allClasses.find(cls => cls.class_id === cc.class_id);
        return classItem ? classItem.course_id : null;
    }).filter(id => id !== null) : [];

    // Get registered course IDs (approved or pending)
    const registeredCourses = allRegistrations
        .filter(reg => reg.student_id === studentData.student_id && (reg.status === 'Approved' || reg.status === 'Pending'))
        .map(reg => {
            const classItem = allClasses.find(cls => cls.class_id === reg.class_id);
            return classItem ? classItem.course_id : null;
        })
        .filter(id => id !== null);

    const taken = completedCourses.length;
    const registered = registeredCourses.length;
    const majorData = allMajors.find(m => m.major === studentData.major);
    const totalCourses = majorData ? parseInt(majorData.totalNumberofCourses) || 0 : 0;
    const remaining = totalCourses - taken - registered;

    document.getElementById('taken').textContent = taken;
    document.getElementById('registered').textContent = registered;
    document.getElementById('remaining').textContent = remaining >= 0 ? remaining : 0;

    // Update progress bar
    if (totalCourses > 0) {
        const takenPercent = (taken / totalCourses) * 100;
        const registeredPercent = (registered / totalCourses) * 100;
        const remainingPercent = (remaining / totalCourses) * 100;

        document.querySelector('.progress-bar-taken').style.width = `${takenPercent}%`;
        document.querySelector('.progress-bar-registered').style.width = `${registeredPercent}%`;
        document.querySelector('.progress-bar-remaining').style.width = `${remainingPercent}%`;
    }

    let studentRegistrations = allRegistrations.filter(reg => reg.student_id === studentData.student_id);

    // Filter available courses: not completed, and either the student is registered or there is at least one open class with available seats
    const availableCourses = allCourses.filter(course => {
        const isNotTaken = !completedCourses.includes(course.course_id);
        if (!isNotTaken) return false;

        const isRegistered = registeredCourses.includes(course.course_id);
        const courseClasses = allClasses.filter(cls => cls.course_id === course.course_id);
        const hasOpenClass = courseClasses.some(cls => {
            const pendingAndApprovedRegistrations = allRegistrations.filter(reg => 
                reg.class_id === cls.class_id && (reg.status === 'Approved' || reg.status === 'Pending')
            ).length;
            const availableSeats = cls.capacity - pendingAndApprovedRegistrations;
            return cls.status === 'open-for-registration' && availableSeats > 0;
        });

        return isRegistered || hasOpenClass;
    });

    renderCourses(availableCourses, studentRegistrations);

    const majorFilter = document.getElementById('Major');
    const termFilter = document.getElementById('Terms');
    const searchInput = document.getElementById('courseSearch');

    majorFilter.addEventListener('change', filterCourses);
    termFilter.addEventListener('change', filterCourses);
    searchInput.addEventListener('input', filterCourses);

    function filterCourses() {
        const selectedMajor = majorFilter.value;
        const selectedTerm = termFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        const filteredCourses = availableCourses.filter(course => {
            const courseClasses = allClasses.filter(cls => cls.course_id === course.course_id);
            const matchesMajor = !selectedMajor || (Array.isArray(course.major) ? course.major.includes(selectedMajor) : course.major === selectedMajor);
            const matchesTerm = !selectedTerm || courseClasses.some(cls => cls.term === selectedTerm);
            const matchesSearch = !searchTerm || course.course_name.toLowerCase().includes(searchTerm);
            return matchesMajor && matchesTerm && matchesSearch;
        });

        renderCourses(filteredCourses, studentRegistrations);
    }

    function renderCourses(courses, studentRegistrations) {
        const courseBoxesContainer = document.querySelector('.course-boxes');
        courseBoxesContainer.innerHTML = '';

        if (courses.length === 0) {
            courseBoxesContainer.innerHTML = '<p>No courses available for registration at this time.</p>';
            return;
        }

        courses.forEach(course => {
            const courseClasses = allClasses.filter(cls => cls.course_id === course.course_id);
            if (courseClasses.length === 0) return;

            const studentReg = studentRegistrations.find(reg => 
                reg.student_id === studentData.student_id && 
                courseClasses.some(cls => cls.class_id === reg.class_id)
            );

            const isRegistered = !!studentReg && studentReg.status !== 'Rejected';
            const registeredClass = isRegistered ? allClasses.find(cls => cls.class_id === studentReg.class_id) : null;

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
                                : courseClasses
                                    .filter(cls => {
                                        const pendingAndApprovedRegistrations = allRegistrations.filter(reg => 
                                            reg.class_id === cls.class_id && (reg.status === 'Approved' || reg.status === 'Pending')
                                        ).length;
                                        const availableSeats = cls.capacity - pendingAndApprovedRegistrations;
                                        return cls.status === 'open-for-registration' && availableSeats > 0;
                                    })
                                    .map(cls => cls.section)
                                    .join(', ')
                        }</span>
                    </div>
                    <div class="course-actions">
                        ${isRegistered ? `
                            <button class="change-section-btn" data-course-id="${course.course_id}" style="width: 100px;">Change Section</button>
                            <button class="withdraw-btn" data-course-id="${course.course_id}" style="width: 100px;">Withdraw</button>
                        ` : `
                            <button class="register-btn" data-course-id="${course.course_id}" style="width: 100px;">Register</button>
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

    function handleRegistration(courseId) {
        const course = allCourses.find(c => c.course_id === courseId);
        const courseClasses = allClasses.filter(cls => cls.course_id === courseId);

        const completedCourseIds = studentData.completed_courses
            .map(cc => {
                const classItem = allClasses.find(cls => cls.class_id === cc.class_id);
                return classItem ? classItem.course_id : null;
            })
            .filter(id => id !== null);

        const prerequisitesMet = course.prerequisites.every(prereqCourseId => {
            const hasCompletedCourse = completedCourseIds.includes(prereqCourseId);
            const hasPassingGrade = studentData.completed_courses.some(cc => {
                const classItem = allClasses.find(cls => cls.class_id === cc.class_id);
                return classItem && classItem.course_id === prereqCourseId && cc.grade !== 'F';
            });
            return hasCompletedCourse && hasPassingGrade;
        });

        if (!prerequisitesMet) {
            const missingPrereqs = course.prerequisites
                .filter(prereq => {
                    const hasCompleted = completedCourseIds.includes(prereq);
                    const hasPassingGrade = studentData.completed_courses.some(cc => {
                        const classItem = allClasses.find(cls => cls.class_id === cc.class_id);
                        return classItem && classItem.course_id === prereq && cc.grade !== 'F';
                    });
                    return !(hasCompleted && hasPassingGrade);
                })
                .map(prereq => {
                    const prereqCourse = allCourses.find(c => c.course_id === prereq);
                    return prereqCourse ? prereqCourse.course_name : 'Unknown Course';
                });
            showMessage('Prerequisites Not Met', `You cannot register for "${course.course_name}" because you haven't completed: ${missingPrereqs.join(', ')}.`);
            return;
        }

        const availableClass = courseClasses.find(cls => {
            const pendingAndApprovedRegistrations = allRegistrations.filter(reg => 
                reg.class_id === cls.class_id && (reg.status === 'Approved' || reg.status === 'Pending')
            ).length;
            const availableSeats = cls.capacity - pendingAndApprovedRegistrations;
            return cls.status === 'open-for-registration' && availableSeats > 0;
        });

        if (!availableClass) {
            showMessage('Registration Not Available', `No classes for "${course.course_name}" are currently open for registration or have available seats.`);
            return;
        }

        showClassSelectionPopup(course, courseClasses);
    }

    function handleChangeSection(courseId) {
        const course = allCourses.find(c => c.course_id === courseId);
        const courseClasses = allClasses.filter(cls => cls.course_id === courseId);
        showClassSelectionPopup(course, courseClasses);
    }

    function showClassSelectionPopup(course, courseClasses) {
        const modal = document.createElement('div');
        modal.className = 'class-selection-modal';
        let optionsHtml = '';

        const currentRegistration = allRegistrations.find(reg =>
            reg.student_id === studentData.student_id &&
            courseClasses.some(cls => cls.class_id === reg.class_id) &&
            reg.status !== 'Rejected'
        );

        courseClasses.forEach(cls => {
            const instructor = allUsers.find(user => user.instructor_id === cls.instructor_id);
            const instructorName = instructor ? instructor.firstName : 'N/A';

            if (cls.status !== 'open-for-registration') {
                return;
            }

            const pendingAndApprovedRegistrations = allRegistrations.filter(reg => 
                reg.class_id === cls.class_id && (reg.status === 'Approved' || reg.status === 'Pending')
            ).length;
            const availableSeats = cls.capacity - pendingAndApprovedRegistrations;
            if (availableSeats <= 0) {
                return;
            }

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
                modal.remove();
                confirmRegistration(classId, currentRegistration);
            });
        });

        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
    }

    function confirmRegistration(classId, existingRegistration) {
        const classItem = allClasses.find(c => c.class_id === classId);
        const course = allCourses.find(c => c.course_id === classItem.course_id);

        if (existingRegistration && existingRegistration.status === 'Approved') {
            const currentClass = allClasses.find(cls => cls.class_id === existingRegistration.class_id);
            showMessage(
                'Approved Registration', 
                `Your registration for "${course.course_name}" in section ${currentClass.section} has been approved. You must withdraw from this section before registering for a different one.`
            );
            return;
        }

        if (existingRegistration) {
            allRegistrations = allRegistrations.filter(reg => reg.registration_id !== existingRegistration.registration_id);
            studentRegistrations = studentRegistrations.filter(reg => reg.registration_id !== existingRegistration.registration_id);
            if (existingRegistration.status === 'Approved') {
                const oldClass = allClasses.find(cls => cls.class_id === existingRegistration.class_id);
                oldClass.registered_students = oldClass.registered_students.filter(id => id !== studentData.student_id);
            }
        }

        const newRegistration = {
            registration_id: allRegistrations.length + 1,
            student_id: studentData.student_id,
            class_id: classId,
            status: 'Pending'
        };
        allRegistrations.push(newRegistration);
        studentRegistrations = allRegistrations.filter(reg => reg.student_id === studentData.student_id);

        allData.registrations = allRegistrations;
        saveData(allData);

        updateProgressStats();
        showMessage('Registration Submitted', `You have successfully ${existingRegistration ? 'changed your section for' : 'registered for'} "${course.course_name} (${classItem.section})". Waiting for administrator approval.`);
        renderCourses(availableCourses, studentRegistrations);
    }

    function handleWithdrawal(courseId) {
        const course = allCourses.find(c => c.course_id === courseId);
        const courseClasses = allClasses.filter(cls => cls.course_id === courseId);

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
            studentRegistrations = allRegistrations.filter(reg => reg.student_id === studentData.student_id); 
            if (registration.status === 'Approved') {
                const classItem = allClasses.find(cls => cls.class_id === registration.class_id);
                classItem.registered_students = classItem.registered_students.filter(id => id !== studentData.student_id);
                updateProgressStats();
            }
            allData.registrations = allRegistrations;
            saveData(allData);

            showMessage('Withdrawal Successful', `You have successfully withdrawn from "${course.course_name}".`);
            renderCourses(availableCourses, studentRegistrations);
            modal.remove();
        });

        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.remove();
        });
    }

    function updateProgressStats() {
        const completedCourses = studentData.completed_courses ? studentData.completed_courses.map(cc => {
            const classItem = allClasses.find(cls => cls.class_id === cc.class_id);
            return classItem ? classItem.course_id : null;
        }).filter(id => id !== null) : [];

        const registeredCourses = allRegistrations
            .filter(reg => reg.student_id === studentData.student_id && reg.status === 'Approved')
            .map(reg => {
                const classItem = allClasses.find(cls => cls.class_id === reg.class_id);
                return classItem ? classItem.course_id : null;
            })
            .filter(id => id !== null);

        const taken = completedCourses.length;
        const registered = registeredCourses.length;
        const majorData = allMajors.find(m => m.major === studentData.major);
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
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

    document.getElementById('student-name').textContent = studentData.firstName;
    document.getElementById('major').textContent = studentData.major;
    document.getElementById('cgpa').textContent = studentData.cgpa;
    document.getElementById('advisor').textContent = studentData.advisor;

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

    const totalProgress = totalCourses || taken + registered + remaining;
    if (totalProgress > 0) {
        const takenPercent = (taken / totalProgress) * 100;
        const registeredPercent = (registered / totalProgress) * 100;
        const remainingPercent = (remaining / totalProgress) * 100;

        document.querySelector('.progress-bar-taken').style.width = `${takenPercent}%`;
        document.querySelector('.progress-bar-registered').style.width = `${registeredPercent}%`;
        document.querySelector('.progress-bar-remaining').style.width = `${remainingPercent}%`;
    }

    const studentRegistrations = allRegistrations.filter(reg => reg.student_id === studentData.student_id);
    const registeredCourseIds = studentRegistrations.map(reg => {
        const classItem = allClasses.find(cls => cls.class_id === reg.class_id);
        return classItem ? classItem.course_id : null;
    }).filter(id => id !== null);

    const availableCourses = allCourses.filter(course => {
        const isNotTaken = !completedCourses.includes(course.course_id);
        const validStatus = course.status === 'Validated' || course.status === 'In Progress';
        return isNotTaken && validStatus;
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
            let matchesTerm = !selectedTerm;
            if (selectedTerm) {
                for (let i = 0; i < courseClasses.length; i++) {
                    if (courseClasses[i].term === selectedTerm) {
                        matchesTerm = true;
                        break;
                    }
                }
            }
            const matchesSearch = !searchTerm || course.course_name.toLowerCase().includes(searchTerm);
            return matchesMajor && matchesTerm && matchesSearch;
        });

        renderCourses(filteredCourses, studentRegistrations);
    }

    function renderCourses(courses, studentRegistrations) {
        const courseBoxesContainer = document.querySelector('.course-boxes');
        courseBoxesContainer.innerHTML = '';

        if (courses.length === 0) {
            courseBoxesContainer.innerHTML = '<p>No courses available.</p>';
            return;
        }

        courses.forEach(course => {
            const courseClasses = allClasses.filter(cls => cls.course_id === course.course_id);
            if (courseClasses.length === 0) return;

            let studentReg = null;
            for (let i = 0; i < studentRegistrations.length; i++) {
                const reg = studentRegistrations[i];
                let hasMatchingClass = false;
                for (let j = 0; j < courseClasses.length; j++) {
                    if (courseClasses[j].class_id === reg.class_id) {
                        hasMatchingClass = true;
                        break;
                    }
                }
                if (reg.student_id === studentData.student_id && hasMatchingClass) {
                    studentReg = reg;
                    break;
                }
            }

            const isRegistered = !!studentReg;
            const regStatus = studentReg ? studentReg.status : null;
            const registeredClass = studentReg ? allClasses.find(cls => cls.class_id === studentReg.class_id) : null;

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
                        <span class="value">${isRegistered ? (registeredClass ? registeredClass.section : 'N/A') : courseClasses.map(cls => cls.section).join(', ')}</span>
                    </div>
                    ${isRegistered ? `
                        <div class="course-detail-item">
                            <span class="label"><span class="material-symbols-rounded">pending</span>Status:</span>
                            <span class="value">${regStatus}</span>
                        </div>
                    ` : ''}
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
    
        let prerequisitesMet = true;
        for (let i = 0; i < course.prerequisites.length; i++) {
            const prereqCourseId = course.prerequisites[i];
            const hasCompletedCourse = completedCourseIds.includes(prereqCourseId);
    
            let hasPassingGrade = false;
            for (let j = 0; j < studentData.completed_courses.length; j++) {
                const cc = studentData.completed_courses[j];
                const classItem = allClasses.find(cls => cls.class_id === cc.class_id);
                if (classItem && classItem.course_id === prereqCourseId && cc.grade !== 'F') {
                    hasPassingGrade = true;
                    break; 
                }
            }
    
            if (!(hasCompletedCourse && hasPassingGrade)) {
                prerequisitesMet = false;
                break; 
            }
        }
    
        if (!prerequisitesMet) {
            const missingPrereqs = course.prerequisites
                .filter(prereq => {
                    const hasCompleted = completedCourseIds.includes(prereq);
                    let hasPassingGrade = false;
                    for (let j = 0; j < studentData.completed_courses.length; j++) {
                        const cc = studentData.completed_courses[j];
                        const classItem = allClasses.find(cls => cls.class_id === cc.class_id);
                        if (classItem && classItem.course_id === prereq && cc.grade !== 'F') {
                            hasPassingGrade = true;
                            break;
                        }
                    }
                    return !(hasCompleted && hasPassingGrade);
                })
                .map(prereq => {
                    const prereqCourse = allCourses.find(c => c.course_id === prereq);
                    return prereqCourse ? prereqCourse.course_name : 'Unknown Course';
                });
            showMessage('Prerequisites Not Met', `You cannot register for "${course.course_name}" because you haven't completed: ${missingPrereqs.join(', ')}.`);
            return;
        }
    
        const availableClass = courseClasses.find(cls => 
            cls.open_for_registration === true &&
            (cls.capacity - cls.registered_students.length) > 0
        );
    
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
            courseClasses.some(cls => cls.class_id === reg.class_id)
        );

        courseClasses.forEach(cls => {
            const instructor = allUsers.find(user => user.instructor_id === cls.instructor_id);
            const instructorName = instructor ? instructor.firstName : 'N/A';

            if (!cls.open_for_registration) {
                return;
            }

            const availableSeats = cls.capacity - cls.registered_students.length;
            if (availableSeats <= 0) {
                return;
            }

            // Replace some with a loop
            let isRegistered = false;
            for (let i = 0; i < allRegistrations.length; i++) {
                const reg = allRegistrations[i];
                if (reg.student_id === studentData.student_id && reg.class_id === cls.class_id) {
                    isRegistered = true;
                    break;
                }
            }

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

        if (existingRegistration) {
            allRegistrations = allRegistrations.filter(reg => reg.registration_id !== existingRegistration.registration_id);
            if (existingRegistration.status === 'Approved') {
                const oldClass = allClasses.find(cls => cls.class_id === existingRegistration.class_id);
                oldClass.registered_students = oldClass.registered_students.filter(id => id !== studentData.student_id);
            }
        }

        allRegistrations.push({
            registration_id: allRegistrations.length + 1,
            student_id: studentData.student_id,
            class_id: classId,
            status: 'Pending'
        });

        allData.registrations = allRegistrations;
        saveData(allData);

        updateProgressStats();
        showMessage('Registration Submitted', `You have successfully ${existingRegistration ? 'changed your section for' : 'registered for'} "${course.course_name} (${classItem.section})". waiting for administrator approval.`);
        renderCourses(availableCourses, allRegistrations);
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

        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            allRegistrations = allRegistrations.filter(reg => reg.registration_id !== registration.registration_id);
            if (registration.status === 'Approved') {
                const classItem = allClasses.find(cls => cls.class_id === registration.class_id);
                classItem.registered_students = classItem.registered_students.filter(id => id !== studentData.student_id);
                updateProgressStats();
            }
            allData.registrations = allRegistrations;
            saveData(allData);

            showMessage('Withdrawal Successful', `You have successfully withdrawn from "${course.course_name}".`);
            renderCourses(availableCourses, allRegistrations);
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

        const totalProgress = totalCourses || taken + registered + remaining;
        if (totalProgress > 0) {
            const takenPercent = (taken / totalProgress) * 100;
            const registeredPercent = (registered / totalProgress) * 100;
            const remainingPercent = (remaining / totalProgress) * 100;

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
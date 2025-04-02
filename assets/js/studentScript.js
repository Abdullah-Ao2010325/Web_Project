// Import data management functions
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

    // Show loading state
    document.querySelector('.course-boxes').innerHTML = '<p>Loading courses...</p>';

    // Load data
    try {
        allData = await loadData();
        console.log('Data loaded successfully:', allData); // Debug log
    } catch (error) {
        console.error('Failed to load data:', error);
        document.querySelector('.course-boxes').innerHTML = '<p>Error loading courses. Please try again later.</p>';
        alert('Failed to load data. Please check the console for details and try again.');
        return;
    }

    // Extract data for easier access
    const allUsers = allData.users;
    const allCourses = allData.courses;
    const allClasses = allData.classes;
    let allRegistrations = allData.registrations;
    const allMajors = allData.majors;

    // Find the logged-in student
    studentData = allUsers.find(user => user.role === 'Student' && user.username === loggedInUsername);
    if (!studentData) {
        console.error('Student data not found for username:', loggedInUsername);
        alert('Student data not found. Redirecting to login.');
        window.location.href = '../index.html';
        return;
    }

    // Update student info
    document.getElementById('student-name').textContent = studentData.firstName || loggedInUsername;
    document.getElementById('major').textContent = studentData.major || 'N/A';
    document.getElementById('cgpa').textContent = studentData.cgpa || 'N/A';
    document.getElementById('advisor').textContent = studentData.advisor || 'N/A';

    // Calculate progress stats
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

    // Update progress stats
    document.getElementById('taken').textContent = taken;
    document.getElementById('registered').textContent = registered;
    document.getElementById('remaining').textContent = remaining >= 0 ? remaining : 0;

    // Update progress bar
    const totalProgress = totalCourses || taken + registered + remaining;
    if (totalProgress > 0) {
        const takenPercent = (taken / totalProgress) * 100;
        const registeredPercent = (registered / totalProgress) * 100;
        const remainingPercent = (remaining / totalProgress) * 100;

        document.querySelector('.progress-bar-taken').style.width = `${takenPercent}%`;
        document.querySelector('.progress-bar-registered').style.width = `${registeredPercent}%`;
        document.querySelector('.progress-bar-remaining').style.width = `${remainingPercent}%`;
    }

    // Filter courses that the student has not completed or registered (including pending)
    const studentRegistrations = allRegistrations.filter(reg => reg.student_id === studentData.student_id);
    const registeredCourseIds = studentRegistrations.map(reg => {
        const classItem = allClasses.find(cls => cls.class_id === reg.class_id);
        return classItem ? classItem.course_id : null;
    }).filter(id => id !== null);

    const availableCourses = allCourses.filter(course => {
        return !completedCourses.includes(course.course_id) && !registeredCourseIds.includes(course.course_id);
    });

    // Render courses (one card per course)
    renderCourses(availableCourses, studentRegistrations);

    // Set up filters
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
            courseBoxesContainer.innerHTML = '<p>No courses available.</p>';
            return;
        }

        courses.forEach(course => {
            const courseClasses = allClasses.filter(cls => cls.course_id === course.course_id);
            if (courseClasses.length === 0) return; // Skip if no classes available

            const isRegistered = studentRegistrations.some(reg =>
                reg.student_id === studentData.student_id &&
                courseClasses.some(cls => cls.class_id === reg.class_id)
            );

            const courseBox = document.createElement('div');
            courseBox.classList.add('course-box');
            courseBox.innerHTML = `
                <div class="course-header">
                    <h3 title="${course.course_name}">${course.course_name || 'Unnamed Course'}</h3>
                </div>
                <div class="course-details">
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">tag</span>Course Number:</span>
                        <span class="value">${course.course_number || 'N/A'}</span>
                    </div>
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">school</span>Major:</span>
                        <span class="value">${Array.isArray(course.major) ? course.major.join(', ') : course.major || 'N/A'}</span>
                    </div>
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">class</span>Sections Available:</span>
                        <span class="value">${courseClasses.map(cls => cls.section).join(', ') || 'N/A'}</span>
                    </div>
                    <div class="course-actions">
                        <button class="register-btn" data-course-id="${course.course_id}" style="width: 100px;">
                            ${isRegistered ? 'Change Section' : 'Register'}
                        </button>
                        ${isRegistered ? `<button class="withdraw-btn" data-course-id="${course.course_id}" style="width: 100px;">Withdraw</button>` : ''}
                    </div>
                </div>
            `;
            courseBoxesContainer.appendChild(courseBox);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = parseInt(e.target.getAttribute('data-course-id'));
                handleRegistration(courseId);
            });
        });

        document.querySelectorAll('.withdraw-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseId = parseInt(e.target.getAttribute('data-course-id'));
                handleWithdrawal(courseId);
            });
        });

        // Render registered courses (including pending)
        const registeredCourses = allCourses.filter(course => 
            studentRegistrations.some(reg => {
                const classItem = allClasses.find(cls => cls.class_id === reg.class_id);
                return classItem && classItem.course_id === course.course_id;
            })
        );
        registeredCourses.forEach(course => {
            const courseClasses = allClasses.filter(cls => cls.course_id === course.course_id);
            const studentReg = studentRegistrations.find(reg => 
                reg.student_id === studentData.student_id && 
                courseClasses.some(cls => cls.class_id === reg.class_id)
            );
            if (studentReg) {
                const classItem = allClasses.find(cls => cls.class_id === studentReg.class_id);
                const courseBox = document.createElement('div');
                courseBox.classList.add('course-box');
                courseBox.innerHTML = `
                    <div class="course-header">
                        <h3 title="${course.course_name}">${course.course_name || 'Unnamed Course'}</h3>
                    </div>
                    <div class="course-details">
                        <div class="course-detail-item">
                            <span class="label"><span class="material-symbols-rounded">tag</span>Course Number:</span>
                            <span class="value">${course.course_number || 'N/A'}</span>
                        </div>
                        <div class="course-detail-item">
                            <span class="label"><span class="material-symbols-rounded">school</span>Major:</span>
                            <span class="value">${Array.isArray(course.major) ? course.major.join(', ') : course.major || 'N/A'}</span>
                        </div>
                        <div class="course-detail-item">
                            <span class="label"><span class="material-symbols-rounded">class</span>Section:</span>
                            <span class="value">${classItem ? classItem.section : 'N/A'}</span>
                        </div>
                        <div class="course-actions">
                            <button class="change-section-btn" data-course-id="${course.course_id}" style="width: 100px;">Change Section</button>
                            <button class="withdraw-btn" data-course-id="${course.course_id}" style="width: 100px;">Withdraw</button>
                        </div>
                    </div>
                `;
                courseBoxesContainer.appendChild(courseBox);
            }
        });

        // Add event listeners for change section and withdraw buttons
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

        // Check prerequisites
        const completedCourses = studentData.completed_courses.map(cc => cc.class_id);
        const coursePrereqs = course.prerequisites.map(prereq => {
            const prereqClasses = allClasses.filter(cls => cls.course_id === prereq);
            return prereqClasses.map(cls => cls.class_id);
        }).flat();

        const prerequisitesMet = coursePrereqs.every(prereqClassId =>
            completedCourses.includes(prereqClassId) &&
            studentData.completed_courses.find(cc => cc.class_id === prereqClassId && cc.grade !== 'F')
        );

        if (!prerequisitesMet) {
            const missingPrereqs = course.prerequisites.map(prereq => {
                const prereqCourse = allCourses.find(c => c.course_id === prereq);
                return prereqCourse ? prereqCourse.course_name : 'Unknown Course';
            }).filter(prereq => !studentData.completed_courses.some(cc => {
                const ccCourse = allClasses.find(cls => cls.class_id === cc.class_id);
                return ccCourse && ccCourse.course_id === prereq && cc.grade !== 'F';
            }));
            showMessage('Prerequisites Not Met', `You cannot register for "${course.course_name}" because you haven't completed: ${missingPrereqs.join(', ')} with a passing grade.`);
            return;
        }

        // Check if any class is open for registration
        const availableClass = courseClasses.find(cls => 
            cls.open_for_registration === true &&
            cls.status === 'Validated' &&
            allRegistrations.filter(reg => reg.class_id === cls.class_id).length < cls.capacity
        );

        if (!availableClass) {
            showMessage('No Available Classes', `No available classes for "${course.course_name}" at this time.`);
            return;
        }

        // Show class selection popup
        showClassSelectionPopup(course, courseClasses);
    }

    function handleChangeSection(courseId) {
        const course = allCourses.find(c => c.course_id === courseId);
        const courseClasses = allClasses.filter(cls => cls.course_id === courseId);

        // Show class selection popup for changing section
        showClassSelectionPopup(course, courseClasses);
    }

    function showClassSelectionPopup(course, courseClasses) {
        const modal = document.createElement('div');
        modal.className = 'class-selection-modal';
        let optionsHtml = '';

        // Check if the student is already registered for this course
        const currentRegistration = allRegistrations.find(reg =>
            reg.student_id === studentData.student_id &&
            courseClasses.some(cls => cls.class_id === reg.class_id)
        );

        courseClasses.forEach(cls => {
            const instructor = allUsers.find(user => user.instructor_id === cls.instructor_id);
            const instructorName = instructor ? instructor.firstName : 'N/A';

            // Check if the class is open for registration
            if (!cls.open_for_registration) {
                return; // Skip classes that are not open
            }

            // Check class status
            if (cls.status !== 'Validated' && cls.status !== 'Pending') {
                return; // Skip classes that are not available
            }

            // Check capacity
            const enrolledCount = allRegistrations.filter(reg => reg.class_id === cls.class_id).length;
            if (enrolledCount >= cls.capacity) {
                return; // Skip full classes
            }

            // Check if already registered in this specific class
            const isRegistered = allRegistrations.some(reg =>
                reg.student_id === studentData.student_id && reg.class_id === cls.class_id
            );

            optionsHtml += `
                <div class="class-option">
                    <span>${course.course_name} (${cls.section}) - ${instructorName} (${cls.term})</span>
                    <button data-class-id="${cls.class_id}" ${isRegistered ? 'disabled' : ''}>
                        ${isRegistered ? 'Selected' : 'Select'}
                    </button>
                </div>
            `;
        });

        if (!optionsHtml) {
            showMessage('No Classes Available', `No available classes for "${course.course_name}" at this time.`);
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

        // If there's an existing registration, remove it
        if (existingRegistration) {
            allRegistrations = allRegistrations.filter(reg => reg.registration_id !== existingRegistration.registration_id);
        }

        // Add new registration
        allRegistrations.push({
            registration_id: allRegistrations.length + 1,
            student_id: studentData.student_id,
            class_id: classId,
            status: 'Pending'
        });

        // Update allData and save to Local Storage
        allData.registrations = allRegistrations;
        saveData(allData);

        // Update progress stats and re-render
        updateProgressStats();
        showMessage('Registration Updated', `You have successfully ${existingRegistration ? 'changed your section for' : 'registered for'} "${course.course_name} (${classItem.section})". Awaiting administrator approval.`);
        renderCourses(availableCourses.filter(c => c.course_id !== course.course_id), allRegistrations);
    }

    function handleWithdrawal(courseId) {
        const course = allCourses.find(c => c.course_id === courseId);
        const courseClasses = allClasses.filter(cls => cls.course_id === courseId);

        // Find the student's registration for this course
        const registration = allRegistrations.find(reg =>
            reg.student_id === studentData.student_id &&
            courseClasses.some(cls => cls.class_id === reg.class_id)
        );

        if (!registration) {
            showMessage('Error', `You are not registered for "${course.course_name}".`);
            return;
        }

        // Confirm withdrawal
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
            // Remove the registration
            allRegistrations = allRegistrations.filter(reg => reg.registration_id !== registration.registration_id);

            // Update allData and save to Local Storage
            allData.registrations = allRegistrations;
            saveData(allData);

            // Update progress stats and re-render
            updateProgressStats();
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
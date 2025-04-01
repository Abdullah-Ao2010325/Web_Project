document.addEventListener('DOMContentLoaded', () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        window.location.href = '../index.html';
        return;
    }

    let allCourses = [];
    let allClasses = [];
    let allUsers = [];
    let allRegistrations = [];
    let allMajors = [];
    let studentData = null;

    // Fetch JSON files with fallback paths
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

    // Load all data
    Promise.all([
        fetchJSON('users.json', ['/assets/data/users.json']),
        fetchJSON('courses.json', ['/assets/data/courses.json']),
        fetchJSON('classes.json', ['/assets/data/classes.json']),
        fetchJSON('registrations.json', ['/assets/data/registrations.json']),
        fetchJSON('majors.json', ['/assets/data/majors.json'])
    ])
        .then(([users, courses, classes, registrations, majors]) => {
            allUsers = users;
            allCourses = courses;
            allClasses = classes;
            allRegistrations = registrations;
            allMajors = majors;

            // Find the logged-in student
            studentData = allUsers.find(user => user.role === 'Student' && user.username === loggedInUsername);
            if (!studentData) {
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
            const taken = studentData.completed_courses ? studentData.completed_courses.length : 0;
            const registered = allRegistrations.filter(reg => 
                reg.student_id === studentData.student_id && reg.status === 'Approved'
            ).length;
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

            // Render courses
            renderCourses(allClasses);

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

                const filteredClasses = allClasses.filter(classItem => {
                    const course = allCourses.find(c => c.course_id === classItem.course_id);
                    const matchesMajor = !selectedMajor || (Array.isArray(course.major) ? course.major.includes(selectedMajor) : course.major === selectedMajor);
                    const matchesTerm = !selectedTerm || classItem.term === selectedTerm;
                    const matchesSearch = !searchTerm || course.course_name.toLowerCase().includes(searchTerm);
                    return matchesMajor && matchesTerm && matchesSearch;
                });

                renderCourses(filteredClasses);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to load data. Please log in again.');
            window.location.href = '../index.html';
        });

    function renderCourses(classes) {
        const courseBoxesContainer = document.querySelector('.course-boxes');
        courseBoxesContainer.innerHTML = '';

        classes.forEach(classItem => {
            const course = allCourses.find(c => c.course_id === classItem.course_id);
            const instructor = allUsers.find(user => user.instructor_id === classItem.instructor_id);
            const instructorName = instructor ? instructor.firstName : 'N/A';

            // Check if the student is already registered in this class
            const isRegistered = allRegistrations.some(reg => 
                reg.student_id === studentData.student_id && 
                reg.class_id === classItem.class_id
            );

            const courseBox = document.createElement('div');
            courseBox.classList.add('course-box');
            courseBox.innerHTML = `
                <div class="course-header">
                    <h3 title="${course.course_name}">${course.course_name || 'Unnamed Course'}</h3>
                </div>
                <div class="course-details">
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">class</span>Section:</span>
                        <span class="value">${classItem.section || 'N/A'}</span>
                    </div>
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">calendar_today</span>Term:</span>
                        <span class="value">${classItem.term || 'N/A'}</span>
                    </div>
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">tag</span>Course Number:</span>
                        <span class="value">${course.course_number || 'N/A'}</span>
                    </div>
                    <div class="divider"></div>
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">person</span>Instructor:</span>
                        <span class="value">${instructorName}</span>
                    </div>
                    <button class="register-btn" data-class-id="${classItem.class_id}" ${isRegistered ? 'disabled' : ''}>
                        ${isRegistered ? 'Registered' : 'Register'}
                    </button>
                </div>
            `;
            courseBoxesContainer.appendChild(courseBox);
        });

        // Add event listeners to register buttons
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const classId = parseInt(e.target.getAttribute('data-class-id'));
                handleRegistration(classId);
            });
        });
    }

    function handleRegistration(classId) {
        const classItem = allClasses.find(c => c.class_id === classId);
        const course = allCourses.find(c => c.course_id === classItem.course_id);

        // Check if the course is open for registration
        if (!classItem.open_for_registration) {
            showMessage('Registration Closed', `The class "${course.course_name} (${classItem.section})" is not open for registration at this time.`);
            return;
        }

        // Check if the class is in a valid status
        if (classItem.status !== 'Validated' && classItem.status !== 'Pending') {
            showMessage('Class Unavailable', `The class "${course.course_name} (${classItem.section})" is not available for registration (Status: ${classItem.status}).`);
            return;
        }

        // Check prerequisites
        const completedCourses = studentData.completed_courses.map(cc => cc.class_id);
        const coursePrereqs = course.prerequisites.map(prereq => {
            const prereqClasses = allClasses.filter(cls => cls.course_id === prereq);
            return prereqClasses.map(cls => cls.class_id);
        }).flat();

        const prerequisitesMet = coursePrereqs.every(prereqClassId => 
            completedCourses.includes(prereqClassId) && 
            studentData.completed_courses.find(cc => cc.class_id === prereqClassId).grade !== 'F'
        );

        if (!prerequisitesMet) {
            const missingPrereqs = course.prerequisites.map(prereq => {
                const prereqCourse = allCourses.find(c => c.course_id === prereq);
                return prereqCourse.course_name;
            }).filter(prereq => !studentData.completed_courses.some(cc => {
                const ccCourse = allClasses.find(cls => cls.class_id === cc.class_id);
                return ccCourse && ccCourse.course_id === prereq && cc.grade !== 'F';
            }));
            showMessage('Prerequisites Not Met', `You cannot register for "${course.course_name}" because you haven't completed: ${missingPrereqs.join(', ')}.`);
            return;
        }

        // Check capacity
        const enrolledCount = classItem.registered_students ? classItem.registered_students.length : 0;
        if (enrolledCount >= classItem.capacity) {
            showMessage('No Seats Available', `The class "${course.course_name} (${classItem.section})" has reached its capacity of ${classItem.capacity} students.`);
            return;
        }

        // Check if already registered in this class
        if (allRegistrations.some(reg => reg.student_id === studentData.student_id && reg.class_id === classId)) {
            showMessage('Already Registered', `You are already registered for "${course.course_name} (${classItem.section})".`);
            return;
        }

        // Check if the course has multiple classes
        const courseClasses = allClasses.filter(cls => cls.course_id === course.course_id);
        if (courseClasses.length > 1) {
            showClassSelectionPopup(course, courseClasses, classId);
        } else {
            confirmRegistration(classId);
        }
    }

    function showClassSelectionPopup(course, courseClasses, selectedClassId) {
        const modal = document.createElement('div');
        modal.className = 'class-selection-modal';
        let optionsHtml = '';

        courseClasses.forEach(cls => {
            const instructor = allUsers.find(user => user.instructor_id === cls.instructor_id);
            const instructorName = instructor ? instructor.firstName : 'N/A';
            const isSelected = cls.class_id === selectedClassId;
            optionsHtml += `
                <div class="class-option">
                    <span>${course.course_name} (${cls.section}) - ${instructorName} (${cls.term})</span>
                    <button data-class-id="${cls.class_id}" ${isSelected ? 'disabled' : ''}>
                        ${isSelected ? 'Selected' : 'Select'}
                    </button>
                </div>
            `;
        });

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
                confirmRegistration(classId);
            });
        });

        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
    }

    function confirmRegistration(classId) {
        const classItem = allClasses.find(c => c.class_id === classId);
        const course = allCourses.find(c => c.course_id === classItem.course_id);

        // Simulate adding a registration (client-side only for Phase 1)
        allRegistrations.push({
            registration_id: allRegistrations.length + 1,
            student_id: studentData.student_id,
            class_id: classId,
            status: 'Pending'
        });

        // Update registered students in the class
        if (!classItem.registered_students) classItem.registered_students = [];
        classItem.registered_students.push(studentData.student_id);

        // Update progress stats
        const taken = studentData.completed_courses ? studentData.completed_courses.length : 0;
        const registered = allRegistrations.filter(reg => 
            reg.student_id === studentData.student_id && reg.status === 'Approved'
        ).length;
        const majorData = allMajors.find(m => m.major === studentData.major);
        const totalCourses = majorData ? parseInt(majorData.totalNumberofCourses) || 0 : 0;
        const remaining = totalCourses - taken - registered;

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

        showMessage('Registration Pending', `You have successfully registered for "${course.course_name} (${classItem.section})". Awaiting administrator approval.`);
        renderCourses(allClasses);
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
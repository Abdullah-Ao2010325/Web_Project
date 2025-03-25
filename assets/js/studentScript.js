document.addEventListener('DOMContentLoaded', () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        console.error('No logged-in user found. Redirecting to login page.');
        window.location.href = '../index.html';
        return;
    }

    let allCourses = [];
    let studentData = null;
    let allUsers = [];

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

    const usersPaths = ['/assets/data/users.json'];
    fetchJSON('users.json', usersPaths)
        .then(users => {
            allUsers = users;
            studentData = users.find(user => user.role === 'Student' && user.username === loggedInUsername);
            if (!studentData) {
                console.error('Student data not found for:', loggedInUsername);
                alert('Student data not found. Redirecting to login.');
                window.location.href = '../index.html';
                return;
            }

            document.getElementById('major').textContent = studentData.major || 'N/A';
            document.getElementById('cgpa').textContent = studentData.GPA || 'N/A';
            document.getElementById('advisor').textContent = studentData.advisor || 'N/A';
            document.getElementById('taken').textContent = studentData.taken || '0';
            document.getElementById('registered').textContent = studentData.registered || '0';
            document.getElementById('student-name').textContent = studentData.firstName || loggedInUsername;

            const majorsPaths = ['/assets/data/majors.json'];
            fetchJSON('majors.json', majorsPaths)
                .then(majors => {
                    const majorData = majors.find(m => m.major === studentData.major);
                    if (majorData) {
                        const totalCourses = parseInt(majorData.totalNumberofCourses) || 0;
                        const taken = parseInt(studentData.taken) || 0;
                        const registered = parseInt(studentData.registered) || 0;
                        const remaining = totalCourses - taken - registered;

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
                })
                .catch(error => console.error('Error fetching majors:', error));

            const coursesPaths = ['/assets/data/courses.json'];
            fetchJSON('courses.json', coursesPaths)
                .then(courses => {
                    allCourses = courses;
                    renderCourses(allCourses);

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

                        const filteredCourses = allCourses.filter(course => {
                            const matchesMajor = !selectedMajor || (Array.isArray(course.major) ? course.major.includes(selectedMajor) : course.major === selectedMajor);
                            const courseTerm = Array.isArray(course.Term) ? course.Term[0] : course.Term;
                            const matchesTerm = !selectedTerm || courseTerm.includes(selectedTerm);
                            const matchesSearch = !searchTerm || course.course_name.toLowerCase().includes(searchTerm);
                            return matchesMajor && matchesTerm && matchesSearch;
                        });

                        renderCourses(filteredCourses);
                    }
                })
                .catch(error => console.error('Error fetching courses:', error));
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            alert('Failed to load data. Please log in again.');
            window.location.href = '../index.html';
        });

    function renderCourses(courses) {
        const courseBoxesContainer = document.querySelector('.course-boxes');
        courseBoxesContainer.innerHTML = '';
        courses.forEach(course => {
            const courseBox = document.createElement('div');
            courseBox.classList.add('course-box');
            const term = Array.isArray(course.Term) ? course.Term[0] : course.Term;
            const instructor = allUsers.find(user => user.username === course.instructors[0].username);
            const instructorName = instructor ? instructor.firstName : 'N/A';
            const isRegistered = studentData.registered_courses.some(rc => rc.offering_id === course.offering_id);
            courseBox.innerHTML = `
                <div class="course-header">
                    <h3 title="${course.course_name}">${course.course_name || 'Unnamed Course'}</h3>
                </div>
                <div class="course-details">
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">class</span>Section:</span>
                        <span class="value">${course.section || 'N/A'}</span>
                    </div>
                    <div class="course-detail-item">
                        <span class="label"><span class="material-symbols-rounded">calendar_today</span>Term:</span>
                        <span class="value">${term || 'N/A'}</span>
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
                    <button class="register-btn" data-offering-id="${course.offering_id}">
                        ${isRegistered ? 'Registered' : 'Register'}
                    </button>
                </div>
            `;
            courseBoxesContainer.appendChild(courseBox);
        });

        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const offeringId = e.target.getAttribute('data-offering-id');
                handleRegistration(offeringId);
            });
        });
    }

    function handleRegistration(offeringId) {
        const course = allCourses.find(c => c.offering_id === offeringId);
        if (!course) {
            showMessage('Error', 'Course not found.');
            return;
        }

        if (!course.open_for_registration) {
            showMessage('Registration Closed', `The course "${course.course_name}" is not open for registration at this time.`);
            return;
        }

        if (course.status !== 'Validated' && course.status !== 'Pending') {
            showMessage('Course Unavailable', `The course "${course.course_name}" is not available for registration (Status: ${course.status}).`);
            return;
        }

        const completedCourses = studentData.completed_courses.map(cc => cc.course_name);
        const prerequisitesMet = course.prerequisites.every(prereq => 
            completedCourses.includes(prereq) && 
            studentData.completed_courses.find(cc => cc.course_name === prereq).grade !== 'F'
        );
        if (!prerequisitesMet) {
            const missingPrereqs = course.prerequisites.filter(prereq => !completedCourses.includes(prereq));
            showMessage('Prerequisites Not Met', `You cannot register for "${course.course_name}" because you haven't completed: ${missingPrereqs.join(', ')}.`);
            return;
        }

        const enrolledCount = course.registered_students ? course.registered_students.length : 0;
        if (enrolledCount >= course.capacity) {
            showMessage('No Seats Available', `The course "${course.course_name}" has reached its capacity of ${course.capacity} students.`);
            return;
        }

        if (studentData.registered_courses.some(rc => rc.offering_id === offeringId)) {
            showMessage('Already Registered', `You are already registered for "${course.course_name}".`);
            return;
        }

        studentData.registered_courses.push({
            course_name: course.course_name,
            offering_id: offeringId,
            grade: null
        });
        studentData.registered = String(parseInt(studentData.registered) + 1);
        document.getElementById('registered').textContent = studentData.registered;

        if (!course.registered_students) course.registered_students = [];
        course.registered_students.push(studentData.username);

        const majorData = fetchJSON('majors.json', ['/assets/data/majors.json'])
            .then(majors => majors.find(m => m.major === studentData.major))
            .then(major => {
                const totalCourses = parseInt(major.totalNumberofCourses) || 0;
                const taken = parseInt(studentData.taken) || 0;
                const registered = parseInt(studentData.registered) || 0;
                const remaining = totalCourses - taken - registered;
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
            });

        showMessage('Registration Pending', `You have successfully registered for "${course.course_name}". Awaiting administrator approval.`);
        renderCourses(allCourses);
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
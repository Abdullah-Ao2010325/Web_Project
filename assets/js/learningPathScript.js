document.addEventListener('DOMContentLoaded', async function() {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        alert('You need to log in first!');
        window.location.href = '../index.html';
        return;
    }

    const users = JSON.parse(localStorage.users);
    const courses = JSON.parse(localStorage.courses);
    const classes = JSON.parse(localStorage.classes);
    const registrations = JSON.parse(localStorage.registrations);

    const studentData = users.find(user => user.role === 'Student' && user.username === loggedInUsername);
    if (!studentData) {
        alert('Student data not found. Please log in again.');
        window.location.href = '../index.html';
        return;
    }

    console.log('Logged-in student data:', studentData);

    renderCourses('All');
    updateProgressSummary();

    const statusFilter = document.getElementById('courseStatus');
    statusFilter.addEventListener('change', function() {
        renderCourses(statusFilter.value);
    });

    const clearFilterBtn = document.getElementById('clear-filter');
    clearFilterBtn.addEventListener('click', function() {
        statusFilter.value = 'All';
        renderCourses('All');
    });

    // function to update the progress summary 
    function updateProgressSummary() {
        const completedCount = studentData.completed_courses
            ? studentData.completed_courses.filter(cc => cc.grade !== 'F').length
            : 0;
        let inProgressCount = 0;
        let pendingCount = 0;

        const studentRegistrations = registrations.filter(reg => reg.student_id === studentData.student_id);
        studentRegistrations.forEach(reg => {
            const classData = classes.find(cls => cls.class_id === reg.class_id);
            const courseData = classData ? courses.find(c => c.course_id === classData.course_id) : null;
            if (classData && courseData) {
                if (classData.status === 'validated' || courseData.status === 'in-progress') {
                    inProgressCount++;
                } else if (classData.status === 'open-for-registration') {
                    pendingCount++;
                }
            }
        });

        document.getElementById('completed-count').textContent = completedCount;
        document.getElementById('in-progress-count').textContent = inProgressCount;
        document.getElementById('pending-count').textContent = pendingCount;
    }

    // function to render courses based on the selected status
    function renderCourses(status) {
        const courseListContainer = document.querySelector('.course-list');
        courseListContainer.innerHTML = '';
    
        let coursesToDisplay = [];
    
        if (status === 'All' || status === 'Completed') {
            if (Array.isArray(studentData.completed_courses)) {
                studentData.completed_courses.forEach(course => {
                    if (course.grade === 'F') return; // Skip courses with grade 'F'
    
                    const classData = classes.find(cls => cls.class_id === course.class_id);
                    const courseData = classData ? courses.find(c => c.course_id === classData.course_id) : null;
                    if (courseData) {
                        coursesToDisplay.push({
                            course_name: courseData.course_name,
                            grade: course.grade,
                            status: 'Completed'
                        });
                    }
                });
            } else {
                console.warn('studentData.completed_courses is not an array:', studentData.completed_courses);
            }
        }
    
        if (status === 'All' || status === 'In Progress' || status === 'Pending') {
            const studentRegistrations = registrations.filter(reg => reg.student_id === studentData.student_id);
            studentRegistrations.forEach(reg => {
                const classData = classes.find(cls => cls.class_id === reg.class_id);
                if (classData && classData.status !== 'closed') { // Exclude closed classes
                    const courseData = courses.find(c => c.course_id === classData.course_id);
                    if (courseData) {
                        // Check if the student has previously failed this course
                        const hasFailed = studentData.completed_courses?.some(
                            cc => parseInt(cc.class_id) === parseInt(reg.class_id) && cc.grade === 'F'
                        );
    
                        // If the student has failed this course previously, skip displaying it
                        if (hasFailed) {
                            return;
                        }
    
                        const instructor = users.find(user => user.instructor_id === classData.instructor_id) || { firstName: 'N/A' };
                        let courseStatus;
    
                        if (classData.status === 'validated' || courseData.status === 'in-progress') {
                            courseStatus = 'In Progress';
                        } else if (classData.status === 'open-for-registration') {
                            courseStatus = 'Pending';
                        } else {
                            return;
                        }
    
                        if (status === 'All' || (status === 'In Progress' && courseStatus === 'In Progress') || (status === 'Pending' && courseStatus === 'Pending')) {
                            coursesToDisplay.push({
                                course_name: courseData.course_name,
                                term: classData.term,
                                section: classData.section,
                                instructor: instructor.firstName,
                                status: courseStatus
                            });
                        }
                    }
                }
            });
        }
    
        if (coursesToDisplay.length === 0) {
            const li = document.createElement('li');
            li.classList.add('no-courses');
            li.textContent = `No courses found for "${status === 'All' ? 'any' : status}" status.`;
            courseListContainer.appendChild(li);
            return;
        }
    
        coursesToDisplay.forEach(course => {
            const li = document.createElement('li');
            li.classList.add('course-item');
    
            let detailsHtml = '';
            if (course.grade) {
                detailsHtml += `<span class="course-detail"><strong>Grade:</strong> ${course.grade}</span>`;
            }
            if (course.term) {
                detailsHtml += `<span class="course-detail"><strong>Term:</strong> ${course.term}</span>`;
            }
            if (course.section) {
                detailsHtml += `<span class="course-detail"><strong>Section:</strong> ${course.section}</span>`;
            }
            if (course.instructor) {
                detailsHtml += `<span class="course-detail"><strong>Instructor:</strong> ${course.instructor}</span>`;
            }
    
            li.innerHTML = `
                <div class="course-item-content">
                    <span class="course-name">${course.course_name}</span>
                    <div class="status-container">
                        <span class="status ${course.status.toLowerCase().replace(' ', '-')}">
                            <span class="material-symbols-rounded status-icon">
                                ${course.status === 'Completed' ? 'check_circle' : course.status === 'In Progress' ? 'pending' : 'schedule'}
                            </span>
                            ${course.status}
                        </span>
                    </div>
                    <span class="material-symbols-rounded toggle-details">expand_more</span>
                </div>
                <div class="course-details">
                    ${detailsHtml}
                </div>
            `;
    
            const toggleButton = li.querySelector('.toggle-details');
            const details = li.querySelector('.course-details');
            toggleButton.addEventListener('click', () => {
                details.classList.toggle('show');
                toggleButton.textContent = details.classList.contains('show') ? 'expand_less' : 'expand_more';
            });
    
            courseListContainer.appendChild(li);
        });
    }
});
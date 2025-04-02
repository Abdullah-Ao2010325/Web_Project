import { loadData } from '../js/dataManager.js';

document.addEventListener('DOMContentLoaded', async function() {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        alert('You need to log in first!');
        window.location.href = '../index.html';
        return;
    }

    let studentData = null;
    let allCourses = [];
    let allUsers = [];
    let allClasses = [];
    let allRegistrations = [];

    try {
        // Load data using dataManager.js
        const data = await loadData();
        allUsers = data.users;
        allCourses = data.courses;
        allClasses = data.classes;
        allRegistrations = data.registrations;

        // Find the logged-in student
        studentData = allUsers.find(user => user.role === 'Student' && user.username === loggedInUsername);

        if (!studentData) {
            alert('Student data not found. Please log in again.');
            window.location.href = '../index.html';
            return;
        }

        // Debug: Log the studentData to inspect its structure
        console.log('Logged-in student data:', studentData);

        // Initial render with "All" filter
        renderCourses('All');
        updateProgressSummary();

        // Filter change event
        const statusFilter = document.getElementById('courseStatus');
        statusFilter.addEventListener('change', function() {
            renderCourses(statusFilter.value);
        });

        // Clear filter event
        const clearFilterBtn = document.getElementById('clear-filter');
        clearFilterBtn.addEventListener('click', function() {
            statusFilter.value = 'All';
            renderCourses('All');
        });
    } catch (error) {
        console.error('Detailed error in loading data:', error);
        alert(`Failed to load data: ${error.message}. Please check the console for more details and try again.`);
        window.location.href = '../index.html';
    }

    function updateProgressSummary() {
        // Completed courses count
        const completedCount = studentData.completed_courses ? studentData.completed_courses.length : 0;

        // Calculate in-progress and pending based on registrations
        let inProgressCount = 0;
        let pendingCount = 0;

        // Find all registrations for the student
        const studentRegistrations = allRegistrations.filter(reg => reg.student_id === studentData.student_id);

        studentRegistrations.forEach(reg => {
            const classData = allClasses.find(cls => cls.class_id === reg.class_id);
            if (classData) {
                if (reg.status === 'Approved') {
                    inProgressCount++; // Count Approved as In Progress
                } else if (reg.status === 'Pending') {
                    pendingCount++; // Count Pending as Pending
                }
            }
        });

        // Update the DOM
        document.getElementById('completed-count').textContent = completedCount;
        document.getElementById('in-progress-count').textContent = inProgressCount;
        document.getElementById('pending-count').textContent = pendingCount;
    }

    function renderCourses(status) {
        const courseListContainer = document.querySelector('.course-list');
        courseListContainer.innerHTML = '';

        let coursesToDisplay = [];

        // Completed Courses
        if (status === 'All' || status === 'Completed') {
            if (Array.isArray(studentData.completed_courses)) {
                studentData.completed_courses.forEach(course => {
                    const classData = allClasses.find(cls => cls.class_id === course.class_id);
                    const courseData = classData ? allCourses.find(c => c.course_id === classData.course_id) : null;
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

        // In Progress and Pending Courses
        if (status === 'All' || status === 'In Progress' || status === 'Pending') {
            const studentRegistrations = allRegistrations.filter(reg => reg.student_id === studentData.student_id);
            studentRegistrations.forEach(reg => {
                const classData = allClasses.find(cls => cls.class_id === reg.class_id);
                if (classData) {
                    const courseData = allCourses.find(c => c.course_id === classData.course_id);
                    if (courseData) {
                        const instructor = allUsers.find(user => user.instructor_id === classData.instructor_id) || { firstName: 'N/A' };
                        let courseStatus;
                        if (reg.status === 'Approved') {
                            courseStatus = 'In Progress'; // Treat Approved as In Progress
                        } else if (reg.status === 'Pending') {
                            courseStatus = 'Pending';
                        } else if (reg.status === 'Approved' && classData.status === 'Validated') {
                            courseStatus = 'Pending'; // Treat validated as pending until it starts
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

        // Display message if no courses are found
        if (coursesToDisplay.length === 0) {
            const li = document.createElement('li');
            li.classList.add('no-courses');
            li.textContent = `No courses found for "${status === 'All' ? 'any' : status}" status.`;
            courseListContainer.appendChild(li);
            return;
        }

        // Render courses
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

            // Add toggle functionality for course details
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
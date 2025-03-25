document.addEventListener('DOMContentLoaded', () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        console.error('No logged-in user found. Redirecting to login page.');
        window.location.href = '../index.html';
        return;
    }

    let studentData = null;
    let allCourses = [];
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

    // Fetch all necessary data
    Promise.all([
        fetchJSON('users.json', ['/assets/data/users.json']),
        fetchJSON('courses.json', ['/assets/data/courses.json'])
    ])
        .then(([users, courses]) => {
            allUsers = users;
            allCourses = courses;
            studentData = users.find(user => user.role === 'Student' && user.username === loggedInUsername);

            if (!studentData) {
                console.error('Student data not found for:', loggedInUsername);
                alert('Student data not found. Redirecting to login.');
                window.location.href = '../index.html';
                return;
            }

            // Initial render with "Completed" courses
            renderCourses('Completed');

            // Filter event listener
            const statusFilter = document.getElementById('courseStatus');
            statusFilter.addEventListener('change', (e) => {
                renderCourses(e.target.value);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to load learning path data. Please log in again.');
            window.location.href = '../index.html';
        });

    function renderCourses(status) {
        const courseCardsContainer = document.querySelector('.course-cards');
        courseCardsContainer.innerHTML = '';

        let coursesToDisplay = [];
        if (status === 'Completed') {
            coursesToDisplay = studentData.completed_courses.map(course => ({
                course_name: course.course_name,
                grade: course.grade,
                status: 'Completed'
            }));
        } else if (status === 'In Progress') {
            coursesToDisplay = studentData.registered_courses
                .map(rc => {
                    const course = allCourses.find(c => c.offering_id === rc.offering_id);
                    return course && course.status === 'In Progress' ? {
                        course_name: course.course_name,
                        term: Array.isArray(course.Term) ? course.Term[0] : course.Term,
                        section: course.section,
                        instructor: allUsers.find(u => u.username === course.instructors[0].username)?.firstName || 'N/A',
                        status: 'In Progress'
                    } : null;
                })
                .filter(course => course !== null);
        } else if (status === 'Pending') {
            coursesToDisplay = studentData.registered_courses
                .map(rc => {
                    const course = allCourses.find(c => c.offering_id === rc.offering_id);
                    return course && (course.status === 'Pending' || course.status === 'Validated') ? {
                        course_name: course.course_name,
                        term: Array.isArray(course.Term) ? course.Term[0] : course.Term,
                        section: course.section,
                        instructor: allUsers.find(u => u.username === course.instructors[0].username)?.firstName || 'N/A',
                        status: course.status
                    } : null;
                })
                .filter(course => course !== null);
        }

        if (coursesToDisplay.length === 0) {
            courseCardsContainer.innerHTML = `<p>No courses found for "${status}" status.</p>`;
            return;
        }

        coursesToDisplay.forEach(course => {
            const card = document.createElement('div');
            card.classList.add('learning-card');
            card.innerHTML = `
                <div class="card-header">
                    <h3>${course.course_name}</h3>
                    <span class="status ${course.status.toLowerCase().replace(' ', '-')}">${course.status}</span>
                </div>
                <div class="card-details">
                    ${course.grade ? `<p><strong>Grade:</strong> ${course.grade}</p>` : ''}
                    ${course.term ? `<p><strong>Term:</strong> ${course.term}</p>` : ''}
                    ${course.section ? `<p><strong>Section:</strong> ${course.section}</p>` : ''}
                    ${course.instructor ? `<p><strong>Instructor:</strong> ${course.instructor}</p>` : ''}
                </div>
            `;
            courseCardsContainer.appendChild(card);
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#') {
                // Handle logout
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('loggedInUsername');
                    localStorage.removeItem('loggedInPassword');
                    window.location.href = '../index.html';
                }
            } else if (href) {
                window.location.href = `side_student/studentDashboard.html` || window.location.href;
            }
        });
    });

    const loggedInUsername = localStorage.getItem('loggedInUsername');

    fetch('../assets/data/users.json')
        .then(response => response.json())
        .then(users => {
            const student = users.find(user => user.role === 'Student' && user.username === loggedInUsername);
            if (student) {
                document.getElementById('major').textContent = student.major || 'N/A';
                document.getElementById('copa').textContent = student.GPA || 'N/A';
                document.getElementById('advisor').textContent = 'N/A'; 
                document.getElementById('taken').textContent = student.completed_courses ? student.completed_courses.length : 0;

                document.getElementById('registered').textContent = student.registered_courses ? student.registered_courses.length : 0;

                
                const totalCourses = 30; 
                const taken = student.completed_courses ? student.completed_courses.length : 0;
                const registered = student.registered_courses ? student.registered_courses.length : 0;
                const remaining = totalCourses - (taken + registered);
                document.getElementById('remaining').textContent = remaining >= 0 ? remaining : 0;

                document.getElementById('student-name').textContent = student.firstName || loggedInUsername;

                fetch('../assets/data/courses.json')
                    .then(response => response.json())
                    .then(courses => {
                        const courseBoxesContainer = document.querySelector('.course-boxes');
                        courseBoxesContainer.innerHTML = '';

                        const studentMajor = student.major;
                        const filteredCourses = courses.filter(course => {
                            if (Array.isArray(course.major)) {
                                return course.major.includes(studentMajor);
                            }
                            return course.major === studentMajor;
                        });

                        filteredCourses.forEach(course => {
                            const courseBox = document.createElement('div');
                            courseBox.classList.add('course-box');
                            const term = Array.isArray(course.Term) ? course.Term[0] : course.Term;
                            const instructorName = course.instructors && course.instructors[0] 
                                ? (course.instructors[0].firstName || course.instructors[0].name || 'N/A') 
                                : 'N/A';
                            courseBox.innerHTML = `
                                <div class="course-header">
                                    <h3>${course.course_name || 'Unnamed Course'}</h3>
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
                                </div>
                            `;
                            courseBoxesContainer.appendChild(courseBox);
                        });
                    })
                    .catch(error => console.error('Error fetching courses data:', error));
            } else {
                console.error('Student data not found for:', loggedInUsername);
            }
        })
        .catch(error => console.error('Error fetching users data:', error));
});
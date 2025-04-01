document.addEventListener('DOMContentLoaded', function() {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        alert('You need to log in first!');
        window.location.href = '../index.html';
        return;
    }

    let studentData = null;
    let allCourses = [];
    let allUsers = [];

    fetch('/assets/data/users.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(users) {
            allUsers = users;
            for (let i = 0; i < users.length; i++) {
                if (users[i].role === 'Student' && users[i].username === loggedInUsername) {
                    studentData = users[i];
                    break;
                }
            }

            if (!studentData) {
                alert('Student data not found. Please log in again.');
                window.location.href = '../index.html';
                return;
            }

            fetch('/assets/data/courses.json')
                .then(function(response) {
                    return response.json();
                })
                .then(function(courses) {
                    allCourses = courses;
                    renderCourses('Completed');

                    const statusFilter = document.getElementById('courseStatus');
                    statusFilter.addEventListener('change', function() {
                        renderCourses(statusFilter.value);
                    });
                })
                .catch(function(error) {
                    console.log('Error fetching courses:', error);
                    alert('Failed to load courses. Please try again.');
                    window.location.href = '../index.html';
                });
        })
        .catch(function(error) {
            console.log('Error fetching users:', error);
            alert('Failed to load user data. Please log in again.');
            window.location.href = '../index.html';
        });

    function renderCourses(status) {
        const courseListContainer = document.querySelector('.course-list');
        courseListContainer.innerHTML = '';

        let coursesToDisplay = [];
        if (status === 'Completed') {
            for (let i = 0; i < studentData.completed_courses.length; i++) {
                let course = studentData.completed_courses[i];
                coursesToDisplay.push({
                    course_name: course.course_name,
                    grade: course.grade,
                    status: 'Completed'
                });
            }
        } else if (status === 'In Progress') {
            for (let i = 0; i < studentData.registered_courses.length; i++) {
                let registeredCourse = studentData.registered_courses[i];
                for (let j = 0; j < allCourses.length; j++) {
                    if (allCourses[j].offering_id === registeredCourse.offering_id && allCourses[j].status === 'In Progress') {
                        let instructorName = 'N/A';
                        for (let k = 0; k < allUsers.length; k++) {
                            if (allUsers[k].username === allCourses[j].instructors[0].username) {
                                instructorName = allUsers[k].firstName;
                                break;
                            }
                        }
                        coursesToDisplay.push({
                            course_name: allCourses[j].course_name,
                            term: Array.isArray(allCourses[j].Term) ? allCourses[j].Term[0] : allCourses[j].Term,
                            section: allCourses[j].section,
                            instructor: instructorName,
                            status: 'In Progress'
                        });
                    }
                }
            }
        } else if (status === 'Pending') {
            for (let i = 0; i < studentData.registered_courses.length; i++) {
                let registeredCourse = studentData.registered_courses[i];
                for (let j = 0; j < allCourses.length; j++) {
                    if (allCourses[j].offering_id === registeredCourse.offering_id && (allCourses[j].status === 'Pending' || allCourses[j].status === 'Validated')) {
                        let instructorName = 'N/A';
                        for (let k = 0; k < allUsers.length; k++) {
                            if (allUsers[k].username === allCourses[j].instructors[0].username) {
                                instructorName = allUsers[k].firstName;
                                break;
                            }
                        }
                        coursesToDisplay.push({
                            course_name: allCourses[j].course_name,
                            term: Array.isArray(allCourses[j].Term) ? allCourses[j].Term[0] : allCourses[j].Term,
                            section: allCourses[j].section,
                            instructor: instructorName,
                            status: allCourses[j].status
                        });
                    }
                }
            }
        }

        if (coursesToDisplay.length === 0) {
            const li = document.createElement('li');
            li.classList.add('no-courses');
            li.textContent = 'No courses found for "' + status + '" status.';
            courseListContainer.appendChild(li);
            return;
        }

        for (let i = 0; i < coursesToDisplay.length; i++) {
            const course = coursesToDisplay[i];
            const li = document.createElement('li');
            li.classList.add('course-item');
            let detailsHtml = '';
            if(course.grade) {
                detailsHtml += '<span class="course-detail"><strong>Grade:</strong> ' + course.grade + '</span>';
            }
            if(course.term) {   
                detailsHtml += '<span class="course-detail"><strong>Term:</strong> ' + course.term + '</span>';
            }
            if(course.section) {
                detailsHtml += '<span class="course-detail"><strong>Section:</strong> ' + course.section + '</span>';
            }
            if(course.instructor) {
                detailsHtml += '<span class="course-detail"><strong>Instructor:</strong> ' + course.instructor + '</span>';
            }

            li.innerHTML = `
                <div class="course-item-content">
                    <span class="course-name">${course.course_name}</span>
                    <span class="status ${course.status.toLowerCase().replace(' ', '-')}">${course.status}</span>
                </div>
                <div class="course-details">
                    ${detailsHtml}
                </div>
            `;
            courseListContainer.appendChild(li);
        }
    }
});
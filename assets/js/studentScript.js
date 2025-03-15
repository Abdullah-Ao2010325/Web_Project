document.addEventListener('DOMContentLoaded', () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        console.error('No logged-in user found. Redirecting to login page.');
        window.location.href = '../index.html';
        return;
    }

    let allCourses = []; 

    function fetchJSON(fileName, paths) {
        return new Promise((resolve, reject) => {
            let errorMessage = `Failed to fetch ${fileName}: `;
            const tryPaths = async () => {
                for (const path of paths) {
                    try {
                        const response = await fetch(path);
                        if (response.ok) {
                            const data = await response.json();
                            console.log(`Successfully fetched ${fileName} from ${path}`);
                            resolve(data);
                            return;
                        }
                    } catch (e) {
                        errorMessage += `${path} (Error: ${e.message}), `;
                    }
                }
                reject(new Error(errorMessage.slice(0, -2)));
            };
            tryPaths();
        });
    }

    const usersPaths = ['/assets/data/users.json'];
    fetchJSON('users.json', usersPaths)
        .then(users => {
            const student = users.find(user => user.role === 'Student' && user.username === loggedInUsername);
            if (student) {
                document.getElementById('major').textContent = student.major || 'N/A';
                document.getElementById('copa').textContent = student.GPA || 'N/A';
                document.getElementById('advisor').textContent = student.advisor || 'N/A';

                document.getElementById('taken').textContent = student.taken || 0;
                document.getElementById('registered').textContent = student.registered || 0;

                const majorsPaths = ['/assets/data/majors.json'];
                fetchJSON('major.json', majorsPaths)
                    .then(majors => {
                        const majorData = majors.find(m => m.major === student.major);
                        if (majorData) {
                            const totalCourses = parseInt(majorData.totalNumberofCourses) || 0;
                            const taken = parseInt(student.taken) || 0;
                            const registered = parseInt(student.registered) || 0;
                            const remaining = totalCourses - taken - registered;

                            document.getElementById('remaining').textContent = remaining >= 0 ? remaining : 0;

                            const totalProgress = taken + registered + remaining;
                            if (totalProgress > 0) {
                                const takenPercent = (taken / totalProgress) * 100;
                                const registeredPercent = (registered / totalProgress) * 100;
                                const remainingPercent = (remaining / totalProgress) * 100;

                                document.querySelector('.progress-bar-taken').style.width = `${takenPercent}%`;
                                document.querySelector('.progress-bar-registered').style.width = `${registeredPercent}%`;
                                document.querySelector('.progress-bar-remaining').style.width = `${remainingPercent}%`;
                            }
                        } else {
                            console.error('Major data not found for:', student.major);
                            document.getElementById('remaining').textContent = 'N/A';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching major data:', error.message);
                        document.getElementById('remaining').textContent = 'N/A';
                        alert('Failed to load major data. Check console for details.');
                    });

                document.getElementById('student-name').textContent = student.firstName || loggedInUsername;

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
                                const matchesMajor = selectedMajor === ''
                                    ? true
                                    : (Array.isArray(course.major) ? course.major.includes(selectedMajor) : course.major === selectedMajor);
                                const matchesTerm = selectedTerm === ''
                                    ? true
                                    : (Array.isArray(course.Term) ? course.Term.includes(selectedTerm) : course.Term === selectedTerm);
                                const matchesSearch = searchTerm === ''
                                    ? true
                                    : course.course_name.toLowerCase().includes(searchTerm);
                                return matchesMajor && matchesTerm && matchesSearch;
                            });

                            renderCourses(filteredCourses);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching courses data:', error.message);
                        alert('Failed to load courses. Check console for details.');
                    });
            } else {
                console.error('Student data not found for:', loggedInUsername);
                alert('Student data not found. Please log in again.');
            }
        })
        .catch(error => {
            console.error('Error fetching users data:', error.message);
            alert('Failed to load user data. Check console for details.');
        });

    function renderCourses(courses) {
        const courseBoxesContainer = document.querySelector('.course-boxes');
        courseBoxesContainer.innerHTML = '';

        courses.forEach(course => {
            const courseBox = document.createElement('div');
            courseBox.classList.add('course-box');
            const term = Array.isArray(course.Term) ? course.Term[0] : course.Term;
            const instructorName = course.instructors && course.instructors[0]
                ? (course.instructors[0].firstName || course.instructors[0].name || 'N/A')
                : 'N/A';
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
                </div>
            `;
            courseBoxesContainer.appendChild(courseBox);
        });
    }
});
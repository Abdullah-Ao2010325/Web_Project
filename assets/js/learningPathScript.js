// document.addEventListener('DOMContentLoaded', () => {
//     const loggedInUsername = localStorage.getItem('loggedInUsername');
//     if (!loggedInUsername) {
//         console.error('No logged-in user found. Redirecting to login page.');
//         window.location.href = '../index.html';
//         return;
//     }

//     let allCourses = [];

//     async function fetchJSON(fileName, paths) {
//         for (const path of paths) {
//             try {
//                 const response = await fetch(path);
//                 if (!response.ok) throw new Error(`Failed to fetch ${fileName} from ${path}`);
//                 const data = await response.json();
//                 console.log(`Successfully fetched ${fileName} from ${path}`);
//                 return data;
//             } catch (e) {
//                 console.warn(`Attempt failed for ${path}: ${e.message}`);
//             }
//         }
//         throw new Error(`All paths failed for ${fileName}`);
//     }

//     const usersPaths = ['/assets/data/users.json'];
//     fetchJSON('users.json', usersPaths)
//         .then(users => {
//             const student = users.find(user => user.role === 'Student' && user.username === loggedInUsername);
//             if (!student) {
//                 console.error('Student data not found for:', loggedInUsername);
//                 alert('Student data not found. Redirecting to login.');
//                 window.location.href = '../index.html';
//                 return;
//             }

//             const completedCourses = student.completed_courses || [];
//             const registeredCourses = student.registered_courses || [];

//             const coursesPaths = ['/assets/data/courses.json'];
//             fetchJSON('courses.json', coursesPaths)
//                 .then(courses => {
//                     allCourses = courses;

//                     // Populate Completed Courses
//                     const completedContainer = document.getElementById('completed-courses');
//                     completedCourses.forEach(course => {
//                         const courseBox = document.createElement('div');
//                         courseBox.classList.add('learning-path-course');
//                         courseBox.innerHTML = `
//                             <h4>${course.course_name}</h4>
//                             <p>Grade: <span class="grade">${course.grade}</span></p>
//                         `;
//                         completedContainer.appendChild(courseBox);
//                     });

//                     // Populate In-Progress Courses
//                     const inProgressContainer = document.getElementById('in-progress-courses');
//                     registeredCourses.forEach(course => {
//                         const courseBox = document.createElement('div');
//                         courseBox.classList.add('learning-path-course');
//                         courseBox.innerHTML = `
//                             <h4>${course.course_name}</h4>
//                             <p>Section: ${course.section || 'N/A'}</p>
//                             <p class="status">Status: In Progress</p>
//                         `;
//                         inProgressContainer.appendChild(courseBox);
//                     });

//                     // Populate Pending Courses
//                     const pendingContainer = document.getElementById('pending-courses');
//                     const studentMajor = student.major;
//                     const completedCourseNames = completedCourses.map(c => c.course_name);
//                     const registeredCourseNames = registeredCourses.map(c => c.course_name);

//                     const pendingCourses = allCourses.filter(course => {
//                         const matchesMajor = Array.isArray(course.major)
//                             ? course.major.includes(studentMajor)
//                             : course.major === studentMajor;
//                         const isOpen = course.open_for_registration;
//                         const notTakenOrRegistered = !completedCourseNames.includes(course.course_name) &&
//                             !registeredCourseNames.includes(course.course_name);
//                         return matchesMajor && isOpen && notTakenOrRegistered;
//                     });

//                     pendingCourses.forEach(course => {
//                         const term = Array.isArray(course.Term) ? course.Term[0] : course.Term;
//                         const courseBox = document.createElement('div');
//                         courseBox.classList.add('learning-path-course');
//                         courseBox.innerHTML = `
//                             <h4>${course.course_name}</h4>
//                             <p>Term: ${term || 'N/A'}</p>
//                             <p class="status">Status: Registration Open</p>
//                         `;
//                         pendingContainer.appendChild(courseBox);
//                     });
//                 })
//                 .catch(error => console.error('Error fetching courses:', error));
//         })
//         .catch(error => {
//             console.error('Error fetching users:', error);
//             alert('Failed to load data. Please log in again.');
//             window.location.href = '../index.html';
//         });
// });
document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    if (!loggedInUsername) {
        window.location.href = '../index.html';
        return;
    }

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

    let instructorData = null;
    let assignedClasses = [];
    let courses = [];

    try {
        const users = await fetchJSON('users.json', ['../../assets/data/users.json']);
        instructorData = users.find(user => user.role === 'Instructor' && user.username === loggedInUsername);

        if (!instructorData) {
            alert('Instructor data not found.');
            window.location.href = '../index.html';
            return;
        }

        const classes = await fetchJSON('classes.json', ['../../assets/data/classes.json']);
        assignedClasses = classes.filter(c => c.instructor_id === instructorData.instructor_id);

        courses = await fetchJSON('courses.json', ['../../assets/data/courses.json']);

        const classMap = {};
        assignedClasses.forEach(cls => {
            const course = courses.find(course => course.course_id === cls.course_id);
            const courseName = course ? course.course_name : 'Unknown Course';
            if (!classMap[courseName]) {
                classMap[courseName] = [];
            }
            classMap[courseName].push(cls.section);
        });

        const container = document.getElementById('Classes_Cards');
        container.innerHTML = '';

        for (const courseName in classMap) {
            const card = document.createElement('section');
            card.id = 'CCard';

            const title = document.createElement('h3');
            title.textContent = courseName;
            card.appendChild(title);

            const sectionDiv = document.createElement('div');
            sectionDiv.id = 'Sections';

            classMap[courseName].forEach(sectionName => {
                const sectionLink = document.createElement('a');
                sectionLink.id = 'Section';
                sectionLink.href = '';
                sectionLink.textContent = sectionName;
                sectionDiv.appendChild(sectionLink);
            });

            card.appendChild(sectionDiv);
            container.appendChild(card);
        }

        window.assignedClasses = assignedClasses;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data.');
        window.location.href = '../index.html';
    }
});

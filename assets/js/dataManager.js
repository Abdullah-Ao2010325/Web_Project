const endpoints = {
    users: '/assets/data/users.json',
    courses: '/assets/data/courses.json',
    classes: '/assets/data/classes.json',
    registrations: '/assets/data/registrations.json',
    majors: '/assets/data/majors.json'
};

async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error(`Error fetching ${endpoint}: ${e.message}`);
        throw e;
    }
}

async function loadData() {
    const data = {
        users: [],
        courses: [],
        classes: [],
        registrations: [],
        majors: []
    };

    try {
        const savedUsers = localStorage.getItem('users');
        data.users = savedUsers ? JSON.parse(savedUsers) : await fetchData(endpoints.users);
        localStorage.setItem('users', JSON.stringify(data.users));

        const savedCourses = localStorage.getItem('courses');
        data.courses = savedCourses ? JSON.parse(savedCourses) : await fetchData(endpoints.courses);
        localStorage.setItem('courses', JSON.stringify(data.courses));

        const savedClasses = localStorage.getItem('classes');
        data.classes = savedClasses ? JSON.parse(savedClasses) : await fetchData(endpoints.classes);
        localStorage.setItem('classes', JSON.stringify(data.classes));

        const savedRegistrations = localStorage.getItem('registrations');
        data.registrations = savedRegistrations ? JSON.parse(savedRegistrations) : await fetchData(endpoints.registrations);
        localStorage.setItem('registrations', JSON.stringify(data.registrations));

        const savedMajors = localStorage.getItem('majors');
        data.majors = savedMajors ? JSON.parse(savedMajors) : await fetchData(endpoints.majors);
        localStorage.setItem('majors', JSON.stringify(data.majors));

        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

function saveData(data) {
    localStorage.setItem('users', JSON.stringify(data.users));
    localStorage.setItem('courses', JSON.stringify(data.courses));
    localStorage.setItem('classes', JSON.stringify(data.classes));
    localStorage.setItem('registrations', JSON.stringify(data.registrations));
    localStorage.setItem('majors', JSON.stringify(data.majors));
}

export { loadData, saveData };
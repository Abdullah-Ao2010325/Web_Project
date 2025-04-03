// API endpoints (relative paths to JSON files)
const endpoints = {
    users: '/assets/data/users.json',
    courses: '/assets/data/courses.json',
    classes: '/assets/data/classes.json',
    registrations: '/assets/data/registrations.json',
    majors: '/assets/data/majors.json'
};

// Fetch data from a given endpoint
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

// Load data by always fetching from JSON files and updating localStorage
async function loadData() {
    const data = {
        users: [],
        courses: [],
        classes: [],
        registrations: [],
        majors: []
    };

    try {
        // Always fetch fresh data from JSON files
        data.users = await fetchData(endpoints.users);
        data.courses = await fetchData(endpoints.courses);
        data.classes = await fetchData(endpoints.classes);
        data.registrations = await fetchData(endpoints.registrations);
        data.majors = await fetchData(endpoints.majors);

        // Save fetched data to localStorage
        saveData(data);
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Save all data to Local Storage
function saveData(data) {
    localStorage.setItem('users', JSON.stringify(data.users));
    localStorage.setItem('courses', JSON.stringify(data.courses));
    localStorage.setItem('classes', JSON.stringify(data.classes));
    localStorage.setItem('registrations', JSON.stringify(data.registrations));
    localStorage.setItem('majors', JSON.stringify(data.majors));
}

export { loadData, saveData };
async function retrieveJSONData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const jsonData = await response.json();
    return JSON.stringify(jsonData);
}

async function loadLocalStorages() {
    try {

        if (!localStorage.users) {
            localStorage.users = await retrieveJSONData('../assets/data/users.json');
        }
        if (!localStorage.courses) {
            localStorage.courses = await retrieveJSONData('../assets/data/courses.json');
        }
        if (!localStorage.classes) {
            localStorage.classes = await retrieveJSONData('../assets/data/classes.json');
        }
        if (!localStorage.majors) {
            localStorage.majors = await retrieveJSONData('../assets/data/majors.json');
        }
        if (!localStorage.registrations) {
            localStorage.registrations = await retrieveJSONData('../assets/data/registrations.json');
        }
    } catch (error) {
        console.error('Error initializing localStorage:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.querySelector('.form-container form');
    const showPopupBtn = document.querySelector('.login-btn');
    const formPopup = document.querySelector('.form-interface');
    const hidePopupBtn = formPopup.querySelector('.close-btn');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navLinks = document.querySelector('.links');
    const closeNavBtn = navLinks.querySelector('.close-btn');
    const contactForm = document.querySelector('.contact-form');

    if (!loginForm) return;

    // Show login popup
    showPopupBtn.addEventListener('click', () => {
        document.body.classList.toggle('show-popup');
    });

    // Hide login popup
    hidePopupBtn.addEventListener('click', () => {
        document.body.classList.remove('show-popup');
    });

    // Toggle mobile menu
    hamburgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show-menu');
    });

    closeNavBtn.addEventListener('click', () => {
        navLinks.classList.remove('show-menu');
    });

    // Handle navigation link clicks (smooth scroll)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    navLinks.classList.remove('show-menu'); // Close mobile menu
                }
            }
        });
    });

    // Initialize localStorage with data
    try {
        await loadLocalStorages();
    } catch (error) {
        console.error('Failed to load data:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.style.marginTop = '10px';
        errorMessage.style.fontSize = '0.9rem';
        errorMessage.textContent = 'Error loading data. Please try again later.';
        loginForm.appendChild(errorMessage);
        return;
    }

    // Login form submission
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.querySelector('.form-container input[type="text"]').value;
        const password = document.querySelector('.form-container input[type="password"]').value;

        const existingError = loginForm.querySelector('.error-message');
        if (existingError) existingError.remove();

        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.style.marginTop = '10px';
        errorMessage.style.fontSize = '0.9rem';

        try {
            // Access data directly from localStorage
            const users = JSON.parse(localStorage.users);

            const user = users.find(
                user => user.username === username && user.password === password
            );

            if (user) {
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                // Store username separately for consistency with other scripts
                localStorage.setItem('loggedInUsername', user.username);

                if (user.role === 'Student') {
                    window.location.href = 'side_student/studentDashboard.html';
                } else if (user.role === 'Instructor') {
                    window.location.href = 'side_Instructor/instructorDashboard.html';
                } else if (user.role === 'Admin') {
                    window.location.href = 'side_admin/admin.html';
                }
            } else {
                errorMessage.textContent = 'Email or password is incorrect';
                loginForm.appendChild(errorMessage);
            }
        } catch (error) {
            errorMessage.textContent = 'Error logging in. Please try again.';
            loginForm.appendChild(errorMessage);
            console.error('Login error:', error);
        }
    });

    // Contact form submission (simple feedback)
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;

            if (name && email && message) {
                alert('Thank you for your message! We’ll get back to you soon.');
                contactForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
});
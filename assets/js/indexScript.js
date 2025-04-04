document.addEventListener('DOMContentLoaded', () => {
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

    // Login form submission
    loginForm.addEventListener('submit', async (event) => {
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
            const response = await fetch('../assets/data/users.json');
            const users = await response.json();

            const user = users.find(
                user => user.username === username && user.password === password
            );

            if (user) {
                localStorage.setItem('loggedInUsername', username);
                localStorage.setItem('loggedInPassword', password);

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
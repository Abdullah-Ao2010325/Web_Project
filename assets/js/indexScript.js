document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.form-container form');
    const showPopupBtn = document.querySelector('.login-btn');
    const formPopup = document.querySelector('.form-interface');
    const hidePopupBtn = formPopup.querySelector('.close-btn');

    if (!loginForm) {
        console.error("Login form not found in the DOM.");
        return;
    }

    showPopupBtn.addEventListener('click', () => {
        document.body.classList.toggle('show-popup');
    });

    hidePopupBtn.addEventListener('click', () => {
        document.body.classList.remove('show-popup');
    });

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
            console.log("users.json fetched successfully:", users);

            const user = users.find(
                user => user.username === username && user.password === password
            );

            if (user) {
                console.log("Login successful for user:", user.username);
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
                console.log("Login failed: No matching user found.");
                errorMessage.textContent = 'Email or password is incorrect';
                loginForm.appendChild(errorMessage);
            }
        } catch (error) {
            console.error("Error during login process:", error.message);
            errorMessage.textContent = 'Email or password is incorrect';
            loginForm.appendChild(errorMessage);
        }
    });
});
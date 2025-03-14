// Navbar and popup functionality
const navbarMenu = document.querySelector(".navbar .links");
const hamburgerBtn = document.querySelector(".hamburger-btn");
const hideMenuBtn = navbarMenu.querySelector(".close-btn");
const showPopupBtn = document.querySelector(".login-btn");
const formPopup = document.querySelector(".form-interface"); 
const hidePopupBtn = formPopup.querySelector(".close-btn");

hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.toggle("show-menu");
});

hideMenuBtn.addEventListener("click", () =>  hamburgerBtn.click());

showPopupBtn.addEventListener("click", () => {
    document.body.classList.toggle("show-popup");
});

hidePopupBtn.addEventListener("click", () => showPopupBtn.click());

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.form-container form');

    if (!loginForm) {
        console.error("Login form not found.");
        return;
    }

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        
        const username = document.querySelector('.form-container input[type="text"]').value;
        const password = document.querySelector('.form-container input[type="password"]').value;
        const errorMessage = document.createElement('div');
        errorMessage.style.color = 'red';
        errorMessage.style.marginTop = '10px';

        
        fetch('../assets/data/users.json')
            .then(response => response.json())
            .then(users => {
                
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
                        window.location.href = 'side_admin/adminDashboard.html';
                    }
                } else {
                    
                    errorMessage.textContent = 'Invalid username or password. Please try again.';
                    loginForm.appendChild(errorMessage);
                }
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
            });
    });
});
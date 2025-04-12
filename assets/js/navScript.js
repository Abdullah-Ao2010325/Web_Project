document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');

            switch (href) {
                case 'studentDashboard':
                    window.location.href = 'studentDashboard.html';
                    break;
                case 'LearningPath':
                    window.location.href = 'LearningPath.html';
                    break;
                case '#':
                    showLogoutConfirmation();
                    break;
                default:
                    console.log('Unknown navigation link:', href);
            }
        });
    });
    // logout popup message in the student dashbord page
    function showLogoutConfirmation() {
        let logoutBox = document.querySelector('.logout-confirmation');
        if (logoutBox) {
            logoutBox.style.display = 'block';
            return;
        }

        logoutBox = document.createElement('div');
        logoutBox.className = 'logout-confirmation';
        logoutBox.innerHTML = `
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out of your Qatar University account?</p>
            <div class="logout-buttons">
                <button class="logout-btn confirm-btn">Yes</button>
                <button class="logout-btn cancel-btn">Cancel</button>
            </div>
        `;

        const container = document.querySelector('.container');
        container.appendChild(logoutBox);

        const confirmBtn = logoutBox.querySelector('.confirm-btn');
        const cancelBtn = logoutBox.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUsername');
            localStorage.removeItem('loggedInUser'); 
            window.location.href = '../index.html';
        });

        cancelBtn.addEventListener('click', () => {
            logoutBox.style.display = 'none';
        });
    }
});
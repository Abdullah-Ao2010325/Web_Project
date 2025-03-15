document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 

            switch (href) {
                case 'index.html':
                    window.location.href = 'index.html';
                    break;

                case 'courseRegistration.html':
                    window.location.href = 'courseRegistration.html';
                    break;

                case 'LearningPath.html':
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

    function showLogoutConfirmation() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal-content';

        modal.innerHTML = `
            <h2>Confirm Logout</h2> <!-- Fixed typo from "Confirmlogout" to "Confirm Logout" -->
            <p>Are you sure you want to log out of your Qatar University account?</p>
            <div class="modal-buttons">
                <button class="modal-btn confirm-btn">Yes, Log Out</button>
                <button class="modal-btn cancel-btn">Cancel</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const confirmBtn = modal.querySelector('.confirm-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUsername');
            localStorage.removeItem('loggedInPassword');
            window.location.href = '../index.html'; 
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
        });

        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
        });
    }
});
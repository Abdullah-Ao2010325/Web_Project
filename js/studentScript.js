// Get DOM elements
const loginForm = document.querySelector('.login-form-box form');
const emailInput = loginForm.querySelector('input[type="text"]');
const passwordInput = loginForm.querySelector('input[type="password"]');

// Function to validate input
function validateInput(email, password) {
    if (!email || !password) {
        throw new Error('Please fill in all fields');
    }
    if (email.length < 3 || password.length < 6) {
        throw new Error('Invalid input length');
    }
}

// Function to handle login
async function handleLogin(e) {
    e.preventDefault();
    
    try {
        // Validate input first
        validateInput(emailInput.value, passwordInput.value);
        
        const response = await fetch('data/students.json');
        if (!response.ok) {
            throw new Error('Network response failed');
        }
        
        const data = await response.json();
        
        // Use trim() to remove whitespace
        const student = data.students.find(student => 
            student.username === emailInput.value.trim() && 
            student.password === passwordInput.value.trim()
        );
        
        if (student) {
            // Remove sensitive data before storing
            const safeStudentData = {
                username: student.username,
                name: student.name,
                id: student.id
                // Add other non-sensitive fields as needed
            };
            
            // Store student info in sessionStorage instead of localStorage for better security
            sessionStorage.setItem('currentStudent', JSON.stringify(safeStudentData));
            window.location.href = 'studentPage.html';
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'An error occurred during login');
    } finally {
        // Clear password field for security
        passwordInput.value = '';
    }
}

// Add event listener to login form
loginForm.addEventListener('submit', handleLogin);

// Check if user is logged in when loading student page
document.addEventListener('DOMContentLoaded', () => {
    const currentStudent = sessionStorage.getItem('currentStudent');
    
    // Protect student page
    if (window.location.pathname.includes('studentPage.html')) {
        if (!currentStudent) {
            window.location.href = 'index.html';
            return;
        }
        
        // Handle logout
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('currentStudent');
                window.location.href = 'index.html';
            });
        }
    }
});
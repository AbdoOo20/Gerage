import { auth, signInWithEmailAndPassword } from '../../Database/firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.querySelector('form');
    const successMessage = document.getElementById('successMessage');
    const alertContainer = document.getElementById('alert-container');

    // Helper function to show alert messages
    function showAlert(message, type = "danger") {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }

    // Submit form handler
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic validation for empty fields
        if (!email || !password) {
            showAlert("Please enter both email and password.", "warning");
            return;
        }

        // Authenticate user with Firebase
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Check if the user is an Admin
                if (email === 'admin@yahoo.com') {
                    // Save user details in local storage
                    localStorage.setItem('email', email);
                    localStorage.setItem('id', user.uid);

                    // Show success message
                    successMessage.classList.remove('d-none');
                    successMessage.textContent = 'Login successful! Redirecting to the admin dashboard...';

                    // Redirect to Admin home page
                    setTimeout(() => {
                        window.location.href = '../../Admin/home/index.html';
                    }, 3000);

                    // Clear input fields
                    emailInput.value = '';
                    passwordInput.value = '';
                } else {
                    showAlert("Access denied. Only Admin accounts can log in.", "danger");
                }
            })
            .catch((error) => {
                // Enhanced error handling
                if (error.message.includes('auth/wrong-password')) {
                    showAlert("The password you entered is incorrect. Please try again.", "danger");
                } else if (error.message.includes('auth/user-not-found')) {
                    showAlert("No account found with this email address. Please check your email or register.", "danger");
                } else if (error.message.includes('auth/invalid-email')) {
                    showAlert("The email address entered is not valid. Please enter a valid email.", "warning");
                } else {
                    showAlert("An unexpected error occurred. Please try again later.", "danger");
                }
            });
    });
});

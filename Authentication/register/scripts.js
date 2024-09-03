import { auth, createUserWithEmailAndPassword, db, doc, setDoc } from '../../Database/firebase-config.js';

document.addEventListener('DOMContentLoaded', function () {

    // Get the form element
    var form = document.querySelector('form');
    var successMessage = document.getElementById('successMessage');

    // Enable Bootstrap tooltips
    var tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(function (tooltip) {
        new bootstrap.Tooltip(tooltip);
    });

    // Function to validate the form
    var username = document.getElementById('username');
    var email = document.getElementById('email');
    var phone = document.getElementById('phone');
    var password = document.getElementById('password');

    function validateForm() {
        var isValid = true;

        // Validate Username
        if (username.value.trim() === '' && username.value.length <= 3) {
            username.classList.add('is-invalid');
            isValid = false;
        } else {
            username.classList.remove('is-invalid');
        }

        // Validate Email
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        } else {
            email.classList.remove('is-invalid');
        }

        // Validate Phone Number
        var phonePattern = /^\+[0-9]{9,15}$/;
        if (!phonePattern.test(phone.value)) {
            phone.classList.add('is-invalid');
            isValid = false;
        } else {
            phone.classList.remove('is-invalid');
        }

        // Validate Password
        var passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordPattern.test(password.value)) {
            password.classList.add('is-invalid');
            isValid = false;
        } else {
            password.classList.remove('is-invalid');
        }


        // Validate Confirm Password
        var confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword.value !== password.value) {
            confirmPassword.classList.add('is-invalid');
            isValid = false;
        } else {
            confirmPassword.classList.remove('is-invalid');
        }

        // Validate Terms and Conditions
        var terms = document.getElementById('terms');
        if (!terms.checked) {
            terms.classList.add('is-invalid');
            isValid = false;
        } else {
            terms.classList.remove('is-invalid');
        }

        return isValid;
    }

    async function submitForm() {
        await createUserWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
                const user = userCredential.user;
                localStorage.setItem('email', email.value);
                localStorage.setItem('id', user.uid);
                setDoc(doc(db, "users", user.uid), {
                    id: user.uid,
                    email: email.value,
                    password: password.value,
                    name: username.value,
                    phone: phone.value
                }).then(() => {
                    document.getElementById("username").value = "";
                    document.getElementById("email").value = "";
                    document.getElementById("phone").value = "";
                    document.getElementById("password").value = "";
                    document.getElementById("confirmPassword").value = "";
                    successMessage.classList.remove('d-none');
                    form.classList.add('d-none');
                    setTimeout(function () {
                        window.location.href = "./../../User/home/index.html";
                    }, 3000);
                });
            })
            .catch((error) => {
                showAlert(error.message, "danger");
            })
    }

    function showAlert(message, type) { // type => // danger // success // warning
        const alertContainer = document.getElementById('alert-container');
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.role = 'alert';
        alertDiv.innerText = message;
        alertContainer.appendChild(alertDiv);
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    // Handle form submission
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (validateForm()) {
            await submitForm();
        }
    });
});

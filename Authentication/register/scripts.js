import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, doc, setDoc } from '../../Database/firebase-config.js';

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
        if (username.value.trim() === '') {
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
        var phonePattern = /^\+41[1-9][0-9]{8}$/; // Example pattern, adjust as needed
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

    function submitForm() {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                localStorage.setItem('email', EmailAddress);
                localStorage.setItem('id', user.uid);
                setDoc(doc(db, "users", user.uid), {
                    id: user.uid,
                    email: email,
                    password: password,
                    name: username,
                    phone: phone
                }).then(() => {
                    document.getElementById("username").value = "";
                    document.getElementById("email").value = "";
                    document.getElementById("phone").value = "";
                    document.getElementById("password").value = "";
                    document.getElementById("confirmPassword").value = "";
                    window.location.href = '../../User/home/index.html';
                });
            })
            .catch((error) => {
                document.getElementById("username").value = "";
                document.getElementById("email").value = "";
                document.getElementById("phone").value = "";
                document.getElementById("password").value = "";
                document.getElementById("confirmPassword").value = "";
                alert(error.message);
            })
    }

    // Handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!validateForm()) {
            console.log("Validation failed.");
        }
        else {
            // Show the success message
            //submitForm();
            successMessage.classList.remove('d-none');
            form.classList.add('d-none'); // Optionally hide the form

            // Use setTimeout to hide the success message after 3 seconds and then redirect
            setTimeout(function () {
                //successMessage.classList.add('d-none'); // Hide the success message
                //form.classList.remove('d-none'); // Show the form again (if needed)
                //form.reset(); // Reset the form fields

                // Redirect to the login page after 3 seconds
                window.location.href = "./../login/index.html";
            }, 3000); // 3000 milliseconds = 3 seconds*/
        }
    });
});

/*
import { auth, createUserWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier, db, doc, setDoc } from '../../Database/firebase-config.js';

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
*/

// +201552947735 code ==>> 246897


import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "../../Database/firebase-config.js";

// Initialize Firebase Authentication
const auth = getAuth();
auth.useDeviceLanguage(); // Ensure that the auth instance is properly initialized

window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
    'size': 'invisible',
    'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
    }
});

// Function to handle phone number sign-in submission
function onSignInSubmit() {
    const phoneNumber = document.getElementById("PhoneNumber").value;
    const appVerifier = window.recaptchaVerifier;

    // Trigger Firebase phone authentication
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
            // SMS sent. Prompt user to enter the verification code
            window.confirmationResult = confirmationResult;
            //console.log('SMS sent. Please enter the verification code.');
            document.getElementById("Sender").style.display = "none";
            document.getElementById("SMS-sent").style.display = "inline-block";
            document.getElementById("Verifier").style.display = "inline-block";
            setTimeout(() => {
                document.getElementById("SMS-sent").style.display = "none";
            }, 3500);
        }).catch((error) => {
            // Handle Errors here.
            console.error("Error during sign-in: ", error);
            //alert("Failed to send SMS: " + error.message);
        });
}

// Function to handle code verification and user sign-in
function verifyCode() {
    const code = document.getElementById("verificationCode").value; // Get the code entered by the user

    window.confirmationResult.confirm(code).then((result) => {
        // User signed in successfully.
        const user = result.user;
        //console.log("User signed in successfully: ", user);
        //alert("User signed in successfully!");
        document.getElementById("Sign-In-Success").style.display = "inline-block";
        document.getElementById("Verifier").style.display = "none";
        setTimeout(() => {
            window.location = "../../User/home/index.html";
        }, 5000);

        // You can redirect the user or update the UI here.
    }).catch((error) => {
        // Handle Errors here.
        console.error("Error verifying code: ", error);
        alert("Invalid verification code. Please try again.");
    });
}

// Attach event listeners for the sign-in button and code verification
document.getElementById('sign-in-button').addEventListener('click', onSignInSubmit);
document.getElementById('verify-code-button').addEventListener('click', verifyCode);

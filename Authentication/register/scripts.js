// Import Firebase modules
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, db, doc, setDoc } from "../../Database/firebase-config.js";

let isRegister = false;

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const auth = getAuth(); // Initialize Firebase Authentication

    // Enable Bootstrap tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(function (tooltip) {
        new bootstrap.Tooltip(tooltip);
    });

    // Form validation function
    function validateForm() {
        let isValid = true;
        const username = document.getElementById('username');
        const phone = document.getElementById('PhoneNumber');
        const terms = document.getElementById('terms');

        // Validate Username
        if (username.value.trim() === '' || username.value.length <= 3) {
            username.classList.add('is-invalid');
            isValid = false;
        } else {
            username.classList.remove('is-invalid');
        }

        // Validate Phone Number
        const phonePattern = /^\+[0-9]{9,15}$/;
        if (!phonePattern.test(phone.value)) {
            phone.classList.add('is-invalid');
            isValid = false;
        } else {
            phone.classList.remove('is-invalid');
        }

        // Validate Terms and Conditions
        if (!terms.checked) {
            terms.classList.add('is-invalid');
            isValid = false;
        } else {
            terms.classList.remove('is-invalid');
        }

        return isValid;
    }

    // Initialize RecaptchaVerifier
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved, proceed to send OTP
            onSignInSubmit();
        }
    },);

    // Handle phone number submission and send OTP
    async function onSignInSubmit() {
        const phoneNumber = document.getElementById("PhoneNumber").value;
        const appVerifier = window.recaptchaVerifier;

        if (validateForm()) {
            try {
                const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
                // OTP sent, show verification field
                window.confirmationResult = confirmationResult;
                document.getElementById("Sender").style.display = "none";
                document.getElementById("Verifier").style.display = "inline-block";
                document.getElementById("SMS-sent").style.display = "inline-block";
                setTimeout(() => document.getElementById("SMS-sent").style.display = "none", 3500);
            } catch (error) {
                console.error("Error sending OTP: ", error);
                showAlert(error.message, "danger");
            }
        }
    }

    // Handle OTP verification
    async function verifyCode() {
        const verificationCode = document.getElementById("verificationCode").value;

        try {
            const result = await window.confirmationResult.confirm(verificationCode);
            const user = result.user;

            // Save user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                id: user.uid,
                name: document.getElementById("username").value,
                phone: document.getElementById("PhoneNumber").value
            });

            // Display success message
            document.getElementById("Sign-In-Success").style.display = "inline-block";
            document.getElementById("Verifier").style.display = "none";

            // Store user ID in localStorage
            localStorage.setItem('id', user.uid);

            // Redirect after 3 seconds
            setTimeout(() => window.location.href = "./../../User/home/index.html", 3000);

        } catch (error) {
            //console.error("Error verifying OTP: ", error);
            showAlert("Invalid verification code. Please try again.", "danger");
        }
    }

    // Show alert messages
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.role = 'alert';
        alertDiv.innerText = message;
        alertContainer.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    // Attach event listeners
    document.getElementById('sign-in-button').addEventListener('click', onSignInSubmit);
    document.getElementById('verify-code-button').addEventListener('click', verifyCode);

    // Handle form validation and submission
    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (validateForm()) {
            await onSignInSubmit();
        }
    });
});


document.getElementById("haveAccount").addEventListener('click', async function () {
    await changePage();
    this.innerText = isRegister ? "Already have an account?" : " Don't have account ? Register now";
    document.getElementById("headTitle").innerHTML = isRegister ? "REGISTER" : " LOGIN";
    document.getElementById("userName").style.display = isRegister ? "block" : " none";
});

async function changePage() {
    isRegister = !isRegister;
}

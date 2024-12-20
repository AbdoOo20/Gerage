const firebaseConfig = {
    apiKey: "AIzaSyDjdfmmt7VPSv9vxS7260jRSAWNHa_D624",
    authDomain: "garage-5737c.firebaseapp.com",
    projectId: "garage-5737c",
    storageBucket: "garage-5737c.appspot.com",
    messagingSenderId: "521889986895",
    appId: "1:521889986895:web:67275839e35f35a03aed3a",
    measurementId: "G-GCM03SDCPS"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let recaptchaVerifier;
let isRegister = false;

// Centralized error handler
function handleFirebaseError(error) {
    const errorMessageMap = {
        "auth/invalid-phone-number": "Invalid phone number. Please try again.",
        "auth/too-many-requests": "Too many requests. Please wait and try again later.",
        "auth/quota-exceeded": "Service temporarily unavailable. Please try again later.",
        "auth/missing-phone-number": "Phone number is required.",
        "auth/invalid-verification-code": "Invalid verification code. Please try again.",
        "auth/user-disabled": "This account is disabled. Please contact support."
    };

    return errorMessageMap[error.code] || "Unexpected error. Please try again later.";
}

function showAlert(message) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;

    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    alertModal.show();
}

function initializeRecaptcha() {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear(); // Clear existing ReCAPTCHA instance
    }
    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'normal',
        callback: () => {
            // reCAPTCHA solved
        },
        'expired-callback': () => {
            showAlert("reCAPTCHA expired. Please try again.");
            initializeRecaptcha();
        }
    });
    recaptchaVerifier.render();
}

function toggleRegisterMode() {
    isRegister = !isRegister;

    const nameInput = document.getElementById('username');
    const toggleText = document.getElementById('toggle-text');
    const toggleLink = document.getElementById('toggle-link');

    nameInput.style.display = isRegister ? 'block' : 'none';
    toggleText.textContent = isRegister ? 'Already have an account?' : "Don't have an account?";
    toggleLink.textContent = isRegister ? 'Login' : 'Register Now';

    initializeRecaptcha(); // Reinitialize ReCAPTCHA on mode change
}

function validateInput(phoneNumber, name) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const nameRegex = /^[a-zA-Z ]{3,30}$/;

    if (!phoneRegex.test(phoneNumber)) {
        showAlert("Invalid phone number! Please enter a valid international number.");
        return false;
    }

    if (isRegister && !nameRegex.test(name)) {
        showAlert("Invalid name! Please enter a valid name (letters and spaces only, 3-30 characters).");
        return false;
    }

    return true;
}

async function checkIfPhoneExists(phoneNumber) {
    try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("phone", "==", phoneNumber).get();
        return !snapshot.empty;
    } catch (error) {
        showAlert("Unexpected error. Please try again later.");
        throw error;
    }
}

async function sendOTP() {
    const phoneNumber = document.getElementById('number').value.trim();
    const name = document.getElementById('username').value.trim();

    if (!validateInput(phoneNumber, name)) {
        return;
    }

    if (isRegister) {
        // Registration flow
        try {
            const phoneExists = await checkIfPhoneExists(phoneNumber);
            if (phoneExists) {
                showAlert("Phone Number Already Exists!!");
                return;
            }
        } catch (error) {
            return; // Error already handled in checkIfPhoneExists
        }
    } else {
        // Login flow
        try {
            const phoneExists = await checkIfPhoneExists(phoneNumber);
            if (!phoneExists) {
                showAlert("Phone number not found. Please register first.");
                return;
            }
        } catch (error) {
            return; // Error already handled in checkIfPhoneExists
        }
    }

    if (!recaptchaVerifier) initializeRecaptcha();

    firebase.auth().signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            document.querySelector('.number-input').style.display = 'none';
            document.querySelector('.verification').style.display = '';
        })
        .catch((error) => {
            const userFriendlyMessage = handleFirebaseError(error);
            showAlert(userFriendlyMessage);
            initializeRecaptcha();
        });
}

function verifyCode() {
    const code = document.getElementById('verificationCode').value;

    if (window.confirmationResult) {
        window.confirmationResult.confirm(code).then(async (result) => {
            const user = result.user;

            if (isRegister) {
                const name = document.getElementById('username').value;
                try {
                    await db.collection("users").doc(user.uid).set({
                        id: user.uid,
                        name: name,
                        phone: user.phoneNumber
                    });
                } catch (error) {
                    showAlert("Unexpected error. Please try again later.");
                    return;
                }
            }

            localStorage.setItem('id', user.uid);
            setTimeout(() => window.location.href = "./../../User/home/index.html", 2000);

        }).catch((error) => {
            const userFriendlyMessage = handleFirebaseError(error);
            showAlert(userFriendlyMessage);
        });
    } else {
        showAlert("No OTP request found. Please retry.");
    }
}

// Initialize ReCAPTCHA on page load
initializeRecaptcha();

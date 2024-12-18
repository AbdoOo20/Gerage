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

function initializeRecaptcha() {
    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'normal',
        callback: (response) => {
            console.log("reCAPTCHA verified: ", response);
        },
        'expired-callback': () => {
            showAlert("reCAPTCHA expired. Please try again.");
            initializeRecaptcha();
        }
    });
    recaptchaVerifier.render();
}

function showAlert(message) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;

    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    alertModal.show();
}

function toggleRegisterMode() {
    isRegister = !isRegister;

    const nameInput = document.getElementById('username');
    const toggleText = document.getElementById('toggle-text');
    const toggleLink = document.getElementById('toggle-link');

    nameInput.style.display = isRegister ? 'block' : 'none';
    toggleText.textContent = isRegister ? 'Already have an account?' : "Don't have an account?";
    toggleLink.textContent = isRegister ? 'Login' : 'Register Now';
}

function validateInput(phoneNumber, name) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const nameRegex = /^[a-zA-Z ]{3,30}$/;

    if (!phoneRegex.test(phoneNumber)) {
        showAlert("Invalid phone number! Please enter a valid international number.");
        return false;
    }

    if (isRegister && !nameRegex.test(name)) {
        showAlert("Invalid name! Please enter a valid name (letters and spaces only, 2-30 characters).");
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
        console.error("Error checking phone number existence:", error.message);
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
        try {
            const phoneExists = await checkIfPhoneExists(phoneNumber);
            if (phoneExists) {
                showAlert("Phone Number Already Exists!!");
                return;
            }
        } catch (error) {
            showAlert("Error checking phone number. Please try again.");
            return;
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
            showAlert(error.message);
            initializeRecaptcha();
        });
}

function logActivity(activity, userId) {
    console.log(`Activity Logged: ${activity}, UserID: ${userId}`);
    db.collection('logs').add({
        activity,
        userId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function verifyCode() {
    const code = document.getElementById('verificationCode').value;

    if (window.confirmationResult) {
        window.confirmationResult.confirm(code).then(async (result) => {
            const user = result.user;

            if (isRegister) {
                const name = document.getElementById('username').value;
                await db.collection("users").doc(user.uid).set({
                    id: user.uid,
                    name: name,
                    phone: user.phoneNumber
                });
                logActivity("User Registered", user.uid);
                console.log("User registered successfully.");
            } else {
                logActivity("User Logged In", user.uid);
                console.log("User logged in successfully.");
            }

            localStorage.setItem('id', user.uid);
            setTimeout(() => window.location.href = "./../../User/home/index.html", 2000);

        }).catch((error) => {
            showAlert("Error verifying code. Please try again.");
        });
    } else {
        showAlert("No OTP request found. Please retry.");
    }
}

initializeRecaptcha();

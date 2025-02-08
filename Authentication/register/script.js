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

const translations = {};
const defaultLang = localStorage.getItem('language') || 'en';

 // Load translations from JSON file
 fetch('./../../translation/translations.json')
 .then(response => response.json())
 .then(data => {
         Object.assign(translations, data);
         applyTranslations(defaultLang);
 })
 .catch(error => console.error('Error loading translations:', error));

 // Function to apply translations
 function applyTranslations(lang) {
 if (!translations[lang]) {
         console.error(`Translations not found for language: ${lang}`);
         return;
 }

 document.querySelectorAll('[data-translation-key]').forEach(element => {
         const key = element.getAttribute('data-translation-key');
         if (translations[lang][key]) {
             if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
                 // Update the value attribute for input elements
                 element.value = translations[lang][key];
             } else {
                 // Update text content for other elements
                 element.textContent = translations[lang][key];
             }
         } else {
         console.warn(`No translation found for key: ${key}`); // Debugging missing keys
         }
 });
 }

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

    return errorMessageMap[error.code] || error.message; //"Unexpected error. Please try again later."
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
    toggleText.textContent = isRegister ? translations[defaultLang]["already_have_account"] : translations[defaultLang]["dont_have_account"];
    toggleLink.textContent = isRegister ? translations[defaultLang]["login"] : translations[defaultLang]["register_now"];

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

    console.log(`Phone number sent: ${phoneNumber}`);
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

function moveToNext(input, index) {
    const inputs = document.querySelectorAll('.otp-input');
    if (input.value.length === 1 && index < inputs.length) {
        inputs[index].focus(); // Move to the next input
    } else if (input.value.length === 0 && index > 0) {
        inputs[index - 2].focus(); // Move back to the previous input
    }
}

function verifyCode() {
    const inputs = document.querySelectorAll('.otp-input');
        let code = '';
        inputs.forEach(input => {
            code += input.value; // Collect all digits
        });

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

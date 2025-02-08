
var privacy = document.getElementById('privacy');
var location = document.getElementById('location');
var phone = document.getElementById('phone');
var mail = document.getElementById('mail');
document.addEventListener("DOMContentLoaded", async () => {
    var setting = JSON.parse(localStorage.getItem('setting'));
    privacy.innerText = setting.aboutUs;
    mail.innerText = setting.contactEmail;
    phone.innerText = setting.contactNumber;
    location.href = setting.location;
});

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
                element.placeholder = translations[lang][key]; // For placeholders
            } else {
                element.textContent = translations[lang][key]; // For regular text
            }
        } else {
            console.warn(`No translation found for key: ${key}`); // Debugging missing keys
        }
    });
}
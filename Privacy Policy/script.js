import { db, doc, getDoc } from '../../Database/firebase-config.js';

document.addEventListener("DOMContentLoaded", async () => {
    await getSettingData();
});

async function getSettingData() {
    try {
        let settingDoc = doc(db, "Settings", "pMbOKWdq6WtCoOzZ3hA9");
        const settingData = await getDoc(settingDoc);
        localStorage.setItem('setting', JSON.stringify(settingData.data()));
        var setting = JSON.parse(localStorage.getItem('setting'));
        var privacy = document.getElementById('privacy');
        var mail = document.getElementById('mail');
        var email = document.getElementById('email');
        var location = document.getElementById('location');
        var phone = document.getElementById('phone');
        var facebook = document.getElementById('facebook');
        var instagram = document.getElementById('instagram');
        var youtube = document.getElementById('youtube');
        privacy.innerText = setting.privacy;
        mail.innerText = setting.contactEmail;
        email.innerText = setting.contactEmail;
        phone.innerText = setting.contactNumber;
        location.href = setting.location;
        facebook.href = setting.facebook;
        instagram.href = setting.instagram;
        youtube.href = setting.youtube;
    } catch (error) {
        console.error("Error fetching profile data: ", error);
    }
}

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
import { db, collection, getDocs, signOut, auth, doc, getDoc, query, orderBy } from '../../Database/firebase-config.js';

// Base64 Encoding/Decoding Functions
function encodeBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
        return decodeURIComponent(escape(atob(str)));
}

// Fetch the user ID from local storage
const UserID = localStorage.getItem('id');

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", async () => {

        var mail = document.getElementById('mail');
        var map = document.getElementById('map');
        var phone = document.getElementById('phone');
        var facebook = document.getElementById('facebook');
        var instagram = document.getElementById('instagram');
        var youtube = document.getElementById('youtube');
        let settingDoc = doc(db, "Settings", "pMbOKWdq6WtCoOzZ3hA9");
        const settingData = await getDoc(settingDoc);
        localStorage.setItem('setting', JSON.stringify(settingData.data()));
        var setting = JSON.parse(localStorage.getItem('setting'));
        mail.innerText = setting.contactEmail;
        phone.innerText = setting.contactNumber;
        map.href = setting.location;
        facebook.href = setting.facebook;
        instagram.href = setting.instagram;
        youtube.href = setting.youtube;
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
        }

        //Toggle the visibility of login/logout icons based on UserID
        if (UserID == null) {
                Array.from(document.getElementsByClassName("icons")).forEach((item) => {
                        item.classList.add("d-none");
                });
                document.getElementById("Login").classList.remove("d-none");
        } else {
                document.getElementById("Login").classList.add("d-none");
        }

        // Fetch and display the list of units from Firestore
        const parentUnit = document.getElementById('ParentUnit');
        const Units = collection(db, "Units");
        const q = query(Units, orderBy("number", "asc")); 
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
                const data = doc.data();
                const encodedUnitID = encodeBase64(doc.id); // Encrypt UnitID
                const itemHTML = `
            <a class="text-dark text-decoration-none" href="../unit/index.html?UnitID=${encodedUnitID}">
                <div class="col">
                    <div class="card product-card">
                        <img src=${data.imageUrl} alt="Product Image" class="card-img-top product-image">
                        <div class="card-body">
                            <h5 class="card-title">${data.title}</h5>
                            <p class="card-text hour">
                              <i class="fa-solid fa-stopwatch"></i>
                              <strong>${data.price} CHF ${translations[defaultLang]["per_hour"]}</strong>
                            </p>
                            <p class="card-text day">
                              <i class="fa-solid fa-calendar-day"></i>
                              <strong>${data.priceDay} CHF ${translations[defaultLang]["per_day"]}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </a>
        `;
                parentUnit.insertAdjacentHTML('beforeend', itemHTML);
        });

        // Decrypt UnitID from URL if available
        const urlParams = new URLSearchParams(window.location.search);
        const encodedUnitID = urlParams.get('UnitID');
        if (encodedUnitID) {
                const unitID = decodeBase64(encodedUnitID); // Decrypt UnitID
                console.log('UnitID:', unitID);
                // Fetch and display details for the unit with the decrypted UnitID
        }
});

//getSettingData();

// Search functionality for filtering units based on user input
const searchInput = document.getElementById('searchInput');
const cardContainer = document.getElementById('ParentUnit');
const cards = cardContainer.getElementsByClassName('card');

// Add event listener for search input
searchInput.addEventListener("input", function () {
        const filter = searchInput.value.trim().toLowerCase();
        for (let i = 0; i < cards.length; i++) {
                const title = cards[i].getElementsByClassName('card-title')[0].textContent.toLowerCase();
                const text = cards[i].getElementsByClassName('card-text')[0].textContent.toLowerCase();
                // Show card if it matches the search query
                cards[i].parentElement.style.display = (title.includes(filter) || text.includes(filter)) ? '' : 'none';
        }
});

// Clear search input and reset card visibility
document.getElementById("clearSearch").addEventListener("click", () => {
        searchInput.value = '';
        for (let i = 0; i < cards.length; i++) {
                cards[i].parentElement.style.display = '';
        }
});

// Logout functionality
document.getElementById("Logout").addEventListener("click", () => {
        signOut(auth).then(() => {
                var currentLanguage = localStorage.getItem('language') || 'en';
                localStorage.clear();
                localStorage.setItem('language', currentLanguage);
                window.location.href = '../../Authentication/register/index.html';
        });
});

async function getSettingData() {
        try {
                console.log('1');
                var mail = document.getElementById('mail');
                var location = document.getElementById('location');
                var phone = document.getElementById('phone');
                var facebook = document.getElementById('facebook');
                var instagram = document.getElementById('instagram');
                var youtube = document.getElementById('youtube');
                console.log('2');
                let settingDoc = doc(db, "Settings", "pMbOKWdq6WtCoOzZ3hA9");
                console.log('3');
                const settingData = await getDoc(settingDoc);
                console.log('4');
                localStorage.setItem('setting', JSON.stringify(settingData.data()));
                console.log('5');
                var setting = JSON.parse(localStorage.getItem('setting'));
                console.log('6');
                mail.innerText = setting.contactEmail;
                phone.innerText = setting.contactNumber;
                location.href = setting.location;
                facebook.href = setting.facebook;
                instagram.href = setting.instagram;
                youtube.href = setting.youtube;
                console.log('7');
                console.log(setting);
        } catch (error) {
                console.error("Error fetching profile data: ", error);
        }
}

const translations = {};
var savedLang = localStorage.getItem('language') || 'en';

// Load translations from JSON file
fetch('./../../translation/translations.json')
.then(response => response.json())
.then(data => {
        const savedFlag =
                savedLang === 'en'
                ? 'https://flagcdn.com/w40/us.png'
                : savedLang === 'de'
                ? 'https://flagcdn.com/w40/de.png'
                : 'https://flagcdn.com/w40/it.png';
        const savedLanguage =
                savedLang === 'en' ? 'English' : savedLang === 'de' ? 'German' : 'Italian';

        // Update button with saved flag and language
        document.getElementById('selectedFlag').src = savedFlag;
        document.getElementById('selectedLanguage').textContent = savedLanguage;

        // Apply saved language
        // updateLanguage(savedLang);

        Object.assign(translations, data);
        updateLanguage(savedLang); // Set initial language
});

// Update language based on the dropdown selection
// Bind click event to dropdown menu
document.querySelector('.dropdown-menu').addEventListener('click', (event) => {
        const clickedElement = event.target.closest('a[data-lang]');
        if (clickedElement) {
            const lang = clickedElement.getAttribute('data-lang');
            const flag = clickedElement.getAttribute('data-flag');
            const languageName = clickedElement.textContent.trim();
    
            // Update button with selected flag and language
            document.getElementById('selectedFlag').src = flag;
            document.getElementById('selectedLanguage').textContent = languageName;
    
            // Update language and save to localStorage
            if (lang) {
                savedLang = lang;
                localStorage.setItem('language', lang);
                //updateLanguage(lang);
                window.location.reload();
            }
        }
    });    
    

function updateLanguage(lang) {
        if (!translations[lang]) {
            console.error(`Translations not found for language: ${lang}`);
            return;
        }
        document.getElementById('searchInput').placeholder = translations[lang].search_placeholder || '';
        document.querySelector('h1').textContent = translations[lang].units_heading || '';
        document.querySelector('a[href*="About US"]').textContent = translations[lang].about || '';
        document.querySelector('a[href*="Privacy Policy"]').textContent = translations[lang].privacy_terms || '';
        document.getElementById('Login').textContent = translations[lang].login || '';
        document.getElementById('Logout').title = translations[lang].logout || '';
        document.getElementById('rights').innerText = translations[lang].copyright || '';
        // if(UserID){
        //         document.querySelector('a[title="Orders"]').textContent = translations[lang].orders || '';
        // }
        document.getElementById('privacyLink').textContent = translations[lang].privacy_terms || '';
        document.querySelector('footer p.text-center').textContent = translations[lang].footer_info || '';
        document.querySelector('h5.text-uppercase.mb-4').textContent = translations[lang].quick_links || '';
        document.querySelector('h5.text-uppercase.mb-4 + ul li a').textContent = translations[lang].contact || '';
        document.querySelector('#map').textContent = translations[lang].switzerland || '';
}    
import { db, collection, getDocs, signOut, auth, doc, getDoc } from '../../Database/firebase-config.js';

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
        const querySnapshot = await getDocs(Units);

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
                            <p class="card-text"><strong>${data.price} $</strong></p>
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
                localStorage.clear();
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
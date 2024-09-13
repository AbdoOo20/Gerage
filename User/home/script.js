import { db, collection, getDocs, signOut, auth } from '../../Database/firebase-config.js';

// Fetch the user ID from local storage
const UserID = localStorage.getItem('id');

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", async () => {
        // Toggle the visibility of login/logout icons based on UserID
        if (UserID == null) {
                Array.from(document.getElementsByClassName("icons")).forEach((item) => {
                        item.classList.add("d-none");
                });
                document.getElementById("LoginIcon").classList.remove("d-none");
        } else {
                document.getElementById("LoginIcon").classList.add("d-none");
        }

        // Fetch and display the list of units from Firestore
        const parentUnit = document.getElementById('ParentUnit');
        const Units = collection(db, "Units");
        const querySnapshot = await getDocs(Units);

        querySnapshot.forEach((doc) => {
                const data = doc.data();
                const itemHTML = `
            <a class="text-dark text-decoration-none" href="../unit/index.html?UnitID=${doc.id}">
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
                // Add each unit card to the parent container
                parentUnit.insertAdjacentHTML('beforeend', itemHTML);
        });
});

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

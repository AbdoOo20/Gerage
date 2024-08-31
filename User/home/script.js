import { db, collection, getDocs, signOut, auth } from '../../Database/firebase-config.js';
const UserID = localStorage.getItem('id');

document.addEventListener("DOMContentLoaded", async () => {
        console.log(UserID);
        if (UserID == null) {
                Array.from(document.getElementsByClassName("icons")).forEach((item) => {
                        item.classList.add("d-none");
                });
                document.getElementById("LoginIcon").classList.remove("d-none");
        } else {
                document.getElementById("LoginIcon").classList.add("d-none");
        }
        const parentUnit = document.getElementById('ParentUnit');
        (async () => {
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
                        parentUnit.insertAdjacentHTML('beforeend', itemHTML);
                });
        })();
});

const searchInput = document.getElementById('searchInput');
const cardContainer = document.getElementById('ParentUnit');
const cards = cardContainer.getElementsByClassName('card');

searchInput.addEventListener("keypress", function () {
        const filter = searchInput.value.toLowerCase();
        for (let i = 0; i < cards.length; i++) {
                const title = cards[i].getElementsByClassName('card-title')[0].textContent.toLowerCase();
                const text = cards[i].getElementsByClassName('card-text')[0].textContent.toLowerCase();
                if (title.includes(filter) || text.includes(filter)) {
                        cards[i].parentElement.style.display = '';
                } else {
                        cards[i].parentElement.style.display = 'none';
                }
        }
});

document.getElementById("clearSearch").addEventListener("click", () => {
        searchInput.value = null;
        for (let i = 0; i < cards.length; i++) {
                if (cards[i].parentElement.style.display = 'none') {
                        cards[i].parentElement.style.display = '';
                }
        }
})

document.getElementById("Logout").addEventListener("click", () => {
        signOut(auth).then(() => {
                localStorage.clear();
                window.location.href = '../../Authentication/login/index.html';
        });
})
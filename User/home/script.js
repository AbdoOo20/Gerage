import { db, collection, getDocs } from '../../Database/firebase-config.js';


document.addEventListener("DOMContentLoaded", async () => {
        const parentUnit = document.getElementById('ParentUnit');
        (async () => {
                const Units = collection(db, "Units");
                const querySnapshot = await getDocs(Units);
                querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const itemHTML = `
                        <div class="col">
                        <div class="card product-card">
                        <img src=${data.imageUrl} alt="Product Image" class="card-img-top product-image">
                        <div class="card-body">
                            <a class="text-dark text-decoration-none" href="../unit/index.html?UnitID=${doc.id}">
                            <h5 class="card-title">${data.title}</h5>
                            </a>
                            <p class="card-text"><strong>${data.price} $</strong></p>
                            <p class="card-text"><strong>Availability:</strong> ${data.isUsed ? "available" : "unavailable now"} </p>
                        </div>
                        </div>
                        </div>
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
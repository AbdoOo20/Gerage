import { db, addDoc,doc, getDoc, collection } from '../../Database/firebase-config.js';

// Test: pk_test_51QFCeaPPa7Ug3bKucNTL8LOj05NRyWzD50XIP3wib3ltvoHGyUbwDbD4zplmhKfiYNkGSantfctPaPqwadt9uoqA00z8uPg7AN
// Live: pk_live_51QFCeaPPa7Ug3bKu1KUkqNnqZsxN9Q0tKfcIeRoF62FlbrNvG5kTRBvbbDIi0frJn3gkpAP0cWkg1byAxeQ6L0mi00UWXE7tWj
const stripe = Stripe('pk_live_51QFCeaPPa7Ug3bKu1KUkqNnqZsxN9Q0tKfcIeRoF62FlbrNvG5kTRBvbbDIi0frJn3gkpAP0cWkg1byAxeQ6L0mi00UWXE7tWj'); // Replace with your publishable key
const elements = stripe.elements();

// Get Order ID from Query String
const urlParams = new URLSearchParams(window.location.search);
const OrderIDFromQuery = urlParams.get('Order');
var unitdata;
let bookDetails;

document.addEventListener("DOMContentLoaded", async () => {
    bookDetails = JSON.parse(localStorage.getItem('bookDetails')); 
    var mail = document.getElementById('mail');
    var location = document.getElementById('location');
    var phone = document.getElementById('phone');
    var facebook = document.getElementById('facebook');
    var instagram = document.getElementById('instagram');
    var youtube = document.getElementById('youtube');
    var setting = JSON.parse(localStorage.getItem('setting'));
    mail.innerText = setting.contactEmail;
    phone.innerText = setting.contactNumber;
    location.href = setting.location;
    facebook.href = setting.facebook;
    instagram.href = setting.instagram;
    youtube.href = setting.youtube;
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

// Fetch the Order Data from Firestore
async function getOrderData(orderId) {
    if (!orderId || !localStorage.getItem('bookDetails') || localStorage.getItem('bookDetails') === "{}") {
        alert("No Units ID provided in the query string or bookDetails is empty.");
        return;
    }
    try {
           const unitRef = doc(db, "Units", orderId); // Replace 'orders' with your collection name
            const unitSnap = await getDoc(unitRef);
            unitdata = unitSnap.data();
        if (unitSnap.exists()) {
            document.getElementById("unitName").innerText = unitdata.title;
            document.getElementById("unitPrice").innerText = bookDetails.Type === "Hour" ? unitdata.price + ' CHF ' + translations[defaultLang]["per_hour"] : unitdata.priceDay + ' CHF ' + translations[defaultLang]["per_day"];
            document.getElementById("unitImage").src = unitdata.imageUrl[0];
            document.getElementById("valuePaid").innerText = translations[defaultLang]["pay_amount_chf"] + " " + (bookDetails.Type === "Hour" ? (unitdata.price * bookDetails.Duration) : unitdata.priceDay) + " CHF";
        } else {
            console.log("No such order found!");
        }
    } catch (error) {
        console.error("Error fetching order data:", error);
    }
}

const UserID = localStorage.getItem('id');
var userData;
async function getProfileData() {
    try {
        if (UserID != null) {
            let userDetails = doc(db, "users", UserID.toString());
            const userSnap = await getDoc(userDetails);
            if (userSnap.exists) {
                userData = userSnap.data();
            } else {
                console.log("This User Does Not Exist!!");
            }
        }
    } catch (error) {
        console.error("Error fetching profile data: ", error);
    }
}

// Call the function to fetch data
getOrderData(OrderIDFromQuery);
getProfileData();

const style = {
    base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
            color: "#aab7c4"
        }
    },
    invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
    }
};

// Create card elements
const cardNumberElement = elements.create('cardNumber', { style });
const cardExpiryElement = elements.create('cardExpiry', { style });
const cardCvcElement = elements.create('cardCvc', { style });

// Mount the card elements
cardNumberElement.mount('#card-number-element');
cardExpiryElement.mount('#card-expiry-element');
cardCvcElement.mount('#card-cvc-element');

// Add an element to show the card brand icon dynamically
const cardBrandElement = document.createElement('div'); // Create a div for the card brand icon
cardBrandElement.setAttribute('id', 'card-brand'); // Assign an ID to the div
document.querySelector('#card-number-element').parentElement.appendChild(cardBrandElement);
cardNumberElement.on('change', (event) => {
    const brandElement = document.getElementById('card-brand');
    if (event.brand) {
        brandElement.innerHTML = '';
        switch (event.brand) {
            case 'visa':
                brandElement.innerHTML = '<img src="./../../Images/visa.png" class="card-visa" alt="Visa" />';
                break;
            case 'mastercard':
                brandElement.innerHTML = '<img src="./../../Images/card.png" class="card-master" alt="MasterCard" />';
                break;
            case 'amex':
                brandElement.innerHTML = '<img src="./../../Images/amex.png" class="card-visa" alt="American Express" />';
                break;
            case 'discover':
                brandElement.innerHTML = '<img src="./../../Images/discover.png" class="card-visa" alt="Discover" />';
                break;
            default:
                brandElement.innerHTML = `
            <img src="./../../Images/visa.png" alt="Visa" class="card-visa" />
            <img src="./../../Images/card.png" alt="MasterCard" class="card-master" />
            <img src="./../../Images/amex.png" alt="American Express" class="card-visa" />
            <img src="./../../Images/discover.png" alt="Discover" class="card-visa" />
        `;
        }
    } else {
        console.log('in else');

        brandElement.innerHTML = `
            <img src="./../../Images/visa.png" alt="Visa" class="card-visa" />
            <img src="./../../Images/card.png" alt="MasterCard" class="card-master" />
            <img src="./../../Images/amex.png" alt="American Express" class="card-visa" />
            <img src="./../../Images/discover.png" alt="Discover" class="card-visa" />
        `;
    }
});

const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'inline-block';
    // local: http://localhost:15003/
    // host: https://garageapi.runasp.net
    $.ajax({
        url: "https://garageapi.runasp.net/api/Payment/create-intent",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ amount: bookDetails.Type === "Hour" ? (unitdata.price * bookDetails.Duration) : unitdata.priceDay }), // Replace amount dynamically
        success: function (response) {
            if (response.clientSecret) {
                stripe.confirmCardPayment(response.clientSecret, {
                    payment_method: {
                        card: cardNumberElement,
                        billing_details: {
                            name: document.getElementById('cardholder-name').value,
                        },
                    },
                }).then(async (result) => {
                    if (result.error) {
                        const alertPlaceholder = document.getElementById('alertPlaceholder');
                        const alertHTML = `
                        <div class="alert alert-danger alert-dismissible fade show mx-5" role="alert">
                            <strong>${translations[defaultLang]["error_alert_title"]}</strong> : ${result.error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `;
                        alertPlaceholder.innerHTML = alertHTML;
                    } else if (result.paymentIntent.status === 'succeeded') {
                        await addDoc(collection(db, "Orders"), {
                            UserID: bookDetails.UserID,
                            UnitID: bookDetails.UnitID,
                            OrderDate: bookDetails.OrderDate,
                            OrderSelectedHour: bookDetails.OrderSelectedHour,
                            OrderSelectedMinute: bookDetails.OrderSelectedMinute,
                            Duration: bookDetails.Duration, // Store duration as hours (e.g., 1.5 for 1 hour 30 minutes)
                            OrderStatus: "Paid",
                            UnitPrice: bookDetails.UnitPrice,
                            UnitImages: bookDetails.UnitImages,
                            Type: bookDetails.Type
                    });
                        const alertPlaceholder = document.getElementById('alertPlaceholder');
                        const alertHTML = `
                        <div class="alert alert-success alert-dismissible fade show mx-5" role="alert">
                            <strong>${translations[defaultLang]["success_alert_title"]}!</strong>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `;
                        alertPlaceholder.innerHTML = alertHTML;
                        const paymentDetails = {
                            productName: unitdata.title, // Replace with your product name
                            price: bookDetails.Type === "Hour" ? ((unitdata.price * bookDetails.Duration) + " CHF") : (unitdata.priceDay + " CHF"), // Replace with your price
                            duration: bookDetails.Duration + " Hour", // Replace with actual duration
                            name: userData.title, // Masked card number
                            phoneNumber: userData.phone, // Replace with actual user phone number
                            date: bookDetails.OrderDate, // Current date and time
                            type: bookDetails.Type
                        };
                        localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
                        localStorage.removeItem('bookDetails');
                        window.location.href = "./receipt.html";
                    }
                });
            } else {
                const alertPlaceholder = document.getElementById('alertPlaceholder');
                const alertHTML = `
                <div class="alert alert-danger alert-dismissible fade show mx-5" role="alert">
                    <strong>Error!</strong>Failed to retrieve client secret.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
                alertPlaceholder.innerHTML = alertHTML;
            }
        },
        error: function () {
            const alertPlaceholder = document.getElementById('alertPlaceholder');
            const alertHTML = `
                <div class="alert alert-danger alert-dismissible fade show mx-5" role="alert">
                    <strong>Error!</strong> An error occurred while processing the payment.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            alertPlaceholder.innerHTML = alertHTML;
        },
        complete: function () {
            spinner.style.display = 'none';
        },
    });
});

import { db, doc, getDoc, updateDoc } from '../../Database/firebase-config.js';

const stripe = Stripe('pk_test_51QFCeaPPa7Ug3bKucNTL8LOj05NRyWzD50XIP3wib3ltvoHGyUbwDbD4zplmhKfiYNkGSantfctPaPqwadt9uoqA00z8uPg7AN'); // Replace with your publishable key
const elements = stripe.elements();

// Get Order ID from Query String
const urlParams = new URLSearchParams(window.location.search);
const OrderIDFromQuery = urlParams.get('Order');
var unitdata;
var orderdata;
// Fetch the Order Data from Firestore
async function getOrderData(orderId) {
    if (!orderId) {
        console.error("No Order ID provided in the query string.");
        return;
    }
    try {
        const orderRef = doc(db, "Orders", orderId); // Replace 'orders' with your collection name
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
            orderdata = orderSnap.data();
            const unitRef = doc(db, "Units", orderSnap.data().UnitID); // Replace 'orders' with your collection name
            const unitSnap = await getDoc(unitRef);
            unitdata = unitSnap.data();
            document.getElementById("unitName").innerText = unitdata.title;
            document.getElementById("unitPrice").innerText = unitdata.price + '$' + " per hour";
            document.getElementById("unitImage").src = unitdata.imageUrl[0];
            document.getElementById("valuePaid").innerText = "Pay " + (unitdata.price * orderdata.Duration) + "$";
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
    $.ajax({
        url: "https://garage.runasp.net/api/Payment/create-intent",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ amount: (unitdata.price * orderdata.Duration) }), // Replace amount dynamically
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
                            <strong>Error!</strong>Payment failed: ${result.error.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `;
                        alertPlaceholder.innerHTML = alertHTML;
                    } else if (result.paymentIntent.status === 'succeeded') {
                        const orderDocRef = doc(db, "Orders", OrderIDFromQuery);
                        await updateDoc(orderDocRef, {
                            OrderStatus: "Paid",
                        });
                        const alertPlaceholder = document.getElementById('alertPlaceholder');
                        const alertHTML = `
                        <div class="alert alert-success alert-dismissible fade show mx-5" role="alert">
                            <strong>Error!</strong>Payment successful!
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `;
                        alertPlaceholder.innerHTML = alertHTML;
                        const paymentDetails = {
                            productName: unitdata.title, // Replace with your product name
                            price: (unitdata.price * orderdata.Duration) + "$", // Replace with your price
                            duration: orderdata.Duration + " Hour", // Replace with actual duration
                            name: userData.title, // Masked card number
                            phoneNumber: userData.phone, // Replace with actual user phone number
                            date: orderdata.OrderDate, // Current date and time
                        };
                        localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
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
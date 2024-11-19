import { db, doc, getDoc } from '../../Database/firebase-config.js';

const stripe = Stripe('your-publishable-key'); // Replace with your publishable key
const elements = stripe.elements();

// Get Order ID from Query String
const urlParams = new URLSearchParams(window.location.search);
const OrderIDFromQuery = urlParams.get('Order');
console.log("Order ID from Query:", OrderIDFromQuery);

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
            console.log("Order Data:", orderSnap.data());
        } else {
            console.log("No such order found!");
        }
    } catch (error) {
        console.error("Error fetching order data:", error);
    }
}

// Call the function to fetch data
getOrderData(OrderIDFromQuery);

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
document.querySelector('#card-number-element').parentElement.appendChild(cardBrandElement); // Append the brand div below the card number

// Detect the card brand dynamically and show the corresponding icon
cardNumberElement.on('change', (event) => {
    console.log(event);

    const brandElement = document.getElementById('card-brand');
    if (event.brand) {
        // Clear all previous logos
        brandElement.innerHTML = '';

        // Show brand logo based on the card brand detected
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
        `;// Clear if the brand is unknown
        }
    } else {
        // When input is empty or invalid, show all card logos
        console.log('in else');

        brandElement.innerHTML = `
            <img src="./../../Images/visa.png" alt="Visa" class="card-visa" />
            <img src="./../../Images/card.png" alt="MasterCard" class="card-master" />
            <img src="./../../Images/amex.png" alt="American Express" class="card-visa" />
            <img src="./../../Images/discover.png" alt="Discover" class="card-visa" />
        `;
    }
});

// Form submission (with spinner and AJAX)
const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'inline-block'; // Show spinner
    // Example AJAX call to backend (replace URL with your backend endpoint)
    $.ajax({
        url: "http://localhost:15003/api/Payment/create-intent",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ amount: 2000 }), // Replace amount dynamically
        success: function (response) {
            if (response.clientSecret) {
                stripe.confirmCardPayment(response.clientSecret, {
                    payment_method: {
                        card: cardNumberElement,
                        billing_details: {
                            name: document.getElementById('cardholder-name').value,
                        },
                    },
                }).then((result) => {
                    if (result.error) {
                        alert('Payment failed: ' + result.error.message);
                    } else if (result.paymentIntent.status === 'succeeded') {
                        alert('Payment successful!');
                    }
                });
            } else {
                alert('Failed to retrieve client secret.');
            }
        },
        error: function () {
            alert('An error occurred while processing the payment.');
        },
        complete: function () {
            spinner.style.display = 'none'; // Hide spinner
        },
    });
});
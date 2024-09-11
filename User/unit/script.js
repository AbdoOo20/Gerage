import { db, getDoc, doc, query, where, addDoc, collection, getDocs, signOut, auth } from '../../Database/firebase-config.js';

const urlParams = new URLSearchParams(window.location.search);
const UnitID = doc(db, "Units", urlParams.get('UnitID'));
const UserID = localStorage.getItem('id');

// Document ready function
document.addEventListener("DOMContentLoaded", async () => {
        getProfileData();
        if (UserID == null) {
                Array.from(document.getElementsByClassName("icons")).forEach((item) => {
                        item.classList.add("d-none");
                });
                document.getElementById("LoginIcon").classList.remove("d-none");
                document.getElementById("ErrorOrderMessage").textContent = "Authorization Error: You must Login";
                document.getElementById("ErrorOrder").classList.remove("d-none");
                setTimeout(() => {
                        document.getElementById("ErrorOrder").classList.add("d-none");
                }, 5000);
        } else {
                document.getElementById("LoginIcon").classList.add("d-none");
        }
});

// Get Unit Data and set up carousel with setInterval
(async () => {
        try {
                // Get Unit Data
                const UnitData = await getDoc(UnitID);

                // Check if UnitData exists
                if (UnitData.exists) {
                        const data = UnitData.data();
                        document.getElementById("UnitTitle").textContent = data.title;
                        document.getElementById("UnitDetails").textContent = data.details;
                        document.getElementById("UnitPrice").textContent = data.price + "$";

                        // Assuming `imageUrl` is an array of image URLs
                        const images = data.imageUrl;
                        const carouselInner = document.getElementById("carouselImages");

                        // Clear existing content (if any)
                        carouselInner.innerHTML = "";

                        // Create carousel items dynamically
                        images.forEach((imgUrl, index) => {
                                const carouselItem = document.createElement("div");
                                carouselItem.classList.add("carousel-item");
                                if (index === 0) {
                                        carouselItem.classList.add("active");
                                }

                                const imgElement = document.createElement("img");
                                imgElement.src = imgUrl;
                                imgElement.classList.add("d-block", "w-100");
                                imgElement.alt = `Image ${index + 1}`;

                                carouselItem.appendChild(imgElement);
                                carouselInner.appendChild(carouselItem);
                        });

                        // Automatically change images every 700 milliseconds
                        let currentIndex = 0;
                        const totalImages = images.length;

                        setInterval(() => {
                                // Get all carousel items
                                const carouselItems = document.querySelectorAll("#carouselImages .carousel-item");

                                // Remove the 'active' class from the current image
                                carouselItems[currentIndex].classList.remove("active");

                                // Calculate the next index
                                currentIndex = (currentIndex + 1) % totalImages;

                                // Add the 'active' class to the next image
                                carouselItems[currentIndex].classList.add("active");
                        }, 1500); // Change image every 700 milliseconds

                } else {
                        console.log("This Unit Does Not Exist!!");
                }
        } catch (error) {
                console.error("Error fetching Unit data: ", error);
        }
})();


// Get User data
async function getProfileData() {
        try {
                if (UserID != null) {
                        //Get Profile Data
                        let userDetails = doc(db, "users", UserID.toString());
                        const userData = await getDoc(userDetails);

                        //Update User Profile Data
                        if (userData.exists) {
                                const data = userData.data();
                                document.getElementById("UserName").value = data.name;
                                document.getElementById("PhoneNumber").value = data.phone;
                        } else {
                                console.log("This User Does Not Exist!!");
                        }
                } else {
                        document.getElementById("ErrorOrderMessage").textContent = "Authorization Error: You must Login";
                        document.getElementById("ErrorOrder").classList.remove("d-none");
                        setTimeout(() => {
                                document.getElementById("ErrorOrder").classList.add("d-none");
                        }, 5000);
                }
        } catch (error) {
                console.error("Error fetching profile data: ", error);
        }
};

// Handle booking form submission
document.getElementById('bookingForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting

        // Clear previous error messages
        document.getElementById('dateError').textContent = '';

        // Get form values
        const dateTime = document.getElementById('DateForBooking').value;
        const duration = parseInt(document.getElementById('Duration').value);

        // Convert selected date and time to a Date object
        const selectedDateTime = new Date(dateTime);
        // Get current date and time
        const now = new Date();

        let formIsValid = true;

        // Check if the selected date and time are in the past
        if (selectedDateTime < now) {
                document.getElementById('dateError').textContent = 'The booking date and time cannot be in the past. Please select a valid date and time.';
                formIsValid = false;
        }

        // Check if the duration is within the valid range (1 to 5 hours)
        if (duration < 1 || duration > 5) {
                document.getElementById('dateError').textContent = 'Duration must be between 1 and 5 hours.';
                formIsValid = false;
        }

        // If form is valid, proceed
        if (formIsValid) {
                if (UserID != null) {
                        MackOrder();
                } else {
                        document.getElementById("ErrorOrderMessage").textContent = "Authorization Error: You must Login";
                        document.getElementById("ErrorOrder").classList.remove("d-none");
                        setTimeout(() => {
                                document.getElementById("ErrorOrder").classList.add("d-none");
                        }, 3000);
                }
        }
});

var DatesOfBookedUnits = [];
var HoursOfBookedUnits = [];

// Make Order
async function MackOrder() {
        var index = 0;
        let isValid = true;
        let errorMessage = "";

        // Get form values
        const dateTime = document.getElementById('DateForBooking').value;
        const duration = parseInt(document.getElementById('Duration').value);

        // Validate if date and time are selected
        if (!dateTime || isNaN(duration) || duration <= 0) {
                document.getElementById("ErrorOrder").classList.remove("d-none");
                document.getElementById("ErrorOrderMessage").innerHTML = "Please select a valid date, time, and duration.";
                return;
        }

        // Convert selected date and time to a Date object
        const selectedDateTime = new Date(dateTime);

        // Get the hours and minutes
        const selectedHour = selectedDateTime.getHours();
        const selectedMinute = selectedDateTime.getMinutes();

        const Orders = collection(db, "Orders");
        const q = query(Orders, where("UnitID", "==", UnitID.id));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
                const data = doc.data();
                DatesOfBookedUnits[index] = data.OrderDate;
                HoursOfBookedUnits[index] = data.OrderSelectedHour;
                index++;

                const bookedStartHour = data.OrderSelectedHour;
                const bookedEndHour = bookedStartHour + data.Duration;

                // Check for booking conflicts on the same date
                if (data.OrderDate === selectedDateTime.toDateString()) {
                        if ((selectedHour < bookedEndHour && selectedHour >= bookedStartHour) ||
                                (selectedHour + duration > bookedStartHour && selectedHour < bookedEndHour)) {
                                isValid = false;
                                errorMessage = `This Unit is already reserved on ${data.OrderDate} from ${bookedStartHour}:00 to ${bookedEndHour}:00.`;
                                return;
                        }
                }
        });

        // If valid, proceed with booking
        if (isValid) {
                try {
                        await addDoc(collection(db, "Orders"), {
                                UserID: UserID,
                                UnitID: UnitID.id,
                                OrderDate: selectedDateTime.toDateString(),
                                OrderSelectedHour: selectedHour,
                                OrderSelectedMinute: selectedMinute,
                                Duration: duration
                        }).then(() => {
                                document.getElementById("SuccessOrder").classList.remove("d-none");
                                setTimeout(() => {
                                        document.getElementById("SuccessOrder").classList.add("d-none");
                                }, 4000);
                        }).catch((error) => {
                                console.error("Error Making Order: ", error);
                        });
                } catch (error) {
                        console.error("Error Making Order: ", error);
                }
        } else {
                // Show modal with the conflict table
                displayConflictTable(errorMessage);
        }
}

// Display the conflict message with a table of existing bookings in a modal
function displayConflictTable(errorMessage) {
        const conflictMessage = document.getElementById("conflictMessage");
        const conflictTableBody = document.getElementById("conflictTableBody");

        // Set the error message in the modal
        conflictMessage.textContent = errorMessage;

        // Clear any existing rows in the table body
        conflictTableBody.innerHTML = '';

        // Populate the table with booked dates and hours
        for (let i = 0; i < DatesOfBookedUnits.length; i++) {
                let row = `<tr><td>${DatesOfBookedUnits[i]}</td><td>${HoursOfBookedUnits[i]}:00</td></tr>`;
                conflictTableBody.innerHTML += row;
        }

        // Show the modal
        const conflictModal = new bootstrap.Modal(document.getElementById('conflictModal'));
        conflictModal.show();
}

// Logout function
document.getElementById("Logout").addEventListener("click", () => {
        signOut(auth).then(() => {
                localStorage.clear();
                window.location.href = '../../Authentication/register/index.html';
        });
});

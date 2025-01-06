import { db, getDoc, doc, query, where, addDoc, collection, getDocs, signOut, auth } from '../../Database/firebase-config.js';

// Base64 Decoding Function
function decodeBase64(str) {
        return decodeURIComponent(escape(atob(str)));
}

// Fetch the unit ID from the URL and decode it
const urlParams = new URLSearchParams(window.location.search);
const encodedUnitID = urlParams.get('UnitID');
const unitID = decodeBase64(encodedUnitID); // Decode the UnitID
const UnitID = doc(db, "Units", unitID);
const UserID = localStorage.getItem('id');

let UnitPrice;
let UnitImages;
document.addEventListener("DOMContentLoaded", async () => {
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
        await getProfileData();
        handleLoginState();
        fetchUnitData();
});

async function getProfileData() {
        if (!UserID) {
                showError("Authorization Error: You must Login");
                return;
        }

        try {
                const userDetails = doc(db, "users", UserID.toString());
                const userData = await getDoc(userDetails);

                if (userData.exists) {
                        const data = userData.data();
                        document.getElementById("UserName").value = data.name;
                        document.getElementById("PhoneNumber").value = data.phone;
                } else {
                        console.log("This User Does Not Exist!!");
                }
        } catch (error) {
                console.error("Error fetching profile data: ", error);
        }
}

function handleLoginState() {
        const icons = Array.from(document.getElementsByClassName("icons"));
        if (!UserID) {
                icons.forEach(item => item.classList.add("d-none"));
                document.getElementById("Login").classList.remove("d-none");
                showError("Authorization Error: You must Login");
        } else {
                document.getElementById("Login").classList.add("d-none");
        }
}

async function fetchUnitData() {
        try {
                const unitData = await getDoc(UnitID);

                if (unitData.exists) {
                        const data = unitData.data();
                        UnitPrice = data.price;
                        UnitImages = data.imageUrl
                        document.getElementById("UnitTitle").textContent = data.title;
                        document.getElementById("UnitDetails").textContent = data.details;
                        document.getElementById("UnitPrice").textContent = `${data.price} CHF`;

                        setupCarousel(data.imageUrl);
                } else {
                        console.log("This Unit Does Not Exist!!");
                }
        } catch (error) {
                console.error("Error fetching Unit data: ", error);
        }
}

function setupCarousel(images) {
        const carouselInner = document.getElementById("carouselImages");
        carouselInner.innerHTML = "";

        images.forEach((imgUrl, index) => {
                const carouselItem = document.createElement("div");
                carouselItem.classList.add("carousel-item");
                if (index === 0) carouselItem.classList.add("active");

                const imgElement = document.createElement("img");
                imgElement.src = imgUrl;
                imgElement.classList.add("d-block", "w-100");
                imgElement.alt = `Image ${index + 1}`;

                carouselItem.appendChild(imgElement);
                carouselInner.appendChild(carouselItem);
        });

        let currentIndex = 0;
        const totalImages = images.length;

        setInterval(() => {
                const carouselItems = document.querySelectorAll("#carouselImages .carousel-item");
                carouselItems[currentIndex].classList.remove("active");
                currentIndex = (currentIndex + 1) % totalImages;
                carouselItems[currentIndex].classList.add("active");
        }, 1500);
}

document.getElementById('bookingForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const dateTime = document.getElementById('DateForBooking').value;
        const duration = parseInt(document.getElementById('Duration').value);
        const selectedDateTime = new Date(dateTime);
        const now = new Date();

        let formIsValid = true;
        let errorMessage = "";

        if (selectedDateTime < now) {
                errorMessage = 'The booking date and time cannot be in the past. Please select a valid date and time.';
                formIsValid = false;
        }

        if (duration < 1 || duration > 5) {
                errorMessage = 'Duration must be between 1 and 5 hours.';
                formIsValid = false;
        }

        if (formIsValid) {
                if (UserID) {
                        await makeOrder(selectedDateTime, duration);
                } else {
                        showError("Authorization Error: You must Login");
                }
        } else {
                document.getElementById('dateError').textContent = errorMessage;
        }
});


async function makeOrder(selectedDateTime, duration) {
        try {
                // Split duration into hours and minutes
                const hours = Math.floor(duration);
                const minutes = Math.round((duration - hours) * 60);

                // Validate duration
                if (hours < 1 || hours > 5 || minutes < 0 || minutes >= 60) {
                        showError('Duration must be between 1 and 5 hours and can include fractional hours (e.g., 1.5 hours).');
                        return;
                }

                const Orders = collection(db, "Orders");
                const q = query(Orders, where("UnitID", "==", UnitID.id));
                const querySnapshot = await getDocs(q);

                let isValid = true;
                let errorMessage = "";
                const selectedHour = selectedDateTime.getHours();
                const selectedMinute = selectedDateTime.getMinutes();

                // Calculate end time based on duration
                const endDateTime = new Date(selectedDateTime);
                endDateTime.setHours(selectedHour + hours);
                endDateTime.setMinutes(selectedMinute + minutes);

                const endHour = endDateTime.getHours();
                const endMinute = endDateTime.getMinutes();

                const bookedDates = [];
                const bookedStartTimes = [];
                const bookedEndTimes = [];

                querySnapshot.forEach(doc => {
                        const data = doc.data();
                        const bookedStartHour = data.OrderSelectedHour;
                        const bookedStartMinute = data.OrderSelectedMinute || 0;
                        const bookedDuration = data.Duration;
                        const bookedEndDateTime = new Date(selectedDateTime);
                        bookedEndDateTime.setHours(bookedStartHour + Math.floor(bookedDuration));
                        bookedEndDateTime.setMinutes(bookedStartMinute + ((bookedDuration % 1) * 60));

                        const bookedEndHour = bookedEndDateTime.getHours();
                        const bookedEndMinute = bookedEndDateTime.getMinutes();

                        bookedDates.push(data.OrderDate);
                        bookedStartTimes.push({ hour: bookedStartHour, minute: bookedStartMinute });
                        bookedEndTimes.push({ hour: bookedEndHour, minute: bookedEndMinute });

                        // Check for conflicts
                        if (data.OrderDate === selectedDateTime.toDateString()) {
                                const isOverlapping =
                                        (selectedHour < bookedEndHour || (selectedHour === bookedEndHour && selectedMinute < bookedEndMinute)) &&
                                        (endHour > bookedStartHour || (endHour === bookedStartHour && endMinute > bookedStartMinute));

                                if (isOverlapping) {
                                        isValid = false;
                                        errorMessage = `This Unit is already reserved on ${data.OrderDate} from ${bookedStartHour}:${bookedStartMinute < 10 ? '0' : ''}${bookedStartMinute} to ${bookedEndHour}:${bookedEndMinute < 10 ? '0' : ''}${bookedEndMinute}`;
                                }
                        }
                });

                if (isValid) {
                        const docRef = await addDoc(collection(db, "Orders"), {
                                UserID: UserID,
                                UnitID: UnitID.id,
                                OrderDate: selectedDateTime.toDateString(),
                                OrderSelectedHour: selectedHour,
                                OrderSelectedMinute: selectedMinute,
                                Duration: duration, // Store duration as hours (e.g., 1.5 for 1 hour 30 minutes)
                                OrderStatus: "Pending",
                                UnitPrice: UnitPrice,
                                UnitImages: UnitImages
                        });
                        showSuccess("Order successfully placed!");
                        const documentId = docRef.id;
                        window.location.href = `./../payment/index.html?Order=${documentId}`;
                } else {
                        displayConflictTable(errorMessage, bookedDates, bookedStartTimes, bookedEndTimes);
                }
        } catch (error) {
                console.error("Error Making Order: ", error);
        }
}

function displayConflictTable(errorMessage, dates, startTimes, endTimes) {
        const conflictMessage = document.getElementById("conflictMessage");
        const conflictTableBody = document.getElementById("conflictTableBody");

        conflictMessage.textContent = errorMessage;
        conflictTableBody.innerHTML = '';

        for (let i = 0; i < dates.length; i++) {
                let row = `<tr>
                <td>${dates[i]}</td>
                <td>${startTimes[i].hour}:${startTimes[i].minute < 10 ? '0' : ''}${startTimes[i].minute}</td>
                <td>${endTimes[i].hour}:${endTimes[i].minute < 10 ? '0' : ''}${endTimes[i].minute}</td>
            </tr>`;
                conflictTableBody.innerHTML += row;
        }

        const conflictModal = new bootstrap.Modal(document.getElementById('conflictModal'));
        conflictModal.show();

        document.getElementById('conflictModal').addEventListener('hidden.bs.modal', () => {
                suggestAlternativeUnits(errorMessage);
        });
}



async function suggestAlternativeUnits(errorMessage) {
        try {
                const dateTime = document.getElementById('DateForBooking').value;
                const selectedDate = new Date(dateTime);

                const UnitsCollection = collection(db, "Units");
                const querySnapshot = await getDocs(UnitsCollection);

                const modalBody = document.getElementById('alternativeUnitsBody');
                modalBody.innerHTML = '';

                let foundUnit = false;

                for (const doc of querySnapshot.docs) {
                        if (foundUnit) break;

                        const Unitdata = doc.data();

                        const Orders = collection(db, "Orders");
                        const q = query(Orders, where("UnitID", "==", doc.id));
                        const orderSnapshot = await getDocs(q);

                        let isAvailable = true;

                        for (const orderDoc of orderSnapshot.docs) {
                                const data = orderDoc.data();

                                if (
                                        data.OrderDate === selectedDate.toDateString() &&
                                        data.OrderSelectedHour === selectedDate.getHours()
                                ) {
                                        isAvailable = false;
                                        break;
                                }
                        }

                        if (isAvailable) {
                                foundUnit = true;

                                // Create a container for the unit details
                                const unitContainer = document.createElement('div');
                                unitContainer.classList.add('unit-container'); // Add a class for styling

                                // Add the unit image
                                const unitImage = document.createElement('img');
                                unitImage.src = Unitdata.imageUrl; // Assuming Unitdata.imageUrl contains the image URL
                                unitImage.alt = `${Unitdata.title} image`;
                                unitImage.style.width = '200px'; // Set a default width
                                unitImage.style.height = 'auto'; // Maintain aspect ratio

                                // Create a link to go to the Unit
                                const encodedUnitID = btoa(doc.id); // Base64 encoding of UnitID
                                const UnitLink = document.createElement('a');
                                UnitLink.href = `./index.html?UnitID=${encodedUnitID}`;
                                UnitLink.textContent = "Go To Unit";
                                UnitLink.style.display = 'block';

                                // Add the unit details
                                const unitDetails = document.createElement('p');
                                unitDetails.textContent = `${Unitdata.title} - CHF{Unitdata.price}CHF`;

                                // Append the details, image, and link to the container
                                unitContainer.appendChild(unitImage);
                                unitContainer.appendChild(unitDetails);
                                unitContainer.appendChild(UnitLink);

                                // Append the container to the modal body
                                modalBody.appendChild(unitContainer);

                                console.log(Unitdata);
                        }



                }

                document.getElementById('alternativeUnitsTitle').textContent =
                        foundUnit
                                ? "This unit is unavailable. Here is an alternative:"
                                : "No alternative units available.";
                document.getElementById("conflictMessage").textContent = errorMessage;

                const conflictModal = new bootstrap.Modal(document.getElementById('alternativeUnitsModal'));
                conflictModal.show();
        } catch (error) {
                console.error("Error suggesting alternative units: ", error);
        }
}



function showError(message) {
        document.getElementById("ErrorOrderMessage").textContent = message;
        document.getElementById("ErrorOrder").classList.remove("d-none");
        setTimeout(() => {
                document.getElementById("ErrorOrder").classList.add("d-none");
        }, 5000);
}

function showSuccess(message) {
        document.getElementById("SuccessOrder").textContent = message;
        document.getElementById("SuccessOrder").classList.remove("d-none");
        setTimeout(() => {
                document.getElementById("SuccessOrder").classList.add("d-none");
        }, 5000);
}

// Logout function
document.getElementById("Logout").addEventListener("click", () => {
        signOut(auth).then(() => {
                localStorage.clear();
                window.location.href = '../../Authentication/register/index.html';
        });
});

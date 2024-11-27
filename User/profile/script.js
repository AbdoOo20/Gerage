import { db, setDoc, deleteDoc, collection, getDoc, getDocs, updateDoc, doc, signOut, auth, query, where, storage, ref, uploadBytes, getDownloadURL } from '../../Database/firebase-config.js';

// User Data
var UserName = document.getElementById("UserName");
var UserEmail = document.getElementById("UserEmail");
var UserPhone = document.getElementById("UserPhone");

// Call the function to get profile data when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    if (UserID == null) {
        Array.from(document.getElementsByClassName("icons")).forEach((item) => {
            item.classList.add("d-none");
        });
        document.getElementById("Login").classList.remove("d-none");
    } else {
        document.getElementById("Login").classList.add("d-none");
    }
    getProfileData();
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

// Function to get and set profile data
const UserID = localStorage.getItem('id');
async function getProfileData() {
    try {
        if (UserID != null) {
            let userDetails = doc(db, "users", UserID.toString());
            const userData = await getDoc(userDetails);

            if (userData.exists) {
                const data = userData.data();
                UserName.value = data.name || "N/A";
                UserEmail.value = data.email || "N/A";
                UserPhone.value = data.phone || "N/A";
            } else {
                console.log("This User Does Not Exist!!");
            }
        }
    } catch (error) {
        console.error("Error fetching profile data: ", error);
    }
}

// Edit Profile button
document.getElementById("EditBtn").addEventListener("click", () => {
    if (UserID == null) {
        displayAuthorizationError();
        return;
    }

    UserName.removeAttribute("readonly");
    UserEmail.removeAttribute("readonly");
    document.getElementById("EditBtn").classList.add("d-none");
    document.getElementById("SaveBtn").classList.remove("d-none");
    UserName.focus();
});

// Save Edited Data
document.getElementById("SaveBtn").addEventListener("click", async () => {
    await saveProfileDataEdited();
});

// Save Profile Data Edited
async function saveProfileDataEdited() {
    if (!validateProfileData()) {
        return;
    }

    try {
        if (UserID != null) {
            let userDetails = doc(db, "users", UserID);
            await updateDoc(userDetails, {
                name: UserName.value.trim(),
                email: UserEmail.value.trim(),
                phone: UserPhone.value.trim()
            });
            displaySuccessMessage();
        } else {
            displayAuthorizationError();
        }
    } catch (error) {
        console.error("Error updating profile data: ", error);
    }
}

// Validation
function clearErrorMessages() {
    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("phoneError").textContent = "";
}

function validateProfileData() {
    clearErrorMessages();

    const name = UserName.value.trim();
    const email = UserEmail.value.trim();
    const phone = UserPhone.value.trim();
    let isValid = true;

    if (!name) {
        document.getElementById("nameError").textContent = "Name field cannot be empty.";
        isValid = false;
    } else if (name.length <= 3) {
        document.getElementById("nameError").textContent = "Name must be more than 3 characters long.";
        isValid = false;
    }

    if (!email) {
        document.getElementById("emailError").textContent = "Email field cannot be empty.";
        isValid = false;
    } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            document.getElementById("emailError").textContent = "Please enter a valid email address.";
            isValid = false;
        }
    }

    if (!phone) {
        document.getElementById("phoneError").textContent = "Phone field cannot be empty.";
        isValid = false;
    } else {
        const phonePattern = /^[0-9]{10}$/;
        if (!phonePattern.test(phone)) {
            document.getElementById("phoneError").textContent = "Please enter a valid 10-digit phone number.";
            isValid = false;
        }
    }

    return isValid;
}

function displaySuccessMessage() {
    document.getElementById("dataUpdatedsuccessfully").classList.remove("d-none");
    setTimeout(() => {
        document.getElementById("dataUpdatedsuccessfully").classList.add("d-none");
    }, 3000);

    UserName.setAttribute("readonly", true);
    UserEmail.setAttribute("readonly", true);
    UserPhone.setAttribute("readonly", true);

    document.getElementById("SaveBtn").classList.add("d-none");
    document.getElementById("EditBtn").classList.remove("d-none");
}

function displayAuthorizationError() {
    const errorElement = document.getElementById("ErrorOrderMessage");
    const errorContainer = document.getElementById("ErrorOrder");

    errorElement.textContent = "Authorization Error: You must log in.";
    errorContainer.classList.remove("d-none");
    setTimeout(() => {
        errorContainer.classList.add("d-none");
    }, 5000);
}

// Logout Functionality
document.getElementById("Logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        localStorage.clear();
        window.location.href = '../../Authentication/register/index.html';
    });
});

// Orders Section
const superOrder = document.getElementById("superOrder");
var ordersData = [];

document.getElementById("ShowOrders").addEventListener("click", async () => {
    if (UserID == null) {
        displayAuthorizationError();
        return;
    }

    try {
        const Orders = collection(db, "Orders");
        const q = query(Orders, where("UserID", "==", UserID));
        const querySnapshot = await getDocs(q);

        ordersData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            ordersData.push({
                OrderID: doc.id,
                OrderDate: data.OrderDate,
                OrderSelectedHour: data.OrderSelectedHour,
                Duration: data.Duration,
                UnitID: data.UnitID,
                OrderStatus: data.OrderStatus
            });
        });

        superOrder.innerHTML = '';

        if (ordersData.length === 0) {
            document.getElementById('noOrdersMessage').classList.remove('d-none');
        } else {
            document.getElementById('noOrdersMessage').classList.add('d-none');
        }

        for (const order of ordersData) {
            const Unit_ID = doc(db, "Units", order.UnitID);
            const UnitData = await getDoc(Unit_ID);

            if (!UnitData.exists()) {
                console.warn(`Unit with ID ${order.UnitID} does not exist.`);
                continue;
            }

            const data = UnitData.data();

            // Debugging UnitImages
            //console.log("Full Unit Data:", data);
            //console.log("UnitImages Array:", data.UnitImages);

            // Handle the first image URL or provide a default image
            const firstImageUrl = data.imageUrl
                && data.imageUrl.length > 0 ? data.imageUrl[0]
                : 'https://via.placeholder.com/200x150?text=No+Image'; // Placeholder image URL

            //console.log("First Image URL (computed):", firstImageUrl);

            const cardDiv = document.createElement('div');
            cardDiv.classList.add("d-flex", "align-items-start", "border", "border-2", "m-2", "p-2", "rounded");
            if (order.OrderStatus === "Paid") {
                const dateNow = new Date();
                var orderDate = new Date(order.OrderDate);
                var state = dateNow > orderDate ? "Confirmed" : "Paid";
                cardDiv.innerHTML = `
                <div class="flex-grow-1">
                    <h5 class="card-title">Unit: ${data.title}</h5>
                    <p class="card-text"><strong>Date:</strong> ${order.OrderDate}</p>
                    <p class="card-text"><strong>Start Time:</strong> ${order.OrderSelectedHour}</p>
                    <p class="card-text"><strong>Duration:</strong> ${order.Duration} hours</p>
                    <p class="card-text"><strong>Status:</strong> ${state}</p>
                </div>
                <img src="${firstImageUrl}" alt="Order Image" class="img-fluid rounded ms-3" style="max-width: 200px; max-height: 150px; object-fit: cover;">
            `;
            }
            else {
                cardDiv.innerHTML = `
                <div class="flex-grow-1">
                    <h5 class="card-title">Unit: ${data.title}</h5>
                    <p class="card-text"><strong>Date:</strong> ${order.OrderDate}</p>
                    <p class="card-text"><strong>Start Time:</strong> ${order.OrderSelectedHour}</p>
                    <p class="card-text"><strong>Duration:</strong> ${order.Duration} hours</p>
                    <p class="card-text"><strong>Status:</strong> ${order.OrderStatus}</p>
                    
                    <input id="buy-${order.OrderID}" data-OrderID="${order.OrderID}" type="button" class="btn text-white me-2" value="Buy" />
                    <input id="cancel-${order.OrderID}" data-OrderID="${order.OrderID}" type="button" class="btn text-white" value="Cancel" />
                </div>
                <img src="${firstImageUrl}" alt="Order Image" class="img-fluid rounded ms-3" style="max-width: 200px; max-height: 150px; object-fit: cover;">
            `;
            }
            superOrder.appendChild(cardDiv);
            const currentDate = new Date();
            // Add border color based on order status
            switch (order.OrderStatus) {
                case "Pending":
                    cardDiv.classList.add("border-warning");
                    break;
                case "Paid":
                    const orderDate = new Date(order.OrderDate);
                    if (currentDate > orderDate) {
                        cardDiv.classList.add("border-success");
                    } else {
                        cardDiv.classList.add("border-info");
                    }
                    break;
            }

            if (order.OrderStatus !== "Paid") {
                // Add event listener for Buy button
                document.getElementById(`buy-${order.OrderID}`).addEventListener("click", () => {
                    window.location = `../payment/index.html?Order=${order.OrderID}`;
                });

                // Add event listener for Cancel button
                document.getElementById(`cancel-${order.OrderID}`).addEventListener("click", async () => {
                    try {
                        const orderDocRef = doc(db, "Orders", order.OrderID);
                        await deleteDoc(orderDocRef);
                        cardDiv.remove();

                        const cancelAlertDiv = document.getElementById("cancelAlert");
                        cancelAlertDiv.classList.remove("d-none");
                        cancelAlertDiv.textContent = "Order has been successfully canceled.";
                        setTimeout(() => {
                            cancelAlertDiv.classList.add("d-none");
                        }, 3000);
                    } catch (error) {
                        console.error("Error deleting order: ", error);
                    }
                });
            }

            // Add event listener for file upload
            document.getElementById("uploadBtn").addEventListener("click", async () => {
                const fileInput = document.getElementById("formFile");
                const file = fileInput.files[0];

                if (file) {
                    // Validate file size and type
                    if (file.size > 2 * 1024 * 1024) {
                        alert("File size exceeds 2MB.");
                        return;
                    }

                    const validExtensions = ["image/jpeg", "image/png", "image/jpg"];
                    if (!validExtensions.includes(file.type)) {
                        alert("Please upload a valid image file.");
                        return;
                    }

                    const storageRef = ref(storage, `Orders/${file.name}`);

                    try {
                        // Upload file and get its URL
                        const snapshot = await uploadBytes(storageRef, file);
                        const downloadURL = await getDownloadURL(snapshot.ref);

                        // Update Firestore with the uploaded image URL
                        const orderDocRef = doc(db, "Orders", order.OrderID);
                        await updateDoc(orderDocRef, {
                            imageUrl: downloadURL,
                            uploadedAt: new Date().toDateString()
                        });

                        // Hide the upload modal
                        const currentModalElement = document.getElementById("UploadImag");
                        const currentModalInstance = bootstrap.Modal.getInstance(currentModalElement);
                        currentModalInstance.hide();

                        // Show the uploaded image in another modal
                        const modalImage = document.getElementById("modalImage");
                        modalImage.src = downloadURL;

                        const imageModalElement = document.getElementById("imageModal");
                        const imageModalInstance = new bootstrap.Modal(imageModalElement);
                        imageModalInstance.show();

                    } catch (error) {
                        console.error("Error uploading file:", error);
                        alert("Failed to upload image.");
                    }
                } else {
                    alert("Please select an image first.");
                }
            });
        }



    } catch (error) {
        console.error("Error fetching orders: ", error);
    }
});

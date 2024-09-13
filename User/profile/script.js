import { db, setDoc, deleteDoc, collection, getDoc, getDocs, updateDoc, doc, signOut, auth, query, where, storage, ref, uploadBytes, getDownloadURL } from '../../Database/firebase-config.js';

//User Data
var UserName = document.getElementById("UserName");
var UserEmail = document.getElementById("UserEmail");
var UserPhone = document.getElementById("UserPhone");

// Call the function to get profile data when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    if (UserID == null) {
        Array.from(document.getElementsByClassName("icons")).forEach((item) => {
            item.classList.add("d-none");
        });
        document.getElementById("LoginIcon").classList.remove("d-none");
    } else {
        document.getElementById("LoginIcon").classList.add("d-none");
    }
    getProfileData();

});

// Function to get and Set profile data
const UserID = localStorage.getItem('id');
async function getProfileData() {
    try {
        if (UserID != null) {
            //Get Profile Data
            let userDetails = doc(db, "users", UserID.toString());
            const userData = await getDoc(userDetails);

            //Update User Profile Data
            if (userData.exists) {
                const data = userData.data();
                UserName.value = data.name;
                if (!data.email)
                    UserEmail.value = "N/A";
                else UserEmail.value = data.email;
                UserPhone.value = data.phone;
            }
            else
                console.log("This User Dose Not Exists!!");
        }
    }
    catch (error) {
        console.error("Error fetching profile data: ", error);
    }
}

//Edit Profile button
document.getElementById("EditBtn").addEventListener("click", () => {
    if (UserID == null) {
        document.getElementById("ErrorOrderMessage").textContent = "Authorization Error: You must Login";
        document.getElementById("ErrorOrder").classList.remove("d-none");
        setTimeout(() => {
            document.getElementById("ErrorOrder").classList.add("d-none");
        }, 5000);
    }
    UserName.removeAttribute("readonly");
    UserEmail.removeAttribute("readonly");
    // UserPhone.removeAttribute("readonly");
    document.getElementById("EditBtn").classList.add("d-none");
    document.getElementById("SaveBtn").classList.remove("d-none");
    UserName.focus();
});

//Save Edited Data
document.getElementById("SaveBtn").addEventListener("click", async () => {
    await SaveProfileDataEdited();
});


//Save Profile Data Edited
async function SaveProfileDataEdited() {
    // Call the validation function
    if (!validateProfileData()) {
        return; // If validation fails, do not proceed with saving the data
    }

    try {
        if (UserID != null) {
            // Reference to the user's document
            let userDetails = doc(db, "users", UserID);

            // Update the document with new data
            await updateDoc(userDetails, {
                name: UserName.value.trim(),
                email: UserEmail.value.trim(),
                phone: UserPhone.value.trim()
            });
            Updatedsuccessfully();
        } else {
            document.getElementById("ErrorOrderMessage").textContent = "Authorization Error: You must Login";
            document.getElementById("ErrorOrder").classList.remove("d-none");
            setTimeout(() => {
                document.getElementById("ErrorOrder").classList.add("d-none");
            }, 5000);
        }

    } catch (error) {
        console.error("Error updating profile data: ", error);
    }
}

//validation Checking
function clearErrorMessages() {
    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("phoneError").textContent = "";
}

function validateProfileData() {
    // Clear any previous error messages
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
        // Simple email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            document.getElementById("emailError").textContent = "Please enter a valid email address.";
            isValid = false;
        }
    }

    if (!phone) {
        document.getElementById("phoneError").textContent = "Phone field cannot be empty.";
        isValid = false;
    }

    return isValid;
}

function Updatedsuccessfully() {
    // Show success message
    document.getElementById("dataUpdatedsuccessfully").classList.remove("d-none");
    setTimeout(() => {
        document.getElementById("dataUpdatedsuccessfully").classList.add("d-none");
    }, 3000);

    // Set fields to read-only
    document.getElementById("UserName").setAttribute("readonly", true);
    document.getElementById("UserEmail").setAttribute("readonly", true);
    document.getElementById("UserPhone").setAttribute("readonly", true);

    // Hide Save button and show Edit button
    document.getElementById("SaveBtn").classList.add("d-none");
    document.getElementById("EditBtn").classList.remove("d-none");
}

document.getElementById("Logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        localStorage.clear();
        window.location.href = '../../Authentication/login/index.html';
    });
})



const superOrder = document.getElementById("superOrder");
var ordersData = [];

document.getElementById("ShowOrders").addEventListener("click", async () => {
    const errorOrderElement = document.getElementById("ErrorOrderMessage");
    const errorOrderContainer = document.getElementById("ErrorOrder");

    if (UserID == null) {
        errorOrderElement.textContent = "Authorization Error: You must Login";
        errorOrderContainer.classList.remove("d-none");
        setTimeout(() => {
            errorOrderContainer.classList.add("d-none");
        }, 5000);
        return;
    }

    try {
        // Fetch orders for the user
        const Orders = collection(db, "Orders");
        const q = query(Orders, where("UserID", "==", UserID));
        const querySnapshot = await getDocs(q);

        // Clear existing orders data
        ordersData = [];

        // Process each order
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const OrderID = doc.id;
            ordersData.push({
                OrderID: OrderID,
                OrderDate: data.OrderDate,
                OrderSelectedHour: data.OrderSelectedHour,
                Duration: data.Duration,
                UnitID: data.UnitID,
                OrderStatus: data.OrderStatus
            });
        });

        // Clear existing cards in the container
        superOrder.innerHTML = '';

        // Check if no orders were found
        if (ordersData.length === 0) {
            // Display "No orders found" message
            document.getElementById('noOrdersMessage').classList.remove('d-none');
        } else {
            // Hide "No orders found" message if there are orders
            document.getElementById('noOrdersMessage').classList.add('d-none');
        }

        // Create cards for each order
        for (const order of ordersData) {
            try {
                // Fetch unit data
                const Unit_ID = doc(db, "Units", order.UnitID);
                const UnitData = await getDoc(Unit_ID);

                if (!UnitData.exists()) {
                    console.warn(`Unit with ID ${order.UnitID} does not exist.`);
                    continue; // Skip to the next order
                }

                const data = UnitData.data();

                // Create a div for the card
                const cardDiv = document.createElement('div');
                cardDiv.classList.add("col-12", "border", "border-2", "m-2", "p-2", "rounded");

                // Create card content with unique input IDs
                cardDiv.innerHTML = `
                  <h5 class="card-title">Order Room Title: ${data.title}</h5>
                  <br>
                  <p class="card-text"><strong>Order Date:</strong> ${order.OrderDate}</p>
                  <p class="card-text"><strong>Start Time:</strong> ${order.OrderSelectedHour}</p>
                  <p class="card-text"><strong>Duration:</strong> ${order.Duration} hours</p>
                  <p class="card-text"><strong>Order Status:</strong> ${order.OrderStatus}</p>
                  <input id="buy-${order.OrderID}" data-OrderID="${order.OrderID}" type="button" class="btn text-white" value="Buy" />
                  <input id="cancel-${order.OrderID}" data-OrderID="${order.OrderID}" type="button" class="btn text-white" value="Cancel" />
                  <button type="button" data-bs-toggle="modal" data-bs-target="#UploadImag" id="UploadImage-${order.OrderID}" data-OrderID="${order.OrderID}" class="btn text-white">
                  Upload Payment receipt
                  </button>
                `;

                // Append the card to the container
                superOrder.appendChild(cardDiv);

                // Change border color and button visibility based on order status
                switch (order.OrderStatus) {
                    case "Pending":
                        cardDiv.classList.add("border-warning");
                        break;
                    case "Confirmed":
                        cardDiv.classList.add("border-success");
                        document.getElementById(`buy-${order.OrderID}`).classList.add("d-none");
                        document.getElementById(`cancel-${order.OrderID}`).classList.add("d-none");
                        document.getElementById(`UploadImage-${order.OrderID}`).classList.add("d-none");
                        break;
                }

                // Event listener for showing the modal and handling file upload
                document.getElementById("uploadBtn").addEventListener('click', async () => {
                    const fileInput = document.getElementById('formFile');
                    const file = fileInput.files[0];

                    if (file) {
                        const storageRef = ref(storage, 'Orders/' + file.name); // Define the storage path

                        try {
                            // Upload the file to Firebase Storage
                            const snapshot = await uploadBytes(storageRef, file);

                            // Get the file's URL
                            const downloadURL = await getDownloadURL(snapshot.ref);

                            // Save the URL to Firestore
                            const orderDocRef = doc(db, "Orders", order.OrderID);
                            await updateDoc(orderDocRef, {
                                imageUrl: downloadURL,
                                uploadedAt: new Date().toDateString()
                            });

                            // Show success message
                            document.getElementById('uploadSuccessMessage').classList.remove('d-none');
                            setTimeout(() => {
                                document.getElementById('uploadSuccessMessage').classList.add('d-none');
                            }, 3000);

                            // Hide the modal after successful upload
                            const modalElement = document.getElementById('UploadImag'); // Get the modal element
                            const modalInstance = bootstrap.Modal.getInstance(modalElement); // Bootstrap modal instance
                            modalInstance.hide(); // Hide the modal

                        } catch (error) {
                            console.error('Error uploading file:', error);
                            alert('Failed to upload image.');
                        }
                    } else {
                        alert('Please select an image first.');
                    }
                });

                // Event listener for 'Buy' button
                document.getElementById(`buy-${order.OrderID}`).addEventListener("click", () => {
                    window.location = `../Payments/Payment.html?Order=${order.OrderID}`;
                });

                // Event listener for 'Cancel' button
                document.getElementById(`cancel-${order.OrderID}`).addEventListener("click", async () => {
                    try {
                        // Reference to the Firestore document to delete
                        const orderDocRef = doc(db, "Orders", order.OrderID);

                        // Delete the document
                        await deleteDoc(orderDocRef);

                        // Remove the card from the DOM
                        cardDiv.remove();

                        // Show the "Order Canceled" alert
                        const cancelAlertDiv = document.getElementById("cancelAlert");
                        cancelAlertDiv.classList.remove("d-none");
                        cancelAlertDiv.textContent = "Order has been successfully canceled.";

                        // Hide the alert after 3 seconds
                        setTimeout(() => {
                            cancelAlertDiv.classList.add("d-none");
                        }, 3000);

                    } catch (error) {
                        console.error("Error deleting order: ", error);
                    }
                });


            } catch (error) {
                console.error("Error processing order: ", error);
            }
        }

    } catch (error) {
        console.error("Error fetching orders: ", error);
    }


});

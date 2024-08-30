import { db, collection, getDoc, getDocs, updateDoc, doc, signOut, auth } from '../../Database/firebase-config.js';

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
                UserEmail.value = data.email;
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
    UserPhone.removeAttribute("readonly");
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
document.getElementById("ShowOrders").addEventListener("click", async () => {
    if (UserID == null) {
        document.getElementById("ErrorOrderMessage").textContent = "Authorization Error: You must Login";
        document.getElementById("ErrorOrder").classList.remove("d-none");
        setTimeout(() => {
            document.getElementById("ErrorOrder").classList.add("d-none");
        }, 5000);
    } else {
        const Orders = collection(db, "Orders");
        const querySnapshot = await getDocs(Orders);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            //const UnitData = await getDoc(data.UnitID);
            const itemHTML = `
                        <div class="col-12 mt-2">
                        <div class="card product-card">
                        <div class="card-body">
                            <a class="text-dark text-decoration-none" href="../unit/index.html?UnitID=${doc.id}">
                            <h5 class="card-title">Order Date: ${data.OrderDate}</h5>
                            </a>
                        </div>
                        </div>
                        </div>
                    `;
            //<img src=${UnitData.imageUrl} alt="Product Image" class="card-img-top product-image">
            //<p class="card-text"><strong>${UnitData.price} $</strong></p>

            superOrder.insertAdjacentHTML('beforeend', itemHTML);
        });
    }
})
import { db, getDoc, updateDoc, doc } from '../../Database/firebase-config.js';

//User Data
var UserName = document.getElementById("UserName");
var UserEmail = document.getElementById("UserEmail");
var UserPhone = document.getElementById("UserPhone");

// Call the function to get profile data when the page loads
document.addEventListener("DOMContentLoaded", getProfileData);

// Function to get and Set profile data
async function getProfileData() {
    try {
        //Get Profile Data
        let userDetails = doc(db, "users", "sNmzeOAe2Tc8eVMNm2ZD32UJrjg2"); // Need UID from previous page or URLPrams Or Cookies
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
    catch (error) {
        console.error("Error fetching profile data: ", error);
    }
}

//Edit Profile button
document.getElementById("EditBtn").addEventListener("click", () => {
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
        // Reference to the user's document
        let userDetails = doc(db, "users", "sNmzeOAe2Tc8eVMNm2ZD32UJrjg2"); // Need UID from previous page or URLParams or Cookies

        // Update the document with new data
        await updateDoc(userDetails, {
            name: UserName.value.trim(),
            email: UserEmail.value.trim(),
            phone: UserPhone.value.trim()
        });
        Updatedsuccessfully();
    } catch (error) {
        console.error("Error updating profile data: ", error);
        alert("An error occurred while updating the profile. Please try again.");
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
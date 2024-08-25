import { db,  getDoc, doc } from '../../Database/firebase-config.js';

// Function to get and Set profile data
async function getProfileData() {
    try {
        //Get Profile Data
        let userDetails = doc(db, "users", "sNmzeOAe2Tc8eVMNm2ZD32UJrjg2"); // Need UID from previous page or URLPrams Or Cookies
        const userData = await getDoc(userDetails);
        
        //Update User Profile Data
        if (userData.exists) {
            const data = userData.data();
            document.getElementById("UserName").innerText = data.name;
            document.getElementById("UserEmail").innerText = data.email;
            document.getElementById("UserPhone").innerText = data.phone;
        }
        else
            console.log("This User Dose Not Exists!!");
    }
    catch (error) {
        console.error("Error fetching profile data: ", error);
    }
}

// Call the function to get profile data when the page loads
document.addEventListener("DOMContentLoaded", getProfileData);

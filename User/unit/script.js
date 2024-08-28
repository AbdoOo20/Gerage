import { db, getDoc, doc, query, where, addDoc, collection, getDocs } from '../../Database/firebase-config.js';
const urlParams = new URLSearchParams(window.location.search);
const UnitID = doc(db, "Units", urlParams.get('UnitID'));
const UserID = localStorage.getItem('id');

// Get Unit Data
(async () => {
        try {
                //Get Unit Data
                const UnitData = await getDoc(UnitID);

                //Update Unit Data
                if (UnitData.exists) {
                        const data = UnitData.data();
                        document.getElementById("UnitTitle").textContent = data.title;
                        document.getElementById("UnitImg").src = data.imageUrl;
                        document.getElementById("UnitDetails").textContent = data.details;
                        document.getElementById("UnitPrice").textContent = data.price + "$";
                }
                else
                        console.log("This Unit Dose Not Exists!!");
        }
        catch (error) {
                console.error("Error fetching Unit data: ", error);
        }
})();

// Get User data
(async function getProfileData() {
        try {
                //Get Profile Data
                let userDetails = doc(db, "users", UserID.toString());
                const userData = await getDoc(userDetails);

                //Update User Profile Data
                if (userData.exists) {
                        const data = userData.data();
                        document.getElementById("UserName").value = data.name;
                        document.getElementById("UserEmail").value = data.email;
                }
                else
                        console.log("This User Dose Not Exists!!");
        }
        catch (error) {
                console.error("Error fetching profile data: ", error);
        }
})();

// Make Order
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
                MackOrder();
        }
});

async function MackOrder() {
        let isValid = true;
        // Get form values
        const dateTime = document.getElementById('DateForBooking').value;
        const duration = parseInt(document.getElementById('Duration').value);

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
                if (data.OrderDate == selectedDateTime.toDateString()) {
                        if (data.OrderSelectedHour == selectedHour) {
                                isValid = false;
                                return;
                        }
                        else if (data.OrderSelectedHour < selectedHour) {
                                if (data.OrderSelectedHour + data.Duration < selectedHour) {
                                        isValid = true;
                                }
                                else {
                                        isValid = false;
                                        return;
                                }
                        }
                        else {
                                if (data.OrderSelectedHour > selectedHour + duration) {
                                        isValid = true;
                                }
                                else {
                                        isValid = false;
                                        return;
                                }
                        }
                }
                else isValid = true;
        });

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
                                }, 3000)
                        }).catch((error) => {
                                console.error("Error Making Order: ", error);
                        });
                } catch (error) {
                        console.error("Error Making Order: ", error);
                }
        }
        else console.log("Error");
}
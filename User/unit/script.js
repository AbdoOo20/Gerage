import { db, getDoc, doc } from '../../Database/firebase-config.js';



(async () => {
        try {
                const urlParams = new URLSearchParams(window.location.search);
                //Get Profile Data
                let UnitrDetails = doc(db, "Units", urlParams.get('UnitID'));
                const UnitData = await getDoc(UnitrDetails);

                //Update User Profile Data
                if (UnitData.exists) {
                        const data = UnitData.data();
                        document.getElementById("UnitTitle").textContent = data.title;
                        document.getElementById("UnitImg").src = data.imageUrl;
                        document.getElementById("UnitDetails").textContent = data.details;
                        document.getElementById("UnitPrice").textContent = data.price + "$";
                }
                else
                        console.log("This User Dose Not Exists!!");
        }
        catch (error) {
                console.error("Error fetching profile data: ", error);
        }
})();
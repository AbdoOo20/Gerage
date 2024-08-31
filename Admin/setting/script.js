import { updateDoc, db, uploadBytes, ref, getDownloadURL, doc, getDoc } from './../../../Database/firebase-config.js';

const settingForm = document.getElementById('settingForm');
var docRef;

(function () {
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
})();


(async function () {
    docRef = doc(db, 'Settings', "pMbOKWdq6WtCoOzZ3hA9");
    const docSnap = await getDoc(docRef);
    const settingData = docSnap.data();
    document.getElementById("privacyTerms").value = settingData.privacy;
    document.getElementById("aboutUs").value = settingData.aboutUs;
    document.getElementById("contactEmail").value = settingData.contactEmail;
    document.getElementById("contactNumber").value = settingData.contactNumber;
    document.getElementById("facebookLink").value = settingData.facebook;
    document.getElementById("instagramLink").value = settingData.instagram; 
    document.getElementById("locationLink").value = settingData.location;
    document.getElementById("youtubeLink").value = settingData.youtube;
})();


settingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(settingForm);
    const privacy = formData.get('privacyTerms');
    const aboutUs = formData.get('aboutUs');
    const contactEmail = formData.get('contactEmail');
    const contactNumber = formData.get('contactNumber');
    const facebookLink = formData.get('facebookLink');
    const instagramLink = formData.get('instagramLink');
    const locationLink = formData.get('locationLink');
    const youtubeLink = formData.get('youtubeLink');
    await updateDoc(docRef, {
        privacy: privacy,
        aboutUs: aboutUs,
        contactEmail: contactEmail,
        contactNumber: contactNumber,
        facebook: facebookLink,
        instagram: instagramLink,
        location: locationLink,
        youtube: youtubeLink
    }).then(() => {
        console.log("1");
        showAlert("Settings Edited Successfully", "success");
    }).catch((e) => {
        console.log("2");
        showAlert(e.message, "danger");
    });
});

function showAlert(message, type) { // type => // danger // success // warning
    const alertContainer = document.getElementById('alert-container');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.role = 'alert';
    alertDiv.innerText = message;
    alertContainer.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
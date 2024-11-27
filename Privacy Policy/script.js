import { db, doc, getDoc } from '../../Database/firebase-config.js';

document.addEventListener("DOMContentLoaded", async () => {
    await getSettingData();
});

async function getSettingData() {
    try {
        let settingDoc = doc(db, "Settings", "pMbOKWdq6WtCoOzZ3hA9");
        const settingData = await getDoc(settingDoc);
        localStorage.setItem('setting', JSON.stringify(settingData.data()));
        var setting = JSON.parse(localStorage.getItem('setting'));
        var privacy = document.getElementById('privacy');
        var mail = document.getElementById('mail');
        var email = document.getElementById('email');
        var location = document.getElementById('location');
        var phone = document.getElementById('phone');
        var facebook = document.getElementById('facebook');
        var instagram = document.getElementById('instagram');
        var youtube = document.getElementById('youtube');
        privacy.innerText = setting.privacy;
        mail.innerText = setting.contactEmail;
        email.innerText = setting.contactEmail;
        phone.innerText = setting.contactNumber;
        location.href = setting.location;
        facebook.href = setting.facebook;
        instagram.href = setting.instagram;
        youtube.href = setting.youtube;
    } catch (error) {
        console.error("Error fetching profile data: ", error);
    }
}

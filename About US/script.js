
var privacy = document.getElementById('privacy');
var location = document.getElementById('location');
var phone = document.getElementById('phone');
var mail = document.getElementById('mail');
document.addEventListener("DOMContentLoaded", async () => {
    var setting = JSON.parse(localStorage.getItem('setting'));
    privacy.innerText = setting.aboutUs;
    mail.innerText = setting.contactEmail;
    phone.innerText = setting.contactNumber;
    location.href = setting.location;
});

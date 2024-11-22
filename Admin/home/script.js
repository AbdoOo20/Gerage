import { signOut, auth } from '../../Database/firebase-config.js';

var email = localStorage.getItem('email');
if (email === null) {
    window.location.href = '../../Authentication/adminLogin/adminLogin.html';
}

document.getElementById('showUnit').addEventListener('click', function () {
    window.location.href = './../unit/show/show unit.html';
});

document.getElementById('showSetting').addEventListener('click', function () {
    window.location.href = './../setting/index.html';
});

document.getElementById('showUsers').addEventListener('click', function () {
    window.location.href = './../users/index.html';
});

document.getElementById('showOrders').addEventListener('click', function () {
    window.location.href = './../orders/index.html';
});

document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("LogoutBTN");
    logoutButton.addEventListener("click", () => {
        signOut(auth).then(() => {
            localStorage.clear();
            window.location.href = '../../Authentication/adminLogin/adminLogin.html';
        });
    });
});
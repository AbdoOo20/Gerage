import { auth, signInWithEmailAndPassword} from '../../Database/firebase-config.js';

document.addEventListener('DOMContentLoaded', function () {

    var form = document.querySelector('form');
    var successMessage = document.getElementById('successMessage');

    var email = document.getElementById('email');
    var password = document.getElementById('password');

    function submitForm() { 
        signInWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
                const user = userCredential.user;
                localStorage.setItem('email', email.value);
                localStorage.setItem('id', user.uid); 
                successMessage.classList.remove('d-none');
                form.classList.add('d-none');
                setTimeout(function () {
                    if (email.value === 'admin@yahoo.com') {
                        window.location.href = '../../Admin/home/home.html';
                    } else {
                        window.location.href = "./../../User/home/index.html";
                    }
                }, 3000);
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
            })
            .catch((error) => {
                showAlert(error.message, "danger");
            });
    }

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

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm();
    });
});

window.onload = () => {
    localStorage.clear();
    const savedEmail = localStorage.getItem('email');
    if (savedEmail && savedEmail == 'admin@yahoo.com') {
        window.location.href = '../../Admin/home/home.html';
    } else if (savedEmail && savedEmail != 'admin@yahoo.com') {
        window.location.href = '../../User/home/index.html';
    }
}
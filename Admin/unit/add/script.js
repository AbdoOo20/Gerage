import { storage, db, uploadBytes, ref, getDownloadURL, addDoc, collection } from './../../../Database/firebase-config.js';

const addForm = document.getElementById('addUnitForm');
const addBTN = document.getElementById('addBTN');
const load = document.getElementById('load');
const imageDisplay = document.getElementById('displayImage');
const imageInput = document.getElementById("image");
let imageLinks = [];
let imageNames = [];

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

addForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(addForm);
    const title = formData.get('title');
    const details = formData.get('details');
    const price = formData.get('price');
    const now = new Date();
    const files = imageInput.files;
    if (title.length < 4) {
        showAlert("Title must more than 4 character", "danger");
    } else if (details < 10) {
        showAlert("Details must more than 10 character", "danger");
    } else if (price < 1) {
        showAlert("Price must greater than zero", "danger");
    } else if (files.length == 0) {
        showAlert("You must select image", "danger");
    }
    else {
        imageLinks = [];
        imageNames = [];
        showAlert("Wait", "warning");
        addBTN.style.display = "none";
        load.style.display = 'inline-block';
        imageDisplay.style.display = "none";  
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = ref(storage, `Units/${file.name}`);
            await uploadBytes(storageRef, file);
            const imageUrl = await getDownloadURL(storageRef);
            imageLinks.push(imageUrl);
            imageNames.push(file.name);
        }
        await addDoc(collection(db, "Units"), {
            imageUrl: imageLinks,
            title: title,
            name: imageNames,
            date: now,
            details: details,
            price: price,
            isUsed: false,
        }).then(() => {
            showAlert("Unit Added Successfully", "success");
            addBTN.style.display = 'inline-block';
            load.style.display = "none";
            imageDisplay.style.display = 'inline-block';
            imageLinks = [];
            addForm.reset();
        }).catch((e) => {
            showAlert(e.message, "danger");
            addBTN.style.display = 'inline-block';
            load.style.display = "none";
            imageDisplay.style.display = 'inline-block';
            imageLinks = [];
        });
    }
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
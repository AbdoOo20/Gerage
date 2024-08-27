import { storage, db, uploadBytes, ref, getDownloadURL, addDoc, collection, getDocs, deleteDoc, deleteObject, doc, updateDoc } from './../../../Database/firebase-config.js';

const addForm = document.getElementById('addUnitForm');
const addBTN = document.getElementById('addBTN');
const load = document.getElementById('load');
const imageDisplay = document.getElementById('displayImage');

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
    const image = formData.get('image');
    const now = new Date();
    if (title.length < 4) {
        showAlert("Title must more than 4 character", "danger");
    } else if (details < 10) {
        showAlert("Details must more than 10 character", "danger");
    } else if (price < 1) {
        showAlert("Price must greater than zero", "danger");
    } else if (image.name == "") {
        showAlert("You must select image", "danger");
    }
    else {
        showAlert("Wait", "warning");
        addBTN.style.display = "none";
        load.style.display = 'inline-block';
        imageDisplay.style.display = "none";
        const storageRef = ref(storage, `Units/${image.name}`);
        await uploadBytes(storageRef, image);
        const imageUrl = await getDownloadURL(storageRef);
        await addDoc(collection(db, "Units"), {
            imageUrl: imageUrl,
            title: title,
            name: image.name,
            date: now,
            details: details,
            price: price,
            isUsed: false,
        }).then(() => {
            showAlert("Unit Added Successfully", "success");
            addBTN.style.display = 'inline-block';
            load.style.display = "none";
            imageDisplay.style.display = 'inline-block';
            addForm.reset();
        }).catch((e) => {
            showAlert(e.message, "danger");
            addBTN.style.display = 'inline-block';
            load.style.display = "none";
            imageDisplay.style.display = 'inline-block';
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
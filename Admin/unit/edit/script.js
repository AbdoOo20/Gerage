import { storage, db, uploadBytes, ref, getDownloadURL, getDoc, doc, updateDoc } from './../../../Database/firebase-config.js';

const addForm = document.getElementById('addUnitForm');
const addBTN = document.getElementById('addBTN');
const load = document.getElementById('load');
const imageDisplay = document.getElementById('displayImage');
var selectUnitImageName;
var docRef;
const imageScrollContainer = document.getElementById('imageScrollContainer');

(async function () {
    var selectedID = window.location.search.split('=')[1];
    docRef = doc(db, 'Units', selectedID);
    const docSnap = await getDoc(docRef);
    const unitData = docSnap.data();
    let imageHTML = '';
    for (let i = 0; i < unitData.imageUrl.length; i++) {
        imageHTML += `
                    <div class="image-item position-relative m-1">
                        <img src="${unitData.imageUrl[i]}" class="img-thumbnail" alt="Image" style="width: 100px; height: 100px;">
                        <i class="close-icon position-absolute top-1 end-1" aria-label="Delete" onclick="deleteImage('${unitData.name[i]}', this)"></i>
                    </div>
                `;
    }
    imageScrollContainer.innerHTML = imageHTML;
    document.getElementById("unitTitle").value = unitData.title;
    document.getElementById("unitDetails").value = unitData.details;
    document.getElementById("unitPrice").value = unitData.price;
    selectUnitImageName = unitData.name;
})();


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
    if (title.length < 4) {
        showAlert("Title must more than 4 character", "danger");
    } else if (details < 10) {
        showAlert("Details must more than 10 character", "danger");
    } else if (price < 1) {
        showAlert("Price must greater than zero", "danger");
    }
    else {
        showAlert("Wait", "warning");
        addBTN.style.display = "none";
        load.style.display = 'inline-block';
        imageDisplay.style.display = "none";
        if (image.name == "") {
            await updateDoc(docRef, {
                title: title,
                details: details,
                price: price
            }).then(() => {
                showAlert("Unit Edited Successfully", "success");
                addBTN.style.display = 'inline-block';
                load.style.display = "none";
                imageDisplay.style.display = 'inline-block';
            }).catch((e) => {
                showAlert(e.message, "danger");
                addBTN.style.display = 'inline-block';
                load.style.display = "none";
                imageDisplay.style.display = 'inline-block';
            });
        } else {
            const storageRef = ref(storage, `Units/${selectUnitImageName}`);
            await uploadBytes(storageRef, image);
            const imageUrl = await getDownloadURL(storageRef);
            await updateDoc(docRef, {
                imageUrl: imageUrl,
                title: title,
                details: details,
                price: price
            }).then(() => {
                showAlert("Unit Edited Successfully", "success");
                addBTN.style.display = 'inline-block';
                load.style.display = "none";
                imageDisplay.style.display = 'inline-block';
            }).catch((e) => {
                showAlert(e.message, "danger");
                addBTN.style.display = 'inline-block';
                load.style.display = "none";
                imageDisplay.style.display = 'inline-block';
            });
        }
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
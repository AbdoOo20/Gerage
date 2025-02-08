import { storage, db, query, uploadBytes, ref, getDownloadURL, where, addDoc, collection, getDocs } from './../../../Database/firebase-config.js';

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
    imageNames = [];
    const files = imageInput.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        imageNames.push(file.name);
    }
    const formData = new FormData(addForm);
    const title = formData.get('title');
    const details = formData.get('details');
    const price = formData.get('price');
    const priceDay = formData.get('priceDay');
    const now = new Date();
    
    if (title.length < 4) {
        showAlert("Title must more than 4 character", "danger");
    } else if (details < 10) {
        showAlert("Details must more than 10 character", "danger");
    } else if (price < 1) {
        showAlert("Price per hour must greater than zero", "danger");
    } else if (priceDay < 1) {
        showAlert("Price per day must greater than zero", "danger");
    } else if (files.length == 0) {
        showAlert("You must select image", "danger");
    }
    else if (await checkDuplicateNames(imageNames)) {
        showAlert("There is image name duplicate, try to upload image with different name with images in database.", "danger");
    }
    else {
        imageLinks = [];   
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
        }
        await addDoc(collection(db, "Units"), {
            imageUrl: imageLinks,
            title: title,
            name: imageNames,
            date: now,
            details: details,
            price: price,
            priceDay: priceDay,
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
    }, 4000);
}

async function checkDuplicateNames(namesList) {
    try {
        for (const name of namesList) {
            const q = query(collection(db, "Units"), where("name", "array-contains", name));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return true;
            }
        }
        return false;
    } catch (error) {
        showAlert(error, "danger");
    }
}
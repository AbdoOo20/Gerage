import { storage, db, uploadBytes, ref, query, getDownloadURL, where, getDoc, getDocs, collection, doc, updateDoc, deleteObject } from './../../../Database/firebase-config.js';

const addForm = document.getElementById('addUnitForm');
const addBTN = document.getElementById('addBTN');
const load = document.getElementById('load');
const imageDisplay = document.getElementById('displayImage');
var selectUnitImageName;
var docRef;
let unitData;
const imageScrollContainer = document.getElementById('imageScrollContainer');
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

(async function () {
    var selectedID = window.location.search.split('=')[1];
    docRef = doc(db, 'Units', selectedID);
    const docSnap = await getDoc(docRef);
    unitData = docSnap.data();
    let imageHTML = '';
    for (let i = 0; i < unitData.imageUrl.length; i++) {
        imageHTML += `
                    <div class="image-item position-relative m-1">
                        <img src="${unitData.imageUrl[i]}" class="img-thumbnail" alt="Image" style="width: 100px; height: 100px;">
                        <i class="close-icon position-absolute top-1 end-1" aria-label="Delete" data-index="${i}" data-id="${docSnap.id}"></i>
                    </div>
                `;
    }
    imageScrollContainer.innerHTML = imageHTML;
    document.getElementById("unitTitle").value = unitData.title;
    document.getElementById("unitDetails").value = unitData.details;
    document.getElementById("unitPrice").value = unitData.price;
    selectUnitImageName = unitData.name;
    // Delete Icon
    imageScrollContainer.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('close-icon')) {
            const index = event.target.getAttribute('data-index');
            const unitID = event.target.getAttribute('data-id');
            deleteImage(index, unitID, event.target);
        }
    });
})();


async function deleteImage(index, unitID, target) {
    showAlert("Wait", "warning");
    const docRef = doc(db, 'Units', unitID);
    const docSnap = await getDoc(docRef);
    const unitData = docSnap.data();
    var selectImageName = unitData.name[index];
    try {
        const imageRef = ref(storage, `Units/${selectImageName}`);
        await deleteObject(imageRef);
        let updatedImageArray = [...unitData.imageUrl];
        updatedImageArray.splice(index, 1);
        let updatedNameArray = [...unitData.name];
        updatedNameArray.splice(index, 1);
        await updateDoc(docRef, {
            imageUrl: updatedImageArray,
            name: updatedNameArray
        });
        const parentDiv = target.closest('.image-item');
        parentDiv.remove();
    } catch (error) {
        showAlert(error, "danger");
    }
}

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
        if (files.length == 0) {
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
            if (await checkDuplicateNames(imageNames)) {
                showAlert("There is image name duplicate, try to upload image with different name with images in database.", "danger");
                addBTN.style.display = 'inline-block';
                load.style.display = "none";
                imageDisplay.style.display = 'inline-block';
            } else {
                imageLinks = [];
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
                for (let i = 0; i < unitData.name.length; i++) {
                    imageLinks.push(unitData.imageUrl[i]);
                    imageNames.push(unitData.name[i]);
                }
                await updateDoc(docRef, {
                    imageUrl: imageLinks,
                    title: title,
                    details: details,
                    price: price,
                    name: imageNames
                }).then(() => {
                    showAlert("Unit Edited Successfully", "success");
                    addBTN.style.display = 'inline-block';
                    load.style.display = "none";
                    imageDisplay.style.display = 'inline-block';
                    window.location.reload();
                }).catch((e) => {
                    showAlert(e.message, "danger");
                    addBTN.style.display = 'inline-block';
                    load.style.display = "none";
                    imageDisplay.style.display = 'inline-block';
                });
            }
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
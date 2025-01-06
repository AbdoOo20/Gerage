import { storage, db, ref, collection, getDoc, getDocs, deleteDoc, deleteObject, doc } from './../../../Database/firebase-config.js';

const parentUnit = document.getElementById('ParentUnit');
let unitIdToDelete = null;

async function getAllUnits() {
    const Units = collection(db, "Units");
    const querySnapshot = await getDocs(Units);
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const itemHTML = `
                    <div class="col">
                    <div class="card product-card">
                    <img src=${data.imageUrl} alt="Product Image" class="card-img-top product-image">
                    <div class="card-body">
                        <h5 class="card-title">${data.title}</h5>
                        <p class="card-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block">${data.details}</p>
                        <p class="card-text"><strong>${data.price} CHF</strong></p>
                        <div class="product-actions d-flex justify-content-between mt-3">
                            <a href="./../edit/edit unit.html?id=${doc.id}" class="fa fa-edit text-primary" title="Edit"></a>
                            <a class="fa fa-trash text-danger" data-unit-id=${doc.id} title="Delete" data-bs-toggle="modal" data-bs-target="#deleteModal"></a>
                        </div>
                    </div>
                    </div>
                    </div>
                `;
        parentUnit.insertAdjacentHTML('beforeend', itemHTML);
    });
}

getAllUnits();

document.getElementById('deleteModal').addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    unitIdToDelete = button.getAttribute('data-unit-id');
});

document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
    const docRef = doc(db, 'Units', unitIdToDelete);
    const docSnap = await getDoc(docRef);
    const unitData = docSnap.data();
    const storageRef = ref(storage, `Units/${unitData.name}`);
    deleteObject(storageRef)
    const unitRef = doc(db, "Units", unitIdToDelete);
    deleteDoc(unitRef).finally(() => {
        const deleteModalElement = document.getElementById('deleteModal');
        const deleteModal = bootstrap.Modal.getInstance(deleteModalElement);
        deleteModal.hide();
        window.location.reload();
    });
    if (unitIdToDelete) {
        
        
        // if (unitData.isUsed) {
        //     const deleteModalElement = document.getElementById('deleteModal');
        //     const deleteModal = bootstrap.Modal.getInstance(deleteModalElement);
        //     deleteModal.hide();
        //     showAlert("You can not delete unit because it is used now", "danger");
        // }
        // else {
            
        // }
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

document.getElementById("showAddUnit").addEventListener('click', function () { 
    window.location.href = "./../add/add unit.html";
});
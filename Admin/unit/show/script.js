import { storage, db, uploadBytes, ref, getDownloadURL, addDoc, collection, getDocs, deleteDoc, deleteObject, doc, updateDoc } from './../../../Database/firebase-config.js';

const parentUnit = document.getElementById('ParentUnit');

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
                        <p class="card-text">${data.details}</p>
                        <p class="card-text"><strong>${data.price} $</strong></p>
                        <p class="card-text"><strong>Availability:</strong> ${data.isUsed ? "Empty" : "Used"} </p>
                        <div class="product-actions d-flex justify-content-between mt-3">
                            <i class="fa fa-edit text-primary" title="Edit"></i>
                            <i class="fa fa-trash text-danger" title="Delete"></i>
                        </div>
                    </div>
                    </div>
                    </div>
                `;
        parentUnit.insertAdjacentHTML('beforeend', itemHTML);
    });
}

getAllUnits();
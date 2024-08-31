import { getDocs, db, collection } from './../../../Database/firebase-config.js';

var count = 0;

async function getAllUsers() {
    const tableBody = document.getElementById('data-table-body');
    const titleElement = document.getElementById('title');
    tableBody.innerHTML = '';
    titleElement.innerHTML = '';
    const Units = collection(db, "users");
    const querySnapshot = await getDocs(Units);
    titleElement.innerHTML = `Users (${querySnapshot.size})`;
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const itemHTML = `<tr>
                    <td>${data.name}</td>
                    <td>${data.email}</td>
                    <td>${data.phone}</td>
                </tr>`;
        tableBody.insertAdjacentHTML('beforeend', itemHTML);
    });
}

getAllUsers();
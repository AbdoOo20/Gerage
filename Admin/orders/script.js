import { getDocs, db, collection, doc, getDoc } from './../../../Database/firebase-config.js';

var count = 0;

async function getAllOrders() {
    const tableBody = document.getElementById('data-table-body');
    const titleElement = document.getElementById('title');
    tableBody.innerHTML = '';
    titleElement.innerHTML = '';
    const Orders = collection(db, "Orders");
    const querySnapshot = await getDocs(Orders);
    titleElement.innerHTML = `Orders (${querySnapshot.size})`;
    querySnapshot.forEach(async (docu) => {
        const data = docu.data();
        var userName = await getUserName(data.UserID);
        var unitName = await getUnitName(data.UnitID);
        const itemHTML = `<tr>
                    <td>${data.Duration}</td>
                     <td>${data.OrderDate}</td>
                    <td>${data.OrderSelectedHour}</td>
                    <td>${unitName}</td>
                    <td>${userName}</td> 
                    <td>Waiting</td>
                </tr>`;
        tableBody.insertAdjacentHTML('beforeend', itemHTML);
    });
}

getAllOrders();


async function getUserName(userID) {
    var docRef = doc(db, 'users', userID);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    return userData.name;
}

async function getUnitName(unitID) {
    var docRef = doc(db, 'Units', unitID);
    const docSnap = await getDoc(docRef);
    const unitData = docSnap.data();
    return unitData.title;
}
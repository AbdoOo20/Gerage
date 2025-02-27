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
        var state;
        if (data.OrderStatus === "Paid") {
            const dateNow = new Date();
            var orderDate = new Date(data.OrderDate);
            state = dateNow > orderDate ? "Confirmed" : "Paid";
        } else {
            state = "Pending";
        }
        const itemHTML = `<tr>
                    <td>${data.Duration}</td>
                     <td>${data.OrderDate}</td>
                    <td>${formatTime(data.OrderSelectedHour)}</td>
                    <td>${unitName}</td>
                    <td>${userName}</td> 
                    <td>${state}</td>
                </tr>`;
        tableBody.insertAdjacentHTML('beforeend', itemHTML);
    });
}

getAllOrders();

function formatTime(hour) {
    const isPM = hour >= 12;
    const twelveHour = hour % 12 || 12; // Convert 0 to 12 for midnight
    return `${twelveHour}:00 ${isPM ? "PM" : "AM"}`;
}


async function getUserName(userID) {
    var docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        return "";
    }
    
    return docSnap.data().name || "";
}

async function getUnitName(unitID) {
    var docRef = doc(db, "Units", unitID);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        return "";
    }
    
    return docSnap.data().title || "";
}
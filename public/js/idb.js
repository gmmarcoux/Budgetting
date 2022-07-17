let db;
const request = indexedDB.open('budget', 1);

//REQUESTS
//onupgradeneeded
request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore('newTransac', { autoIncrement: true });
};
//onsuccess
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        console.log('Online!');
        checkIndexdb();
    }
};
//on error
request.onerror = (err) => {
    console.log(err.message);
};

//SAVE RECORD when there is no internet
function saveRecord(record) {
    const transaction = db.transaction("newTransac", "readwrite");
    const store = transaction.objectStore("NewTransac");
    budgetObjectStore.add(record);
}

//GET RECORDS
function checkIndexdb() {
    //open
    const transaction = db.transaction("newTransac", "readwrite");
    //access
    const store = transaction.objectStore("NewTransac");
    //get records
    const getAll = store.getAll;
    console.log(getAll);

    //Successful getAll
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                //+1 Transaction
                const transaction = db.transaction(['newTransac'], 'readwrite');
                //Access
                const budgetObjectStore = transaction.objectStore('newTransac');
                //clear
                budgetObjectStore.clear();
                alert('Saved Transaction are now submitted!');
            })
        }
    }
}

//Wait for app to come back online
window.addEventListener('online', uploadTransaction);

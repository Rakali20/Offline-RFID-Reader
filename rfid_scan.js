document.addEventListener("DOMContentLoaded", () => {
    const rfidInput = document.getElementById("borrower-rfid");
    const scanButton = document.getElementById("borrower-scan-button");
    const resultName = document.getElementById("borrower-name");

    let db;
    const request = indexedDB.open("LibrarySystem", 2);

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("IndexedDB opened successfully.");
    };

    request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event.target.errorCode);
        alert("Failed to open the database.");
    };

    scanButton.addEventListener("click", () => {
        const rfid = rfidInput.value.trim();

        if (!rfid) {
            alert("Please enter or scan an RFID.");
            return;
        }

        if (!db) {
            alert("Database is not initialized yet.");
            return;
        }

        // Begin transaction and search in all stores
        const transaction = db.transaction(["teachers", "students", "books"], "readonly");
        const storeNames = ["teachers", "students", "books"];
        let recordFound = false;

        storeNames.forEach((storeName) => {
            const store = transaction.objectStore(storeName);

            if (store.indexNames.contains("rfidNumber")) {
                const index = store.index("rfidNumber");
                const request = index.get(rfid);

                request.onsuccess = () => {
                    if (request.result) {
                        const record = request.result;
                        resultName.textContent = `Name: ${record.fullName || record.title}, Type: ${storeName.slice(0, -1).toUpperCase()}`;
                        recordFound = true;
                    }
                };

                request.onerror = (event) => {
                    console.error(`Error fetching record from ${storeName}:`, event.target.errorCode);
                };
            } else {
                console.error(`Index 'rfidNumber' not found in store '${storeName}'.`);
            }
        });

        transaction.oncomplete = () => {
            if (!recordFound) {
                resultName.textContent = "No record found for the scanned RFID.";
            }
        };

        transaction.onerror = (event) => {
            console.error("Error during transaction:", event.target.errorCode);
        };
    });
});
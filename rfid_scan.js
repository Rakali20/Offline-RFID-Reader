document.addEventListener("DOMContentLoaded", () => {
    const rfidInput = document.getElementById("borrower-rfid");
    const scanButton = document.getElementById("borrower-scan-button");
    const resultName = document.getElementById("borrower-name");
    const resultType = document.getElementById("borrower-type");
    const resultUsn = document.getElementById("borrower-usn");
    const resultImage = document.getElementById("borrower-image");

    const fetchBooksButton = document.getElementById("fetch-books-button");
    const bookRfidInputs = [
        { input: document.getElementById("book-rfid-1"), title: document.getElementById("book-title-1"), author: document.getElementById("book-author-1") },
        { input: document.getElementById("book-rfid-2"), title: document.getElementById("book-title-2"), author: document.getElementById("book-author-2") },
        { input: document.getElementById("book-rfid-3"), title: document.getElementById("book-title-3"), author: document.getElementById("book-author-3") },
    ];

    let db;
    const request = indexedDB.open("LibrarySystem", 2);

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("IndexedDB opened successfully.");

        // Add listeners to book RFID inputs to fetch book titles dynamically
        bookRfidInputs.forEach(({ input, title, author }) => {
            input.addEventListener("input", () => fetchBookDetails(input.value.trim(), title, author));
        });
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

        const transaction = db.transaction(["teachers", "students"], "readonly");
        const storeNames = ["teachers", "students"];
        let recordFound = false;

        storeNames.forEach((storeName) => {
            const store = transaction.objectStore(storeName);

            if (store.indexNames.contains("rfidNumber")) {
                const index = store.index("rfidNumber");
                const request = index.get(rfid);

                request.onsuccess = () => {
                    if (request.result) {
                        const record = request.result;
                        resultName.textContent = record.fullName || "N/A";
                        resultType.textContent = storeName.slice(0, -1).toUpperCase();
                        resultUsn.textContent = record.usn || "N/A";

                        if (record.picture) {
                            resultImage.src = record.picture;
                            resultImage.alt = "Borrower Image";
                            resultImage.style.display = "block";
                        } else {
                            resultImage.src = "";
                            resultImage.alt = "No image available";
                            resultImage.style.display = "none";
                        }

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
                resultType.textContent = "N/A";
                resultUsn.textContent = "N/A";
                resultImage.src = "";
                resultImage.alt = "No image available";
                resultImage.style.display = "none";
            }
        };

        transaction.onerror = (event) => {
            console.error("Error during transaction:", event.target.errorCode);
        };
    });

    function fetchBookDetails(rfid, titleElement, authorElement) {
        if (!rfid || !db) {
            titleElement.textContent = "N/A";
            authorElement.textContent = "N/A";
            return;
        }

        const transaction = db.transaction(["books"], "readonly");
        const store = transaction.objectStore("books");
        const request = store.get(rfid);

        request.onsuccess = () => {
            const record = request.result;
            titleElement.textContent = record ? record.title || "Unknown Title" : "Not Found";
            authorElement.textContent = record ? record.author || "Unknown Author" : "Not Found";
        };

        request.onerror = () => {
            console.error("Error fetching book details.");
            titleElement.textContent = "Error";
            authorElement.textContent = "Error";
        };
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#book-information-table tbody");

    // Open IndexedDB
    const request = indexedDB.open("LibrarySystem", 2);

    request.onsuccess = (event) => {
        const db = event.target.result;
        console.log("IndexedDB opened successfully.");

        // Fetch and display data for Books
        const transaction = db.transaction("books", "readonly");
        const store = transaction.objectStore("books");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const records = getAllRequest.result;
            records.forEach((record) => {
                const row = createTableRow(record, db);
                tableBody.appendChild(row);
            });
        };

        getAllRequest.onerror = (event) => {
            console.error("Error fetching data from books:", event.target.errorCode);
        };
    };

    request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event.target.errorCode);
        alert("Failed to open the database. Please ensure the database is initialized.");
    };

    function createTableRow(record, db) {
        const row = document.createElement("tr");

        // Book Title
        const titleCell = document.createElement("td");
        titleCell.textContent = record.fullName || "N/A";
        row.appendChild(titleCell);

        // RFID Number
        const rfidCell = document.createElement("td");
        rfidCell.textContent = record.rfidNumber || "N/A";
        row.appendChild(rfidCell);

        // Author
        const authorCell = document.createElement("td");
        authorCell.textContent = record.usn || "N/A";
        row.appendChild(authorCell);

        // Delete Button
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.dataset.id = record.id;
        deleteButton.addEventListener("click", () => deleteRecord(record.id, db, row));
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        return row;
    }

    function deleteRecord(id, db, row) {
        if (!confirm("Are you sure you want to delete this book permanently?")) {
            return;
        }

        const transaction = db.transaction("books", "readwrite");
        const store = transaction.objectStore("books");
        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => {
            console.log(`Record with ID ${id} deleted successfully.`);
            row.remove();
            alert("Book record deleted successfully.");
        };

        deleteRequest.onerror = (event) => {
            console.error("Error deleting the record:", event.target.errorCode);
            alert("Failed to delete the book record.");
        };
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#information-table tbody");

    // Open IndexedDB
    const request = indexedDB.open("LibrarySystem", 2); // Ensure the database name and version match app.js

    request.onsuccess = (event) => {
        const db = event.target.result;
        console.log("IndexedDB opened successfully.");

        // Fetch and display data for Teachers and Students
        ["teachers", "students"].forEach((storeName) => {
            const transaction = db.transaction(storeName, "readonly");
            const store = transaction.objectStore(storeName);
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                const records = getAllRequest.result;
                records.forEach((record, index) => { // Add index as the registry number
                    const row = createTableRow(record, storeName, db, index + 1); // Pass index to the function
                    tableBody.appendChild(row);
                });
            };

            getAllRequest.onerror = (event) => {
                console.error(`Error fetching data from ${storeName}:`, event.target.errorCode);
            };
        });
    };

    request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event.target.errorCode);
        alert("Failed to open the database. Please ensure the database is initialized.");
    };

    function createTableRow(record, type, db, registryNumber) {
        const row = document.createElement("tr");

        // Registered #
        const registryCell = document.createElement("td");
        registryCell.textContent = registryNumber; // Display the registry number
        row.appendChild(registryCell);

        // Full Name
        const nameCell = document.createElement("td");
        nameCell.textContent = record.fullName || "N/A";
        row.appendChild(nameCell);

        // RFID Number
        const rfidCell = document.createElement("td");
        rfidCell.textContent = record.rfidNumber || "N/A";
        row.appendChild(rfidCell);

        // Type (Teacher or Student)
        const typeCell = document.createElement("td");
        typeCell.textContent = type.slice(0, -1).charAt(0).toUpperCase() + type.slice(1, -1); // Capitalize "Teacher" or "Student"
        row.appendChild(typeCell);

        // Attachment
        const attachmentCell = document.createElement("td");
        if (record.picture) {
            const img = document.createElement("img");
            img.src = record.picture;
            img.alt = "Attachment";
            img.style.width = "50px";
            img.style.height = "50px";
            attachmentCell.appendChild(img);
        } else {
            attachmentCell.textContent = "N/A";
        }
        row.appendChild(attachmentCell);

        // Delete Button
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.dataset.id = record.id; // Store the record ID in the button's dataset
        deleteButton.dataset.type = type; // Store the type (teachers or students) in the dataset
        deleteButton.addEventListener("click", () => deleteRecord(record.id, type, db, row));
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        return row;
    }

    function deleteRecord(id, type, db, row) {
        if (!confirm("Are you sure you want to delete this record permanently?")) {
            return;
        }

        const transaction = db.transaction(type, "readwrite");
        const store = transaction.objectStore(type);
        const deleteRequest = store.delete(id);

        deleteRequest.onsuccess = () => {
            console.log(`Record with ID ${id} deleted successfully from ${type}.`);
            row.remove(); // Remove the row from the table
            alert("User record deleted successfully.");
        };

        deleteRequest.onerror = (event) => {
            console.error("Error deleting the record:", event.target.errorCode);
            alert("Failed to delete the user record.");
        };
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const borrowerRFIDInput = document.getElementById("borrower-rfid");
    const borrowerScanButton = document.getElementById("borrower-scan-button");

    const borrowerRegisteredElement = document.getElementById("borrower-registered");
    const borrowerNameElement = document.getElementById("borrower-name");
    const borrowerRFIDElement = document.getElementById("borrower-rfid-display");
    const borrowerTypeElement = document.getElementById("borrower-type");
    const borrowerAttachmentElement = document.getElementById("borrower-attachment");

    // Event Listener for the Scan Button
    borrowerScanButton.addEventListener("click", () => {
        const rfid = borrowerRFIDInput.value.trim();
        if (!rfid) {
            alert("Please enter or scan the RFID.");
            return;
        }

        // Clear previous borrower information
        borrowerRegisteredElement.textContent = "Checking...";
        borrowerNameElement.textContent = "Checking...";
        borrowerRFIDElement.textContent = "Checking...";
        borrowerTypeElement.textContent = "Checking...";
        borrowerAttachmentElement.textContent = "Checking...";

        // Fetch information.html and parse it
        fetch("information.html?cache_bust=" + new Date().getTime()) // Cache-busting
            .then((response) => response.text())
            .then((html) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");

                // Find the row corresponding to the RFID
                const borrowerRow = Array.from(doc.querySelectorAll("tbody tr")).find((row) =>
                    row.cells[2]?.textContent.trim() === rfid // Match RFID column
                );

                if (borrowerRow) {
                    // Extract data from the row
                    const registered = borrowerRow.cells[0]?.textContent.trim();
                    const name = borrowerRow.cells[1]?.textContent.trim();
                    const rfidNumber = borrowerRow.cells[2]?.textContent.trim();
                    const type = borrowerRow.cells[3]?.textContent.trim();
                    const attachment = borrowerRow.cells[4]?.querySelector("img")?.src || "N/A";

                    // Display the data
                    borrowerRegisteredElement.textContent = registered;
                    borrowerNameElement.textContent = name;
                    borrowerRFIDElement.textContent = rfidNumber;
                    borrowerTypeElement.textContent = type;
                    borrowerAttachmentElement.innerHTML = attachment !== "N/A"
                        ? `<img src="${attachment}" alt="Attachment" style="width: 50px; height: 50px;">`
                        : "N/A";

                    // Save the data to record.html
                    saveToRecords({
                        timestamp: new Date().toLocaleString(),
                        registered,
                        name,
                        rfid: rfidNumber,
                        type,
                        attachment,
                    });
                } else {
                    // Display not found message
                    borrowerRegisteredElement.textContent = "N/A";
                    borrowerNameElement.textContent = "No borrower found";
                    borrowerRFIDElement.textContent = "N/A";
                    borrowerTypeElement.textContent = "N/A";
                    borrowerAttachmentElement.textContent = "N/A";
                    alert("Borrower is not registered.");
                }
            })
            .catch((error) => {
                console.error("Error fetching or parsing information.html:", error);
                alert("An error occurred while fetching borrower information.");
            });
    });

    // Function to save scanned data to record.html
    function saveToRecords(data) {
        fetch("record.html")
            .then((response) => response.text())
            .then((html) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");

                // Create a new row for the record
                const newRow = doc.createElement("tr");
                newRow.innerHTML = `
                    <td>${data.timestamp}</td>
                    <td>${data.registered}</td>
                    <td>${data.name}</td>
                    <td>${data.rfid}</td>
                    <td>${data.type}</td>
                    <td>${data.attachment !== "N/A" ? `<img src="${data.attachment}" alt="Attachment" style="width: 50px; height: 50px;">` : "N/A"}</td>
                `;

                // Append the new row to the table
                doc.querySelector("#record-table tbody").appendChild(newRow);

                // Serialize the updated HTML and save it back to record.html
                const updatedHTML = new XMLSerializer().serializeToString(doc);
                saveUpdatedHTML("record.html", updatedHTML);
            })
            .catch((error) => {
                console.error("Error fetching or updating record.html:", error);
            });
    }

    // Function to save updated HTML to a file (requires server-side support)
    function saveUpdatedHTML(filename, content) {
        // You will need server-side support (e.g., PHP, Node.js) to handle writing files.
        console.log(`Saving to ${filename}:`, content);
        // Implement server-side logic to save the file.
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const userForm = document.getElementById("registration-form");
    const bookForm = document.getElementById("book-registration-form");

    let db;
    const request = indexedDB.open("LibrarySystem", 2);

    request.onsuccess = (event) => {
        db = event.target.result;
    };

    // Save to Database
    function saveToDatabase(storeName, data, callback) {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => {
            callback();
        };

        request.onerror = (event) => {
            console.error(`Error saving data to ${storeName}:`, event.target.errorCode);
        };
    }

    // User Registration Submission
    if (userForm) {
        userForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const type = document.getElementById("type").value; // "teacher" or "student"
            const rfidNumber = document.getElementById("rfid-number").value.trim();
            const fullName = document.getElementById("full-name").value.trim();
            const usn = document.getElementById("usn").value.trim();
            const pictureFile = document.getElementById("picture-id").files[0];

            if (!rfidNumber || !fullName || !usn) {
                alert("Please fill in all fields.");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const data = {
                    rfidNumber,
                    fullName,
                    usn,
                    picture: reader.result || null,
                };

                saveToDatabase(type + "s", data, () => {
                    alert("User registered successfully.");
                    userForm.reset();
                });
            };

            if (pictureFile) {
                reader.readAsDataURL(pictureFile);
            } else {
                reader.onload();
            }
        });
    }

    // Book Registration Submission
    if (bookForm) {
        bookForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const rfidNumber = document.getElementById("book-rfid-number").value.trim();
            const bookTitle = document.getElementById("book-title").value.trim();
            const author = document.getElementById("book-author").value.trim();

            if (!rfidNumber || !bookTitle || !author) {
                alert("Please fill in all fields.");
                return;
            }

            const data = { rfidNumber, fullName: bookTitle, usn: author, picture: null };
            saveToDatabase("books", data, () => {
                alert("Book registered successfully.");
                bookForm.reset();
            });
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    let db;
    const request = indexedDB.open("LibrarySystem", 2); // Ensure version matches

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        console.log("Upgrading/initializing IndexedDB...");

        // Create Object Stores if they don't exist
        if (!db.objectStoreNames.contains("teachers")) {
            const teacherStore = db.createObjectStore("teachers", { keyPath: "id", autoIncrement: true });
            teacherStore.createIndex("rfidNumber", "rfidNumber", { unique: true }); // Add rfidNumber index
        } else {
            const teacherStore = event.target.transaction.objectStore("teachers");
            if (!teacherStore.indexNames.contains("rfidNumber")) {
                teacherStore.createIndex("rfidNumber", "rfidNumber", { unique: true });
            }
        }

        if (!db.objectStoreNames.contains("students")) {
            const studentStore = db.createObjectStore("students", { keyPath: "id", autoIncrement: true });
            studentStore.createIndex("rfidNumber", "rfidNumber", { unique: true }); // Add rfidNumber index
        } else {
            const studentStore = event.target.transaction.objectStore("students");
            if (!studentStore.indexNames.contains("rfidNumber")) {
                studentStore.createIndex("rfidNumber", "rfidNumber", { unique: true });
            }
        }

        if (!db.objectStoreNames.contains("books")) {
            const bookStore = db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
            bookStore.createIndex("rfidNumber", "rfidNumber", { unique: true }); // Add rfidNumber index
        } else {
            const bookStore = event.target.transaction.objectStore("books");
            if (!bookStore.indexNames.contains("rfidNumber")) {
                bookStore.createIndex("rfidNumber", "rfidNumber", { unique: true });
            }
        }
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("IndexedDB initialized successfully.");
    };

    request.onerror = (event) => {
        console.error("Error initializing IndexedDB:", event.target.errorCode);
    };
});
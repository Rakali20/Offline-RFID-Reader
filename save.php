<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $filename = $_POST['filename'];
    $content = $_POST['content'];

    if (file_put_contents($filename, $content)) {
        echo "File saved successfully!";
    } else {
        http_response_code(500);
        echo "Failed to save file.";
    }
}
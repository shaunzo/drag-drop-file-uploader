<?php

    var_dump($_FILES);

    foreach ($_FILES['uploadedFile']['tmp_name'] as $key => $value) {
        $targetPath = 'uploads/' . basename($_FILES['uploadedFile']['name'][$key]);
        move_uploaded_file($value, $targetPath);
    }

?>
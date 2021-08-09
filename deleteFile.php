<?php

    $file = $_GET['file'];
    $targetPath = 'uploads/'.$file;
    
    if (unlink($targetPath)) {
        echo 'The file ' . $file . ' was deleted successfully!';
    } else {
        echo 'There was a error deleting the file ' . $file;
    }


?>
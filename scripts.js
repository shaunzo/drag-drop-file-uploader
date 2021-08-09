let dropArea = document.getElementById('drop-area');
let filesDone = 0;
let filesToDo = 0;
let progressBar = document.getElementById('progress-bar');
let uploadProgress = [];

/**
 * We’ll start off with adding handlers to all the events to prevent
 * default behaviors and stop the events from bubbling up any higher than necessary
 */
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

/**
 * Now let’s add an indicator to let the user know that they have indeed dragged the
 * item over the correct area by using CSS to change the color of the border color of
 * the drop area. The styles should already be there under the #drop-area.highlight selector,
 * so let’s use JS to add and remove that highlight class when necessary.
 */

['dragenter', 'dragover'].forEach(eventName => {
dropArea.addEventListener(eventName, highlight, false);
})

;['dragleave', 'drop'].forEach(eventName => {
dropArea.addEventListener(eventName, unhighlight, false);
});

/**
 * Now all we need to do is figure out what to do when some files are dropped:
 * 
 * 1. Demonstrates how to get the data for the files that were dropped.
 * 2. Gets us to the same place that the file input was at with its onchange
 *    handler: waiting for handleFiles.
 * 
 */
 dropArea.addEventListener('drop', handleDrop, false);

 /**
  * Image Preview
  * There are a couple of ways you could do this: you could wait until after the image
  * has been uploaded and ask the server to send the URL of the image, but that means you 
  * need to wait and images can be pretty large sometimes. The alternative — which we’ll be exploring today — is
  * to use the FileReader API on the file data we received from the drop event. This is asynchronous, and you could
  * alternatively use FileReaderSync, but we could be trying to read several large files in a row, so this could block
  * the thread for quite a while and really ruin the experience. So let’s create a previewFile function and see how it works:
  */


function preventDefaults (e) {
e.preventDefault();
e.stopPropagation();
}

function highlight(e) {
    dropArea.classList.add('highlight');
}
  
function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
  
    /**
     * Keep in mind that files is not an array, but a FileList. So, when we implement
     * handleFiles, we’ll need to convert it to an array in order to iterate
     * over it more easily:
     */

    console.log(files);
    uploadFiles(files);
}

function handleFiles(files) {
    files = [...files];
    // initializeProgress(files.length);
    uploadFiles(files);
}

function uploadFiles(filesArray) {
    const url = 'uploadHandling.php';
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    for(const file of filesArray) {
        formData.append('myFiles[]', file);
    }


    
    xhr.open('post', url);

    xhr.addEventListener('loadstart', (e) => {
        console.log('---------------------LOAD START-------------------', e);
    });
    
    xhr.upload.addEventListener('progress', (e) => {
        console.log(`Uploaded ${e.loaded} of ${e.total} bytes`, e);
    });

    xhr.addEventListener('loadend', (e) => {
        console.log('---------------------LOAD END-------------------', e);
    });

    xhr.addEventListener('error', (e) => {
        console.log('---------------------ERROR-------------------', e);
    });

    xhr.send(formData);
    


    // xhr.onprogress = (e) => {
    //     console.log('LOADING', xhr.readyState, e);
    // }

    // xhr.onload = (e) => {
    //     console.log('READY', xhr.readyState, xhr.status, e);
    //     if(e.target.status !== 200) {
    //         console.error(e.target.responseText);
    //     }
    // }

    // xhr.addEventListener('readystatechange', (e) => {
    //     if(xhr.readyState == 4 && xhr.status == 200) {
    //         console.log('Done with upload!!!');
    //     } else if (xhr.readyState == 4 && xhr.status != 200) {
    //         console.error(`Error uploading file ${xhr.status}`);
    //         return;
    //     }
    // });

  
    // formData.append('file', file);
    // xhr.send(formData);
  
    // fetch(url, {
    //   method: 'POST',
    //   body: formData
    // })
    // .then(progressDone)

    // .catch(() => { /* Error. Inform the user */ })
}


/**
 * Here we create a new FileReader and call readAsDataURL on it with
 * the File object. As mentioned, this is asynchronous, so we need to add an
 * onloadend event handler in order to get the result of the read. We then use
 * the base 64 data URL as the src for a new image element and add it to the gallery
 * element. There are only two things that need to be done to make this work now:
 * add the gallery element, and make sure previewFile is actually called.
 */

function previewFile(file) {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function() {
      let img = document.createElement('img')
      img.src = reader.result
      document.getElementById('gallery').appendChild(img)
    }
}


/**
 * When we start uploading, initializeProgress will be called to reset the progress bar.
 * Then, with each completed upload, we’ll call progressDone to increment the number of
 * completed uploads and update the progress bar to show the current progress. So let’s call
 * these functions by updating a couple of old functions
**/

function initializeProgress(numfiles) {
    let filesCount = numfiles;
    progressBar.value = 0;
    uploadProgress = [];

    for(let i = filesCount; i > 0; i--) {
        uploadProgress.push(0)
    }
}
  
function updateProgress(fileNumber, percent) {
    // filesDone++
    // progressBar.value = filesDone / filesToDo * 100
    uploadProgress[fileNumber] = percent;
    let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length;
    progressBar.value = total;
  
}
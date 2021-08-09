const uploadFilesList = document.getElementById('uploadFilesList');
const filesUploadedEl = document.getElementById('filesUploadedEl');
const statusTextEl = document.getElementById('statusText');
const uploadBtn = document.querySelector('#uploadBtn');
const errorMessages = document.querySelector('#errorMessages');
const maxUploadSize = 5242880; // 5mb
const uploadServerFile = 'uploadHandling.php';
const deleteServerFile = 'deleteFile.php';

let dropArea = document.getElementById('drop-area');
let uploadedSizeTotal = 0;

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener('drop', handleDrop, false);

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
    handleFiles(files);
}

function handleFiles(files) {
    const inptFiles = [...files];

    inptFiles.forEach(file => {
        const formData = new FormData();
        if (file.size + uploadedSizeTotal > maxUploadSize) {
            showMaxUploadError();
        } else {
            formData.append('uploadedFile[]', file);
            uploadFile(formData, file.name);
        }
    });
}

function uploadFile(formData, fileName) {
    
    const xhr = new XMLHttpRequest();
    const fileEl = createFileProgressBlock(fileName);
    const progressBar = fileEl.querySelector('progress');
    let currentFileSize = 0;
    uploadFilesList.appendChild(fileEl);
    xhr.open('post', uploadServerFile);

    xhr.addEventListener('loadstart', (e) => {
        uploadBtn.classList.add('disabled');
        statusTextEl.innerText = 'Uploading...';
    });
    
    xhr.upload.addEventListener('progress', (e) => {
        progressBar.max = e.total;
        progressBar.value = e.loaded;
        
        currentFileSize = e.total; 

        if(!uploadBtn.classList.contains('disabled')) {
            uploadBtn.classList.add('disabled');
        }
    });
    
    xhr.addEventListener('loadend', (e) => {
        uploadFilesList.removeChild(fileEl);
        uploadBtn.classList.remove('disabled');
        
        uploadedSizeTotal += currentFileSize;
        statusTextEl.innerText = `Uploaded ${formatBytes(uploadedSizeTotal)} of max ${formatBytes(maxUploadSize)}`;
        
        const uploadedFileEl = createUploadedFileBlock(fileName, currentFileSize);
        filesUploadedEl.appendChild(uploadedFileEl);
    });

    xhr.addEventListener('error', (e) => {
        uploadFilesList.innerHTML = '<div>Error uploading your files!</div>';
        uploadBtn.classList.remove('disabled');
    });

    xhr.send(formData);
}

const showMaxUploadError = () => {
    errorMessages.innerText = `Sorry, you are not allowed to upload more than ${formatBytes(maxUploadSize)}`;
    setTimeout(() => {
        errorMessages.innerText = '';
    }, 3000);
}

const createFileProgressBlock = (fileName) => {
    const fileBlock = document.createElement('div');
    fileBlock.classList.add('fileProgressBlock');

    const fileBlock_progressBar = document.createElement('progress');
    const fileBlockId = Math.floor(1000 + Math.random() * 9000);
    fileBlock_progressBar.id = fileBlockId;
    fileBlock_progressBar.name = fileBlockId;
    fileBlock_progressBar.value = 0;

    const fileBlock_progressBar_label = document.createElement('label');
    fileBlock_progressBar_label.innerText = fileName;
    fileBlock_progressBar_label.htmlFor = fileBlockId;

    fileBlock.appendChild(fileBlock_progressBar_label);
    fileBlock.appendChild(fileBlock_progressBar);

    return fileBlock;
}

const createUploadedFileBlock = (fileName, bytes) => {
    const fileBlock = document.createElement('div');
    fileBlock.classList.add('file');
    fileBlock.setAttribute('data-file', fileName);
    fileBlock.setAttribute('data-size', bytes);

    const name = document.createElement('div');
    name.classList.add('name');
    name.innerText = fileName;

    const deleteFile = document.createElement('div');
    deleteFile.classList.add('delete');
    deleteFile.innerHTML = '<img src="bin.png" alt="Delete">';
    deleteFile.setAttribute('data-file', fileName);
    deleteFile.querySelector('img').setAttribute('data-file', fileName);
    deleteFile.addEventListener('click', removeFile, true);

    fileBlock.appendChild(name);
    fileBlock.appendChild(deleteFile);

    return fileBlock;
}

const removeFile = (e) => {
    const fileToDelete = e.target.getAttribute('data-file');
    const xhr = new XMLHttpRequest();
    const fileEl = filesUploadedEl.querySelector(`div[data-file="${fileToDelete}"]`);
    const icon = fileEl.querySelector('img');
    const size = fileEl.getAttribute('data-size');

    xhr.open('GET', `${deleteServerFile}?file=${fileToDelete}`, true );
    

    xhr.onloadstart = () => {
        icon.src = 'processing.gif';
        statusTextEl.innerText = 'Removing file...'
    }

    xhr.onloadend = () => {
        if(xhr.status === 200) {
            filesUploadedEl.removeChild(fileEl);
            uploadedSizeTotal -= size;
            uploadedSizeTotal === 0 ? statusTextEl.innerText = '' : statusTextEl.innerText = `Uploaded ${formatBytes(uploadedSizeTotal)} of max ${formatBytes(maxUploadSize)}`;
        }
    }

    xhr.send("file=" + fileToDelete);
}

const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return 'n/a'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    if (i === 0) return `${bytes} ${sizes[i]}`
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}

const getFileNames = () => {
    const result = [];

    const resultElements = filesUploadedEl.querySelectorAll('.file');

    if(resultElements.length > 0) {
        resultElements.forEach(i => {
            result.push(i.getAttribute('data-file'));
        });
    }

    return result;
}
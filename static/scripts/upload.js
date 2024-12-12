document.getElementById('browseFiles').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        uploadDocument(files[0]);
    }
});

document.getElementById('dropzone').addEventListener('drop', (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        uploadDocument(files[0]);
    }
});

document.getElementById('dropzone').addEventListener('dragover', (event) => {
    event.preventDefault();
});

function getCSRFToken() {
    const csrftoken = document.querySelector('[name=csrf_token]').value;
    return csrftoken;
}

function uploadDocument(file) {
    // Ensure the file is a PDF
    if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed!');
        return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    fetch('/upload_resume', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Resume uploaded successfully!');
            // Optionally reload the page or perform another action
        } else {
            alert('Error uploading resume. Please try again.');
            console.error('Upload failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
    });
}
const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileInput");
const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");
const fileURLInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");
const pageIcon = document.querySelector(".page-icon");
const appLogo = document.querySelector(".logo");
const homePageURL = "http://127.0.0.1:5500";

const host = "https://shareme-05c784a1a605.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedFileSize = 500 * 1024 * 1024;   // 500MB

// Function to add the "dragged" class
function addDraggedClass() {
    if (!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }
}

// Function to remove the "dragged" class
function removeDraggedClass() {
    dropZone.classList.remove("dragged");
}

// "dragover" event is fired continuously when an element or text selection
// is being dragged and the mouse pointer is over a valid drop target.
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    addDraggedClass();
});

// "dragleave" event is fired when a dragged element or text selection leaves a valid drop target.
dropZone.addEventListener("dragleave", () => {
    removeDraggedClass();
});

// "drop" event is fired when an element or text selection is dropped on a valid drop target.
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    removeDraggedClass();
    const files = e.dataTransfer.files;
    console.log(files);
    if(files.length) {
        fileInput.files = files;
        uploadFile();
    }
});

// Add event listener for triggering the uploadFile() function whenever the user chooses a file using the file input
fileInput.addEventListener("change", () => {
    uploadFile();
});

// Add event listener for mouseenter to keep the animation when hovering
dropZone.addEventListener("mouseenter", () => {
    addDraggedClass();
});

// Add event listener for mouseleave to remove the animation when not hovering
dropZone.addEventListener("mouseleave", () => {
    removeDraggedClass();
});

// Function to trigger file input click when browseBtn is clicked
browseBtn.addEventListener("click", () => {
    fileInput.click();
});


// uploadFile function prepares a file for upload, creates an XHR object, configures it for a POST request to the specified URL (uploadURL), and sends the file data
const uploadFile = () => {
    if(fileInput.files.length > 1) {
        fileInput.value = "";
        showToast("Please upload only 1 file");
        return;
    }
    const file = fileInput.files[0];
    if(file.size > maxAllowedFileSize) {
        fileInput.value = "";
        showToast("Cannot upload file larger than 500MB");
        return;
    }
    progressContainer.style.display = "block";
    
    const formData = new FormData();   // A FormData object is created to prepare the data for sending via an HTTP request. It allows you to construct a set of key-value pairs representing form fields and their values.
    formData.append("myfile", file);

    const xhr = new XMLHttpRequest();   // An instance of XMLHttpRequest is created. XHR is a browser API that allows you to make HTTP requests from JavaScript.
    xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };

    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror = () => {
        fileInput.value = "";
        showToast(`Error in upload: ${xhr.statusText}`);
    }

    xhr.open("POST", uploadURL);   // The open method initializes the request. It specifies the HTTP method (in this case, “POST”) and the URL (uploadURL) to which the request will be sent.
    xhr.send(formData);   // The send method sends the prepared formData (which includes the selected file) to the specified URL via an HTTP POST request.

}

// Functionality to calculate upload percentage of file at every some fraction of seconds
const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    console.log(percent);
    bgProgress.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent/100})`;
}

// When file upload is successful
const onUploadSuccess = ({ file: url }) => {
    pageIcon.style.display = "none";
    appLogo.style.display = "none";
    console.log(url);
    fileInput.value = "";   // After successful upload, make the value of fileInput blank, so that we can upload new file later.
    emailForm[2].removeAttribute("disabled");   // remove the disabled attribute so that 'Send' button works
    progressContainer.style.display = "none";   // hide back progress-bar once download page link is generated
    sharingContainer.style.display = "block";
    fileURLInput.value = url;
}

copyBtn.addEventListener("click", () => {
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link copied");
});

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // disable the 'Send' button after mail sent
    emailForm[2].setAttribute("disabled", "true");

    const url = fileURL.value;

    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    }
    console.log(formData);
    fetch(emailURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    }).then((res) => res.json())
      .then((data) => {
            if(data.success) {
                sharingContainer.style.display = "none";   // hide the box once email sent
                showToast("Email sent");
                pageIcon.style.display = "block";
                appLogo.style.display = "block";
            }
    });
});

let toastTimer;
const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

appLogo.addEventListener("click", () => {
    window.location.href = homePageURL;
});

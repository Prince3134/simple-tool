const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const downloadLink = document.getElementById("download-link");
const originalSize = document.getElementById("original-size");
const compressedSize = document.getElementById("compressed-size");
const savedSize = document.getElementById("saved-size");
const status = document.getElementById("status");

const imageInput = document.getElementById("image");
const chooseButton = document.getElementById("choose-btn");

const dropArea = document.getElementById("drop-area");
const previewBox = document.getElementById("preview-box");
const previewImage = document.getElementById("preview-image");
const fileName = document.getElementById("file-name");
const imageSize = document.getElementById("image-size");
const imageDimension = document.getElementById("image-dimension");
const removeButton = document.getElementById("remove-image");

function showPreview(file) {

    fileName.textContent = "Selected File : " + file.name;
    imageSize.textContent = "Size : " + (file.size / 1024 / 1024).toFixed(2) + " MB";
    originalSize.textContent = "Original Size : " + (file.size / 1024 / 1024).toFixed(2) + " MB";

    const reader = new FileReader();

    reader.onload = function (e) {

        previewImage.src = e.target.result;
        previewBox.style.display = "block";

        const img = new Image();

        img.onload = function () {
            imageDimension.textContent = "Dimensions : " + img.width + " × " + img.height + " px";
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// Choose File button opens native file picker
chooseButton.addEventListener("click", function () {
    imageInput.click();
});

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
    }

    showPreview(file);
});

dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
    }

    imageInput.files = e.dataTransfer.files;
    showPreview(file);
});

removeButton.addEventListener("click", () => {

    // Clear file input
    imageInput.value = "";

    // Hide preview
    previewBox.style.display = "none";

    // Reset preview image
    previewImage.src = "";

    // Reset file information
    fileName.textContent = "No file selected";
    imageSize.textContent = "Size : 0 MB";
    imageDimension.textContent = "Dimensions : 0 × 0 px";

    // Reset compression result
    originalSize.textContent = "Original Size : 0 MB";
    compressedSize.textContent = "Compressed Size : 0 MB";
    savedSize.textContent = "Saved : 0%";

    // Reset progress
    progressBar.style.width = "0%";
    progressText.textContent = "0%";

    // Hide download button
    downloadLink.style.display = "none";

});

// Compression Quality Slider
const qualitySlider = document.getElementById("quality");
const qualityValue = document.getElementById("quality-value");

qualitySlider.addEventListener("input", () => {
    qualityValue.textContent = qualitySlider.value + "%";
});

const form = document.querySelector("form");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const file = imageInput.files[0];
    if (!file) {
        alert("Please choose an image first.");
        return;
    }

    status.textContent = "Compressing...";
    downloadLink.style.display = "none";

    const formData = new FormData(form);

    progressBar.style.width = "10%";
    progressText.textContent = "10%";

    let progress = 10;

    const loading = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
            progressBar.style.width = progress + "%";
            progressText.textContent = progress + "%";
        }
    }, 200);

    try {

        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        clearInterval(loading);

        if (!response.ok) {
            throw new Error("Upload failed with status " + response.status);
        }

        const data = await response.json();

        progressBar.style.width = "100%";
        progressText.textContent = "100%";

        originalSize.textContent = "Original Size : " + (data.originalSize / 1024 / 1024).toFixed(2) + " MB";
        compressedSize.textContent = "Compressed Size : " + (data.compressedSize / 1024 / 1024).toFixed(2) + " MB";
        savedSize.textContent = "Saved : " + data.saved + "%";
        status.textContent = "✔ Compression Completed";

        downloadLink.href = data.download;
        downloadLink.textContent = "⬇ Download Compressed Image";
        downloadLink.style.display = "inline-block";

    } catch (err) {

        clearInterval(loading);
        progressBar.style.width = "0%";
        progressText.textContent = "0%";
        status.textContent = "✖ Compression failed. Please try again.";
        console.error(err);
    }

});
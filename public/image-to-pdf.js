let selectedImages = [];
let draggedIndex = null;

const chooseBtn = document.getElementById("choose-btn");
const imageInput = document.getElementById("images");
const previewContainer = document.getElementById("preview-container");
const fileName = document.getElementById("file-name");
const totalImages = document.getElementById("total-images");
const estimatedPages = document.getElementById("estimated-pages");

const pdfForm = document.getElementById("pdf-form");
const loadingBox = document.getElementById("loading-box");
const loadingProgress = document.getElementById("loading-progress");
const loadingPercent = document.getElementById("loading-percent");

chooseBtn.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", () => {

    const files = imageInput.files;

    if (files.length === 0) {
        fileName.textContent = "No images selected";
        return;
    }

    selectedImages = Array.from(files);

    renderImages();

});

function renderImages() {

    previewContainer.innerHTML = "";

    fileName.textContent = selectedImages.length + " image(s) selected";

    totalImages.textContent = "Images : " + selectedImages.length;
estimatedPages.textContent = "Pages : " + selectedImages.length;

    selectedImages.forEach((file, index) => {

        const card = document.createElement("div");
        card.className = "preview-card";
        const number = document.createElement("div");

number.className = "image-number";

number.innerHTML = index + 1;
                card.draggable = true;
                card.addEventListener("dragstart", function () {

    draggedIndex = index;

    card.classList.add("dragging");

});
card.addEventListener("dragend", function () {

    card.classList.remove("dragging");

});
card.addEventListener("dragover", function (e) {

    e.preventDefault();

});
card.addEventListener("drop", function () {

    const draggedImage = selectedImages[draggedIndex];

    selectedImages.splice(draggedIndex, 1);

    selectedImages.splice(index, 0, draggedImage);

    renderImages();

});


        const dragHandle = document.createElement("div");
dragHandle.className = "drag-handle";
dragHandle.innerHTML = "☰";

        const remove = document.createElement("button");
        remove.innerHTML = "❌";
        remove.className = "remove-btn";

        remove.addEventListener("click", function () {

            selectedImages.splice(index, 1);

            renderImages();

        });
        // ===============================
// Convert to PDF
// ===============================

const form = document.getElementById("pdf-form");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    console.log("Convert button clicked");

    if (selectedImages.length === 0) {

        alert("Please select images.");

        return;

    }

   const formData = new FormData();

selectedImages.forEach(file => {
    formData.append("images", file);
});

formData.append(
    "pageSize",
    document.getElementById("page-size").value
);

formData.append(
    "orientation",
    document.getElementById("orientation").value
);

formData.append(
    "imageFit",
    document.getElementById("image-fit").value
);

formData.append(
    "pdfQuality",
    document.getElementById("pdf-quality").value
);

formData.append(
    "pdfQuality",
    document.getElementById("pdf-quality").value
);

// Send PDF Settings

formData.append(
    "pageSize",
    document.getElementById("page-size").value
);

formData.append(
    "orientation",
    document.getElementById("orientation").value
);

formData.append(
    "imageFit",
    document.getElementById("image-fit").value
);
formData.append("pdfName", document.getElementById("pdf-name").value);

    try {

        const response = await fetch("/image-to-pdf", {

            method: "POST",

            body: formData

        });

        const data = await response.json();

        console.log(data);

        if (data.download) {

            window.location.href = data.download;

        }

    } catch (error) {

        console.log(error);

        alert("Error creating PDF.");

    }

});

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);

        const name = document.createElement("p");
        name.textContent = file.name;

        card.appendChild(dragHandle);
card.appendChild(number);

card.appendChild(remove);

card.appendChild(img);

card.appendChild(name);

        previewContainer.appendChild(card);

    });

}

pdfForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    if(selectedImages.length===0){

        alert("Please select images first.");

        return;

    }

    loadingBox.style.display="block";

    loadingProgress.style.width="10%";

    loadingPercent.textContent="10%";

    const formData=new FormData();

    selectedImages.forEach(image=>{

        formData.append("images",image);

    });

    try{

        loadingProgress.style.width="40%";
        loadingPercent.textContent="40%";

        const response=await fetch("/image-to-pdf",{

            method:"POST",

            body:formData

        });

        loadingProgress.style.width="80%";
        loadingPercent.textContent="80%";

        const data=await response.json();

        loadingProgress.style.width="100%";
        loadingPercent.textContent="100%";

     const fileName = document.getElementById("pdf-name").value || "My PDF";

const link = document.createElement("a");

link.href = data.download;

link.download = fileName + ".pdf";

document.body.appendChild(link);

link.click();

document.body.removeChild(link);
        setTimeout(function(){

            loadingBox.style.display="none";

            loadingProgress.style.width="0%";

            loadingPercent.textContent="0%";

        },1000);

    }

    catch(error){

        alert("PDF Generation Failed");

        console.log(error);

        loadingBox.style.display="none";

    }

});
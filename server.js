const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}



const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const storage = multer.diskStorage({
destination: uploadDir,    
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

/* =====================================
   IMAGE COMPRESSOR
===================================== */

app.post("/upload", upload.single("image"), async (req, res) => {

    try {

        const inputPath = req.file.path;
        const quality = Number(req.body.quality) || 60;

        const outputPath = path.join(
    outputDir,
    "compressed-" + req.file.filename
);

        await sharp(inputPath)
            .jpeg({ quality })
            .toFile(outputPath);

        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;

        const saved = (
            ((originalSize - compressedSize) / originalSize) * 100
        ).toFixed(2);

        res.json({
            success: true,
            originalSize,
            compressedSize,
            saved,
            download: "/download/" + path.basename(outputPath)
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Compression failed."
        });

    }

});

/* =====================================
   IMAGE TO PDF
===================================== */

app.post("/image-to-pdf", upload.array("images"), async (req, res) => {

    const pageSize = req.body.pageSize;
const orientation = req.body.orientation;
const imageFit = req.body.imageFit;
const pdfQuality = Number(req.body.pdfQuality) || 80;

const pdfName = req.body.pdfName || "My PDF";
console.log("PDF Quality:", pdfQuality);

console.log("===== PDF SETTINGS =====");
console.log("Page Size :", pageSize);
console.log("Orientation :", orientation);
console.log("Image Fit :", imageFit);

    console.log("===== IMAGE TO PDF =====");
    console.log(req.files);

    if (!req.files || req.files.length === 0) {

        return res.status(400).json({
            message: "No images uploaded"
        });

    }

const safePdfName = pdfName.replace(/[\\/:*?"<>|]/g, "_");

const finalPdfName = safePdfName + ".pdf";
const pdfPath = path.join(outputDir, finalPdfName);

const doc = new PDFDocument({
    autoFirstPage: false,
    size: pageSize,
    layout: orientation
});

    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    for (const file of req.files) {

   console.log(file.path);

let resizeWidth;
let jpegQuality;

if (pdfQuality == 100) {

    resizeWidth = null;
    jpegQuality = 100;

} else if (pdfQuality == 80) {

    resizeWidth = 1400;
    jpegQuality = 75;

} else {

    resizeWidth = 800;
    jpegQuality = 45;

}

let image = sharp(file.path);

if (resizeWidth) {

    image = image.resize({
        width: resizeWidth
    });

}

const buffer = await image
    .jpeg({
        quality: jpegQuality,
        mozjpeg: true
    })
    .toBuffer();
    console.log("JPEG Buffer Size:", buffer.length);
const metadata = await sharp(file.path).metadata();

const imageWidth = metadata.width;
const imageHeight = metadata.height;

doc.addPage({
    size: [imageWidth, imageHeight]
});

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;
  let imageOptions;

if (imageFit === "fit") {

    imageOptions = {
        fit: [pageWidth, pageHeight]
    };

} else {

    imageOptions = {
        cover: [pageWidth, pageHeight]
    };

}

doc.image(buffer, 0, 0, imageOptions);
}

    doc.end();

    stream.on("finish", () => {

    // Delete uploaded images
    req.files.forEach(file => {

        // fs.unlink(file.path, (err) => {
//     if (err) {
//         console.log("Delete Error:", err);
//     }
// });

    });

    res.json({

download: "/output/" + finalPdfName
    });

});

});

/* =====================================
   DOWNLOAD FOLDER
===================================== */

app.use("/download", express.static(outputDir));
app.use("/output", express.static(outputDir));

/* =====================================
   START SERVER
===================================== */

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");

const upload = multer({ dest: "upload/" });

const app = express();
const PORT = 3000;

//  cors
app.use(cors());
app.use(cors({ origin: "http://localhost:8080", credentials: true }));
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route prefix
app.use("", require("./routes/route"));

app.post("/upload", upload.single("files"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    res.status(200).json({
      message: "File uploaded successfully",
      file: req.file,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
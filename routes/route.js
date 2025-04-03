const express = require("express");
const router = express.Router();
const Expense = require("../models/expense"); // Use Expense consistently
const Category = require("../models/category");  // 
const multer = require("multer");
const fs = require("fs");

// Image/File Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("files");

// ✅ Insert Expense into DB
router.post("/add-expense", upload, async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please upload an image/docs", type: "danger" });
    }

    const expense = new Expense({
      amount: req.body.amount,
      date: req.body.date,
      category: req.body.category,
      paymentMethod: req.body.paymentMethod,
      description: req.body.description,
      files: req.file.filename,
    });

    await expense.save();
    res.status(201).json({ message: "Expense added successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message, type: "danger" });
  }
});

// ✅ Render Add Expense Page
router.get("/add-expense", (req, res) => {
  res.render("add-expense");
});

// ✅ Get All Transactions
router.get("/transactions", async (req, res) => {
  try {
    const expenses = await Expense.find(); // Fetch expenses from the database
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses" });
  }
});

// ✅ Fetch Single Transaction (Fixed)
router.get("/transactions/:id", async (req, res) => {
  try {
    const transaction = await Expense.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction" });
  }
});

// ✅ Edit Transaction
router.get("/transactions/edit-expense/:id", async (req, res) => {
  try {
    const transaction = await Expense.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to fetch transaction for editing" });
  }
});

// ✅ Update Transaction (Fixed)
router.post("/transactions/update-expense/:id", upload, async (req, res) => {
  try {
    const transaction = await Expense.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // If a new file is uploaded, delete the old file
    if (req.file && transaction.files) {
      fs.unlinkSync(`./uploads/${transaction.files}`);
      transaction.files = req.file.filename;
    }
    // Update other fields
    transaction.amount = req.body.amount;
    transaction.date = req.body.date;
    transaction.category = req.body.category;
    transaction.paymentMethod = req.body.paymentMethod;
    transaction.description = req.body.description;

    await transaction.save();
    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to update transaction" });
  }
});

//  delete transaction route
router.get("/transactions/delete-expense/:id", async (req, res) => {
  try {
    const transaction = await Expense.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    // Delete the file from the server
    if (transaction.files) {
      fs.unlinkSync(`./uploads/${transaction.files}`);
    }
    await Expense.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete transaction" });
  }
});

//  Insert category into db


router.post("/categories", upload, async (req, res) => {
  try {
    const { categoryName, color, budget } = req.body;

    // Validate input
    if (!categoryName || !color || !budget) {
      return res.status(400).json({ message: "All fields are required.", type: "danger" });
    }

    const category = new Category({
      categoryName,
      color,
      budget: parseFloat(budget), // Ensure budget is a number
    });

    await category.save();
    res.status(201).json({ message: "Category added successfully!", category });

  } catch (error) {
    console.error("Error saving category:", error); // Log the actual error
    res.status(500).json({ message: error.message, type: "danger" });
  }
});



module.exports = router;

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    }, 
    color: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
})

module.exports = mongoose.model("Category", categorySchema);
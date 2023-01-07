const mongoose = require("mongoose");

const ProdSchema = new mongoose.Schema(
  {
    name: { type: String},
    link:{ type: String },
    size: {type: Number},
    price: { type: Number },
    ingredients: [{ type: String }],
    nutritionInfo: [{ type: String }],
    description: { type: String },
    imgUrls: [{ type: String }],
    veg: [{ type: Boolean}]

  },
  { timestamps: true }
);

module.exports = mongoose.model("prod", ProdSchema);

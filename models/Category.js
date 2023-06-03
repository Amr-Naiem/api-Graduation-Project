const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
);

const SubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    main: {
      type: String,
      required: true
    }
  },
);


const SubCategory = mongoose.model("SubCategory", SubCategorySchema);
const Category = mongoose.model("Category", CategorySchema);

module.exports = { SubCategory, Category };
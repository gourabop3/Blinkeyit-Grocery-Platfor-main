const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

// Import models
const ProductModel = require("../models/product.model.js");
const CategoryModel = require("../models/category.model.js");
const SubCategoryModel = require("../models/subCategory.model.js");

// Live API endpoint
const LIVE_API_BASE = "https://binkeyit-server.vercel.app";

// Connect to local database
const connectDB = async () => {
  try {
    if (!process.env.MONGO_DB || process.env.MONGO_DB.includes("username:password")) {
      console.error("❌ Please configure MONGO_DB in .env file");
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ Connected to local MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Fetch all products from live API
const fetchAllProducts = async () => {
  console.log("🔍 Fetching product data from live site...");
  
  try {
    // First, get total count
    const firstResponse = await axios.post(`${LIVE_API_BASE}/api/product/get`, {
      page: 1,
      limit: 10
    });
    
    const totalProducts = firstResponse.data.totalCount;
    const totalPages = Math.ceil(totalProducts / 50); // Fetch 50 products per page
    
    console.log(`📊 Found ${totalProducts} products across ${totalPages} pages`);
    
    let allProducts = [];
    
    // Fetch all pages
    for (let page = 1; page <= totalPages; page++) {
      console.log(`📥 Fetching page ${page}/${totalPages}...`);
      
      const response = await axios.post(`${LIVE_API_BASE}/api/product/get`, {
        page: page,
        limit: 50
      });
      
      if (response.data.success) {
        allProducts = allProducts.concat(response.data.data);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ Successfully fetched ${allProducts.length} products`);
    return allProducts;
    
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    return [];
  }
};

// Import categories and subcategories
const importCategoriesAndSubCategories = async (products) => {
  console.log("📁 Importing categories and subcategories...");
  
  const categories = new Map();
  const subCategories = new Map();
  
  // Collect unique categories and subcategories
  products.forEach(product => {
    product.category.forEach(cat => {
      categories.set(cat._id, cat);
    });
    product.subCategory.forEach(subCat => {
      subCategories.set(subCat._id, subCat);
    });
  });
  
  // Import categories
  for (const [id, categoryData] of categories) {
    try {
      const existingCategory = await CategoryModel.findOne({ name: categoryData.name });
      if (!existingCategory) {
        const newCategory = new CategoryModel({
          name: categoryData.name,
          image: categoryData.image
        });
        await newCategory.save();
        console.log(`✅ Added category: ${categoryData.name}`);
      }
    } catch (error) {
      console.error(`❌ Error adding category ${categoryData.name}:`, error.message);
    }
  }
  
  // Import subcategories
  for (const [id, subCategoryData] of subCategories) {
    try {
      const existingSubCategory = await SubCategoryModel.findOne({ name: subCategoryData.name });
      if (!existingSubCategory) {
        // Find local category IDs
        const localCategories = await CategoryModel.find({
          name: { $in: subCategoryData.category.map(catId => {
            const cat = categories.get(catId);
            return cat ? cat.name : null;
          }).filter(Boolean) }
        });
        
        const newSubCategory = new SubCategoryModel({
          name: subCategoryData.name,
          image: subCategoryData.image,
          category: localCategories.map(cat => cat._id)
        });
        await newSubCategory.save();
        console.log(`✅ Added subcategory: ${subCategoryData.name}`);
      }
    } catch (error) {
      console.error(`❌ Error adding subcategory ${subCategoryData.name}:`, error.message);
    }
  }
};

// Import products
const importProducts = async (products) => {
  console.log("🛍️ Importing products...");
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const productData of products) {
    try {
      // Check if product already exists
      const existingProduct = await ProductModel.findOne({ name: productData.name });
      if (existingProduct) {
        skipped++;
        continue;
      }
      
      // Find local category and subcategory IDs
      const localCategories = await CategoryModel.find({
        name: { $in: productData.category.map(cat => cat.name) }
      });
      
      const localSubCategories = await SubCategoryModel.find({
        name: { $in: productData.subCategory.map(subCat => subCat.name) }
      });
      
      // Create new product
      const newProduct = new ProductModel({
        name: productData.name,
        image: productData.image,
        category: localCategories.map(cat => cat._id),
        subCategory: localSubCategories.map(subCat => subCat._id),
        unit: productData.unit,
        stock: productData.stock,
        price: productData.price,
        discount: productData.discount,
        description: productData.description,
        publish: productData.public || true
      });
      
      await newProduct.save();
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`⏳ Imported ${imported} products...`);
      }
      
    } catch (error) {
      errors++;
      console.error(`❌ Error importing product "${productData.name}":`, error.message);
    }
  }
  
  console.log(`\n📊 Import Summary:`);
  console.log(`✅ Imported: ${imported} products`);
  console.log(`⏭️ Skipped: ${skipped} products (already exist)`);
  console.log(`❌ Errors: ${errors} products`);
};

// Main import function
const importAllProducts = async () => {
  console.log("🚀 Starting product import from live Binkeyit site...\n");
  
  try {
    // Connect to database
    await connectDB();
    
    // Fetch all products from live API
    const products = await fetchAllProducts();
    
    if (products.length === 0) {
      console.log("❌ No products fetched. Exiting...");
      return;
    }
    
    // Import categories and subcategories first
    await importCategoriesAndSubCategories(products);
    
    // Import products
    await importProducts(products);
    
    console.log("\n🎉 Product import completed successfully!");
    
  } catch (error) {
    console.error("❌ Import failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the import
if (require.main === module) {
  importAllProducts().catch(console.error);
}

module.exports = { importAllProducts };
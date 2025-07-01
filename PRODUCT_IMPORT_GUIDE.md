# Product Import Guide - Binkeyit Website

## 🎯 **What This Does**
This script will import **ALL 560 products** from the live Binkeyit website (https://binkeyit-full-stack-ydrn.vercel.app) to your local database, including:

- ✅ **All product categories** (Masala, Oil & More, Dairy & Bakery, etc.)
- ✅ **All subcategories** (Whole Spices, Powdered Spices, Salt & Sugar, etc.)
- ✅ **All product details** (name, images, price, stock, description)
- ✅ **560+ complete products** with all metadata

## 🛠️ **Prerequisites**

### **Step 1: Set Up MongoDB Database**

You need a working MongoDB connection. Choose one option:

#### **Option A: MongoDB Atlas (Free - Recommended)**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account
3. Create a new cluster (M0 Sandbox - Free tier)
4. Create a database user
5. Get your connection string
6. Replace in `server/.env`:
```env
MONGO_DB=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/blinkeyit-grocery?retryWrites=true&w=majority
```

#### **Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Update `server/.env`:
```env
MONGO_DB=mongodb://localhost:27017/blinkeyit-grocery
```

#### **Option C: MongoDB Memory Server (Development Only)**
```bash
cd server
npm install mongodb-memory-server --save-dev
```

### **Step 2: Verify Environment**
Check if everything is configured:
```bash
cd server
node -e "
require('dotenv').config();
console.log('MONGO_DB:', process.env.MONGO_DB ? '✅ Set' : '❌ Missing');
"
```

## 🚀 **How to Import All Products**

### **Method 1: Using npm Script (Recommended)**
```bash
cd server
npm run import-products
```

### **Method 2: Direct Execution**
```bash
cd server
node scripts/import-products.js
```

## 📊 **Import Process**

The script will:

1. **🔍 Fetch Data**: Connect to live Binkeyit API and fetch all 560+ products
2. **📁 Import Categories**: Add all product categories to your database
3. **🏷️ Import Subcategories**: Add all subcategories with proper relationships
4. **🛍️ Import Products**: Add all products with images, prices, and details
5. **📈 Show Progress**: Real-time progress updates and final summary

### **Expected Output:**
```
🚀 Starting product import from live Binkeyit site...

✅ Connected to local MongoDB
🔍 Fetching product data from live site...
📊 Found 560 products across 12 pages
📥 Fetching page 1/12...
📥 Fetching page 2/12...
...
✅ Successfully fetched 560 products

📁 Importing categories and subcategories...
✅ Added category: Masala, Oil & More
✅ Added category: Dairy, Bread & Eggs
✅ Added category: Fruits & Vegetables
...
✅ Added subcategory: Whole Spices
✅ Added subcategory: Powdered Spices
...

🛍️ Importing products...
⏳ Imported 50 products...
⏳ Imported 100 products...
⏳ Imported 150 products...
...

📊 Import Summary:
✅ Imported: 560 products
⏭️ Skipped: 0 products (already exist)
❌ Errors: 0 products

🎉 Product import completed successfully!
🔌 Database connection closed
```

## 🎯 **What You'll Get**

After importing, your local database will have:

### **Categories:**
- Masala, Oil & More
- Dairy, Bread & Eggs  
- Fruits & Vegetables
- Snacks & Munchies
- Cold Drinks & Juices
- Breakfast & Instant Food
- Tea, Coffee & Health Drinks
- Bakery & Biscuits
- Sweet Tooth
- Atta, Rice & Dal
- Dry Fruits, Masala & Oil
- Organic & Healthy Living
- Baby Care
- Pharma & Wellness
- Cleaning Essentials
- Home & Office
- Personal Care
- Pet Care

### **Product Examples:**
- Whole Farm Premium Saunf Seeds (₹40)
- Catch Cumin Seeds Jeera Seeds (₹30)
- Tata Salt Lite 15% Less Sodium (₹30)
- Everest Turmeric Powder Haldi (₹20)
- Fresh produce, spices, oils, dairy products
- **All with original images from Cloudinary CDN**

### **Product Details Include:**
- ✅ **Name & Description**
- ✅ **Multiple product images**
- ✅ **Price & discount information**
- ✅ **Stock quantities**
- ✅ **Units (kg, grams, liters, etc.)**
- ✅ **Category & subcategory relationships**
- ✅ **Published status**

## ⚠️ **Important Notes**

### **Re-running the Script**
- ✅ **Safe to re-run**: Script checks for existing products and skips duplicates
- ✅ **No data loss**: Won't overwrite existing products
- ✅ **Incremental**: Only adds new products if live site is updated

### **Database Requirements**
- Requires active MongoDB connection
- Approximately **50-100 MB** of storage for all products
- Internet connection needed to fetch from live API

### **Troubleshooting**

#### **"MongoDB connection failed"**
- Check your MONGO_DB connection string in `.env`
- Ensure database is running (for local MongoDB)
- Verify network access (for Atlas)

#### **"Error fetching products"**
- Check internet connection
- Live API might be temporarily unavailable
- Try again in a few minutes

#### **"No products fetched"**
- Live API structure might have changed
- Check if live website is accessible

## 🔧 **Advanced Options**

### **Import Specific Categories Only**
Modify the script to filter by category:
```javascript
// In scripts/import-products.js, add filter
const filteredProducts = allProducts.filter(product => 
  product.category.some(cat => cat.name === "Fruits & Vegetables")
);
```

### **Custom Import Batch Size**
Change the batch size in the script:
```javascript
// Change from 50 to any number
limit: 100  // Fetch 100 products per page
```

### **Verify Import**
Check imported products:
```bash
# Connect to MongoDB and count products
mongo
use blinkeyit-grocery
db.products.count()
db.categories.count()
db.subcategories.count()
```

## 📁 **Files Created/Modified**

### **Created:**
- `server/scripts/import-products.js` - Main import script
- `PRODUCT_IMPORT_GUIDE.md` - This guide

### **Modified:**
- `server/package.json` - Added import script command
- `server/.env` - Added MongoDB configuration

## 🎉 **Next Steps After Import**

1. **✅ Start your backend server**: `npm run dev`
2. **✅ Start your frontend**: `cd ../client && npm run dev`
3. **✅ Visit your app**: `http://localhost:5173`
4. **✅ Check products**: Navigate to product pages
5. **✅ Admin dashboard**: View all imported products in admin panel

Your local Binkeyit store will now have the complete product catalog from the live website! 🛍️

## 🚀 **Quick Start Command**

```bash
# One-time setup (if not done already)
cd server
npm install axios

# Import all products
npm run import-products
```

The import process will take approximately **2-5 minutes** depending on your internet connection and database speed.
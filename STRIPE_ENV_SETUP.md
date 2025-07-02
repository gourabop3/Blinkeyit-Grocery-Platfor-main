# Stripe Environment Variables Setup Guide

## 🔑 **REQUIRED ENVIRONMENT VARIABLES**

### **1. Server Environment Variables** (`server/.env`)

```bash
# MongoDB Connection
MONGO_DB=your_mongodb_connection_string

# Server Configuration
PORT=8080
FRONTEND_URL=http://localhost:5173

# Stripe Configuration (REQUIRED)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_ENPOINT_WEBHOOK_SECRET_KEY=whsec_your_webhook_secret_here

# Optional (for production)
NODE_ENV=development
```

### **2. Client Environment Variables** (`client/.env`)

```bash
# Stripe Configuration (REQUIRED)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here

# API Configuration
VITE_API_URL=http://localhost:8080
```

---

## 🎯 **WHERE TO GET STRIPE KEYS**

### **Step 1: Create Stripe Account**
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up or log in to your account
3. Go to Dashboard

### **Step 2: Get API Keys**
1. **In Stripe Dashboard:**
   - Go to **Developers** → **API keys**
   - Copy **Publishable key** (starts with `pk_test_`)
   - Copy **Secret key** (starts with `sk_test_`)

### **Step 3: Set Up Webhook (For Order Completion)**
1. **In Stripe Dashboard:**
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `http://your-server-url/api/order/webhook`
   - Select events: `checkout.session.completed`
   - Copy the **Signing secret** (starts with `whsec_`)

---

## 📁 **CREATE ENVIRONMENT FILES**

### **Create `server/.env`:**
```bash
cd server
touch .env
```

**Add this content:**
```env
# Database
MONGO_DB=mongodb://localhost:27017/blinkeyit
# OR for MongoDB Atlas:
# MONGO_DB=mongodb+srv://username:password@cluster.mongodb.net/blinkeyit

# Server
PORT=8080
FRONTEND_URL=http://localhost:5173

# Stripe Keys (Replace with your actual keys)
STRIPE_SECRET_KEY=sk_test_51AbCdEf12345678901234567890123456789012345678901234567890123456789012345678901234567890
STRIPE_ENPOINT_WEBHOOK_SECRET_KEY=whsec_1234567890abcdef1234567890abcdef1234567890abcdef

# Environment
NODE_ENV=development
```

### **Create `client/.env`:**
```bash
cd client
touch .env
```

**Add this content:**
```env
# Stripe Public Key (Replace with your actual key)
VITE_STRIPE_PUBLIC_KEY=pk_test_51AbCdEf12345678901234567890123456789012345678901234567890123456789012345678901234567890

# API URL
VITE_API_URL=http://localhost:8080
```

---

## 🔒 **SECURITY IMPORTANT**

### **Never Commit These Files:**
Make sure your `.gitignore` includes:
```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
```

### **Key Types:**
- ✅ **Publishable key** (`pk_test_...`) - Safe for frontend
- ❌ **Secret key** (`sk_test_...`) - NEVER expose to frontend
- ❌ **Webhook secret** (`whsec_...`) - Server only

---

## 🚀 **QUICK SETUP COMMANDS**

### **For Development (Test Mode):**
```bash
# Server .env
cd server
cat > .env << 'EOF'
MONGO_DB=mongodb://localhost:27017/blinkeyit
PORT=8080
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_ENPOINT_WEBHOOK_SECRET_KEY=whsec_YOUR_WEBHOOK_SECRET_HERE
NODE_ENV=development
EOF

# Client .env
cd ../client
cat > .env << 'EOF'
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
VITE_API_URL=http://localhost:8080
EOF
```

### **Replace the placeholders:**
- `YOUR_SECRET_KEY_HERE` → Your actual Stripe secret key
- `YOUR_PUBLIC_KEY_HERE` → Your actual Stripe public key
- `YOUR_WEBHOOK_SECRET_HERE` → Your actual webhook secret

---

## ✅ **VERIFY SETUP**

### **1. Check Server Environment:**
```bash
cd server
node -e "require('dotenv').config(); console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET ✅' : 'MISSING ❌')"
```

### **2. Check Client Environment:**
```bash
cd client
node -e "console.log('VITE_STRIPE_PUBLIC_KEY:', process.env.VITE_STRIPE_PUBLIC_KEY ? 'SET ✅' : 'MISSING ❌')"
```

### **3. Test Stripe Connection:**
Start server and check logs:
```bash
cd server
npm start
# Should NOT see: "STRIPE_SECRET_KEY is missing in .env file"
```

---

## 🌐 **PRODUCTION SETUP**

### **For Production (Live Mode):**
Replace `test` keys with `live` keys:
```env
# Production server/.env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_ENPOINT_WEBHOOK_SECRET_KEY=whsec_your_live_webhook_secret

# Production client/.env
VITE_STRIPE_PUBLIC_KEY=pk_live_your_live_public_key
```

### **Production Webhook URL:**
- Update webhook endpoint to your production URL
- Example: `https://yourdomain.com/api/order/webhook`

---

## 🔧 **EXAMPLE WITH REAL FORMAT**

### **Server `.env` Example:**
```env
MONGO_DB=mongodb+srv://myuser:mypass@cluster0.mongodb.net/blinkeyit
PORT=8080
FRONTEND_URL=https://myapp.vercel.app
STRIPE_SECRET_KEY=sk_test_51MkL8dSGGvW8Yz3N5Q2KF9jR1mVxBz4hK7nP2qC8sT6vU9wX3yA5bE7fG1hJ4kL7mN9pR2sT5vW8xZ1cB4dF6gH9j
STRIPE_ENPOINT_WEBHOOK_SECRET_KEY=whsec_1M2n3B4v5C6x7Z8a9S1d2F3g4H5j6K7l
NODE_ENV=production
```

### **Client `.env` Example:**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_51MkL8dSGGvW8Yz3N5Q2KF9jR1mVxBz4hK7nP2qC8sT6vU9wX3yA5bE7fG1hJ4kL7mN9pR2sT5vW8xZ1cB4dF6gH9j
VITE_API_URL=https://myapi.herokuapp.com
```

---

## 📋 **CHECKLIST**

- [ ] Created `server/.env` with all required variables
- [ ] Created `client/.env` with Stripe public key
- [ ] Replaced placeholder keys with actual Stripe keys
- [ ] Set up Stripe webhook endpoint
- [ ] Added `.env` to `.gitignore`
- [ ] Tested server starts without Stripe errors
- [ ] Tested payment flow works

---

**Status: Ready to configure with your actual Stripe keys! 🎉**
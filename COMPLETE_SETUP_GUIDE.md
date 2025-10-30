# 🚀 Foodie App - Complete Setup Guide

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Expo CLI** - `npm install -g expo-cli`
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

---

## 🔧 Part 1: Backend Setup (Node.js)

### Step 1: Create Backend Folder

```bash
mkdir foodie-backend
cd foodie-backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken cors multer cloudinary stripe socket.io nodemailer express-validator helmet express-rate-limit morgan

npm install --save-dev nodemon
```

### Step 3: Create Folder Structure

```bash
mkdir config controllers middleware models routes uploads
```

Your structure should look like:
```
foodie-backend/
├── config/
│   └── cloudinary.js
├── controllers/
│   ├── authController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── restaurantController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── User.js
│   ├── Restaurant.js
│   ├── MenuItem.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── restaurants.js
│   ├── orders.js
│   ├── payments.js
│   └── admin.js
├── uploads/
├── .env
├── package.json
└── server.js
```

### Step 4: Setup Environment Variables

Create `.env` file:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/foodie_db
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodie_db

# JWT
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=30d

# Stripe (Get from: https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Cloudinary (Get from: https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 5: Run Backend

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

---

## 📱 Part 2: React Native Frontend Setup

### Step 1: Create React Native App

```bash
npx create-expo-app foodie-app
cd foodie-app
```

### Step 2: Install Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

# State Management
npm install @reduxjs/toolkit react-redux

# Stripe
npm install @stripe/stripe-react-native

# API Calls
npm install axios

# Maps
npm install react-native-maps

# Socket.io
npm install socket.io-client

# Image Picker
npx expo install expo-image-picker

# AsyncStorage
npm install @react-native-async-storage/async-storage

# Icons
npm install react-native-vector-icons
```

### Step 3: Create Folder Structure

```bash
mkdir -p src/screens/auth src/screens/user src/screens/restaurant src/screens/rider
mkdir -p src/components src/navigation src/redux/slices src/services src/utils src/styles
```

Structure:
```
foodie-app/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── KYCUploadScreen.js
│   │   ├── user/
│   │   │   ├── HomeScreen.js
│   │   │   ├── RestaurantDetailScreen.js
│   │   │   ├── CartScreen.js
│   │   │   ├── CheckoutScreen.js
│   │   │   ├── OrderTrackingScreen.js
│   │   │   ├── OrdersScreen.js
│   │   │   └── ProfileScreen.js
│   │   ├── restaurant/
│   │   │   ├── RestaurantDashboard.js
│   │   │   ├── RestaurantOrdersScreen.js
│   │   │   └── MenuManagementScreen.js
│   │   └── rider/
│   │       ├── RiderDashboard.js
│   │       └── DeliveryScreen.js
│   ├── components/
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   └── TabNavigator.js
│   ├── redux/
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── cartSlice.js
│   │       ├── restaurantSlice.js
│   │       └── orderSlice.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── constants.js
│   └── styles/
│       └── colors.js
├── App.js
└── package.json
```

### Step 4: Update API URL

In `src/utils/constants.js`:

```javascript
export const API_URL = 'http://YOUR_LOCAL_IP:5000/api';
// Example: export const API_URL = 'http://192.168.1.100:5000/api';
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
```

### Step 5: Add Stripe Key

In `App.js`, update:

```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
```

### Step 6: Run App

```bash
npx expo start

# Then press:
# - 'a' for Android
# - 'i' for iOS
# - Or scan QR code with Expo Go app
```

---

## 🔑 Part 3: Third-Party Services Setup

### 1. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB from: https://www.mongodb.com/try/download/community
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (Free tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your password
7. Paste in `.env` as `MONGODB_URI`

---

### 2. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create account
3. Activate test mode (top right toggle)
4. Go to "Developers" → "API Keys"
5. Copy:
   - **Publishable key** (pk_test_...) → Frontend `App.js`
   - **Secret key** (sk_test_...) → Backend `.env`
6. For Webhooks:
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - URL: `http://your-domain.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy signing secret → `.env` as `STRIPE_WEBHOOK_SECRET`

#### Test Cards:
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Any future date, any CVC
```

---

### 3. Cloudinary Setup (Image Upload)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret
5. Paste all three in `.env`

---

### 4. Email Setup (Gmail)

1. Enable 2-Factor Authentication in Gmail
2. Go to: Account → Security → App Passwords
3. Generate new app password
4. Use in `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=generated_app_password
   ```

---

## 🧪 Part 4: Testing the App

### Test User Accounts

Create these test users via Postman or register in app:

```json
// Customer
{
  "email": "customer@test.com",
  "password": "123456",
  "role": "customer"
}

// Restaurant Owner
{
  "email": "restaurant@test.com",
  "password": "123456",
  "role": "restaurant"
}

// Rider
{
  "email": "rider@test.com",
  "password": "123456",
  "role": "rider"
}

// Admin
{
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

### Testing Flow:

1. **Register as Customer** → Browse restaurants → Add to cart → Checkout
2. **Register as Restaurant** → Complete KYC → Add menu items → Accept orders
3. **Register as Rider** → Complete KYC → Go online → Accept deliveries
4. **Login as Admin** → Approve KYC → View all orders

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" in App
**Solution:** 
- Make sure backend is running
- Check API_URL has correct IP address
- Both devices on same WiFi network

### Issue 2: MongoDB Connection Failed
**Solution:**
- Check MongoDB is running: `mongod`
- Verify connection string in `.env`
- For Atlas: Whitelist your IP

### Issue 3: Stripe Payment Not Working
**Solution:**
- Use test mode keys (pk_test_... and sk_test_...)
- Check keys are correct in both frontend and backend
- Use test card: 4242 4242 4242 4242

### Issue 4: Images Not Uploading
**Solution:**
- Verify Cloudinary credentials
- Check internet connection
- Ensure uploads/ folder exists in backend

### Issue 5: Socket.io Not Connecting
**Solution:**
- Check backend server is running
- Verify correct URL in frontend
- Check firewall settings

---

## 📦 Part 5: Building for Production

### Android APK Build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview

# Download APK from expo.dev
```

### iOS Build:

```bash
# Requires Mac and Apple Developer Account
eas build --platform ios
```

---

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Create account on [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub"
3. Add environment variables from `.env`
4. Deploy!

### MongoDB Atlas (Already setup)
- Already hosted when you created cluster

### Frontend (Expo)
- App available via Expo Go automatically
- For production: Use `eas build` as shown above

---

## 📞 Support & Resources

- **Expo Docs:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **Stripe Docs:** https://stripe.com/docs
- **MongoDB Docs:** https://docs.mongodb.com/
- **Socket.io Docs:** https://socket.io/docs/

---

## ✅ Checklist

Before going live:

- [ ] Change JWT_SECRET to strong random string
- [ ] Use production Stripe keys
- [ ] Setup proper error logging
- [ ] Add rate limiting on APIs
- [ ] Configure CORS properly
- [ ] Setup MongoDB backups
- [ ] Test payment flows thoroughly
- [ ] Add proper validation on all inputs
- [ ] Setup monitoring (Sentry/LogRocket)
- [ ] Create privacy policy & terms

---

## 🎉 You're All Set!

Your food delivery app is now ready! Start building amazing features! 🚀
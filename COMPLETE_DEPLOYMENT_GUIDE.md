# 🚀 Complete Deployment Guide - Foodie App

## 📋 Deployment Checklist

Before deploying, ensure:
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database backed up
- [ ] Stripe in production mode
- [ ] Push notifications configured
- [ ] Error handling added everywhere
- [ ] Security headers configured
- [ ] CORS configured properly
- [ ] API rate limiting enabled
- [ ] Logging system in place

---

## 1️⃣ Backend Deployment (Railway/Render)

### Option A: Railway Deployment (Recommended)

#### Step 1: Prepare Backend

1. Create `Procfile` in backend root:
```
web: node server.js
```

2. Update `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

3. Add `.gitignore`:
```
node_modules/
.env
uploads/
*.log
```

#### Step 2: Deploy to Railway

1. Go to [Railway.app](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your repository
5. Railway auto-detects Node.js and deploys

#### Step 3: Add Environment Variables

In Railway Dashboard → Variables:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas (MUST use Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodie_db

# JWT
JWT_SECRET=use_a_strong_random_32_character_secret_here
JWT_EXPIRE=30d

# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL (will be your Expo app or web URL)
FRONTEND_URL=https://yourapp.com
```

#### Step 4: Get Deployment URL

- Railway provides: `https://your-app.railway.app`
- Copy this URL for frontend API configuration

---

### Option B: Render Deployment (Free Alternative)

1. Go to [Render.com](https://render.com/)
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables (same as Railway)
6. Deploy!

---

### Option C: Heroku Deployment

1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create foodie-backend`
4. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_uri
heroku config:set JWT_SECRET=your_secret
# ... all other env vars
```
5. Deploy:
```bash
git push heroku main
```

---

## 2️⃣ Database Deployment (MongoDB Atlas)

### Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (M0 Free tier)
4. Click "Connect"
5. Whitelist IP: Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
6. Create Database User with password
7. Get connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/foodie_db
```
8. Add to backend environment variables

### Setup Database Backups

1. In Atlas → Clusters → Backup
2. Enable Cloud Backup (automated daily backups)

---

## 3️⃣ Frontend Deployment (React Native)

### Option A: Expo Application Services (EAS)

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo

```bash
eas login
```

#### Step 3: Configure EAS

```bash
cd foodie-app
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### Step 4: Update API URL

In `src/utils/constants.js`:
```javascript
export const API_URL = 'https://your-backend.railway.app/api';
```

#### Step 5: Update Stripe Key

In `App.js`:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_live_YOUR_LIVE_KEY';
```

#### Step 6: Build Android APK

```bash
# For testing
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

Build takes 10-15 minutes. You'll get download link when done.

#### Step 7: Build iOS (Requires Apple Developer Account - $99/year)

```bash
eas build --platform ios --profile production
```

---

### Option B: Build Locally (Android)

```bash
# Generate Android APK locally
npx expo prebuild
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

---

## 4️⃣ Stripe Production Setup

### Switch to Production Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle "Test mode" OFF (top right)
3. Complete business verification:
   - Business details
   - Bank account for payouts
   - Identity verification

### Get Production Keys

1. Go to Developers → API Keys
2. Copy:
   - **Publishable key** (pk_live_...) → Frontend
   - **Secret key** (sk_live_...) → Backend

### Setup Webhooks

1. Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-backend.railway.app/api/payments/webhook`
3. Events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payout.created`
   - `payout.paid`
4. Copy webhook signing secret → Backend env

### Enable Payment Methods

1. Dashboard → Settings → Payment methods
2. Enable:
   - Cards
   - Google Pay
   - Apple Pay (for iOS)

---

## 5️⃣ Firebase Setup (Push Notifications)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Add project → "Foodie App"
3. Disable Google Analytics (optional)

### Step 2: Add Android App

1. Project Settings → Add App → Android
2. Package name: `com.yourcompany.foodieapp` (from app.json)
3. Download `google-services.json`
4. Place in: `foodie-app/android/app/`

### Step 3: Add iOS App (if building for iOS)

1. Add App → iOS
2. Bundle ID: `com.yourcompany.foodieapp`
3. Download `GoogleService-Info.plist`
4. Place in: `foodie-app/ios/`

### Step 4: Get Server Key

1. Project Settings → Cloud Messaging
2. Copy **Server Key**
3. Add to backend `.env`:
```env
FIREBASE_SERVER_KEY=your_server_key
```

### Step 5: Install Firebase in Backend

```bash
cd backend
npm install firebase-admin
```

Backend code for sending notifications already provided in previous artifacts.

---

## 6️⃣ Domain Setup (Optional)

### Custom Domain for Backend

#### Railway:
1. Settings → Domains → Add Custom Domain
2. Add DNS records as shown
3. Wait for SSL certificate (automatic)

#### Cloudflare (Recommended):
1. Add site to Cloudflare
2. Update nameservers at domain registrar
3. Add A/CNAME records pointing to Railway
4. Enable SSL

---

## 7️⃣ Security Hardening

### Backend Security

1. **Rate Limiting** (already in code):
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

2. **Helmet.js** (already included):
```javascript
const helmet = require('helmet');
app.use(helmet());
```

3. **CORS Configuration**:
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

4. **Input Validation**: Already using express-validator

5. **Environment Variables**: Never commit `.env`

---

## 8️⃣ Monitoring & Logging

### Option A: Sentry (Error Tracking)

```bash
# Backend
npm install @sentry/node

# In server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

### Option B: LogRocket (Frontend)

```bash
npm install logrocket
```

```javascript
import LogRocket from 'logrocket';
LogRocket.init('your-app-id');
```

---

## 9️⃣ Performance Optimization

### Backend

1. **Database Indexing**:
```javascript
// In models
schema.index({ field: 1 });
```

2. **Caching with Redis**:
```bash
npm install redis
```

3. **Image Compression**: Already using Cloudinary

4. **Gzip Compression**:
```javascript
const compression = require('compression');
app.use(compression());
```

### Frontend

1. **Image Optimization**: Use Cloudinary transformations
2. **Lazy Loading**: Load data as needed
3. **Bundle Size**: Analyze with `npx expo-doctor`

---

## 🔟 Testing Before Launch

### Checklist

- [ ] Test all user flows
- [ ] Test payment with real card
- [ ] Test push notifications
- [ ] Test on multiple devices (Android/iOS)
- [ ] Test with slow internet
- [ ] Test error scenarios
- [ ] Load test backend (use Artillery or k6)
- [ ] Security scan (use OWASP ZAP)

### Load Testing Example

```bash
npm install -g artillery

# Create test.yml
config:
  target: 'https://your-backend.railway.app'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - flow:
      - get:
          url: '/api/restaurants'

# Run test
artillery run test.yml
```

---

## 1️⃣1️⃣ Launch Preparation

### 1. Create Store Listings

#### Google Play Store:
1. Create Developer Account ($25 one-time)
2. Upload APK
3. Add screenshots, description
4. Set pricing (Free)
5. Submit for review (2-3 days)

#### Apple App Store:
1. Apple Developer Account ($99/year)
2. Upload via App Store Connect
3. Add metadata
4. Submit for review (1-2 days)

### 2. Marketing Materials

- App screenshots
- App icon (1024x1024)
- Feature graphics
- Privacy policy URL
- Terms of service URL

### 3. Legal Documents

Create and host:
- Privacy Policy
- Terms & Conditions
- Refund Policy
- Cookie Policy (if web version)

---

## 1️⃣2️⃣ Post-Launch

### Analytics Setup

```bash
# Firebase Analytics
npm install @react-native-firebase/analytics

# Track events
analytics().logEvent('order_placed', { orderId, amount });
```

### User Feedback

- Add in-app feedback form
- Monitor app store reviews
- Setup support email

### Continuous Deployment

#### GitHub Actions for Auto-Deploy:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          curl -X POST https://api.railway.app/deploys \
            -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}"
```

---

## 🎉 Deployment Complete!

Your app is now live! 

### Next Steps:
1. Monitor error logs daily
2. Collect user feedback
3. Plan feature updates
4. Scale infrastructure as needed

### Scaling Tips:
- **10-100 users**: Free tiers work fine
- **100-1000 users**: Upgrade MongoDB to M2 ($9/month)
- **1000-10000 users**: Consider load balancer, CDN
- **10000+ users**: Microservices, Kubernetes

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Expo Docs**: https://docs.expo.dev/
- **Stripe Docs**: https://stripe.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

---

## 💰 Estimated Monthly Costs

**Free Tier (0-100 users):**
- Backend: $0 (Railway/Render free tier)
- Database: $0 (MongoDB Atlas M0)
- Cloudinary: $0 (Free tier - 25GB)
- Stripe: 2.9% + Rs. 5 per transaction
- **Total: Rs. 0 fixed + transaction fees**

**Startup Tier (100-1000 users):**
- Backend: $5/month (Railway Hobby)
- Database: $9/month (MongoDB M2)
- Cloudinary: $0 (Still on free tier)
- Push Notifications: $0 (Firebase free)
- **Total: ~$14/month (~Rs. 3,500)**

**Growth Tier (1000-10000 users):**
- Backend: $20/month (Railway Pro)
- Database: $57/month (MongoDB M10)
- Cloudinary: $89/month (Advanced)
- Other services: $50/month
- **Total: ~$216/month (~Rs. 54,000)**

---

## 🚀 Ready for Launch!

Follow this guide step by step and your app will be live within 1 day! 🎉
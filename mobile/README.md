# MK Gold Coast - React Native App

Mobile app for the MK Gold Coast grocery platform. Mirrors the web app structure and connects to the same backend.

## Safe Mode (Demo / Offline)

When the backend is not running or not reachable, enable **Safe Mode** in `src/config/apiConfig.js`:

```js
export const SAFE_MODE = true;
```

- App works without backend connection
- Uses mock categories and sample products
- Login/Signup disabled (shows friendly message)
- Cart, Profile, Orders use empty/mock data
- Orange "Demo mode" banner shown at top

Set `SAFE_MODE = false` when backend is running and you want to connect.

## Setup

1. **Install dependencies** (already done if you ran `npm install` in the project root)
   ```bash
   cd mobile
   npm install
   ```

2. **Start the backend** (from project root)
   ```bash
   cd ../backend
   npm start
   ```
   The backend must be running on port 3000.

3. **Configure API URL** (for physical device only)
   - Edit `src/config/apiConfig.js`
   - Set `USE_DEVICE_IP = true`
   - Set `DEVICE_IP` to your computer's local IP (e.g., `192.168.1.5`)
   - Ensure your phone and computer are on the same WiFi network

## Run the App

```bash
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)
- Scan QR code with Expo Go app for physical device

## Structure

- `src/api/` - API client (axios) connected to backend
- `src/store/` - Redux (cart, product, category, address)
- `src/screens/` - All screens matching web app pages
- `src/components/` - Nav, Footer, Title, MainLayout
- `src/config/` - API base URL configuration

## Screens

- Home - Category grid
- Category - Products in category
- ProductItem - Product details + add to cart
- Cart - Cart items, address selection, checkout
- Address - Add delivery address
- Login / Signup - Auth
- Profile - User profile
- MyOrder - Order history
- BestSeller - Best selling products
- Search - Product search
- About / Contact - Info pages

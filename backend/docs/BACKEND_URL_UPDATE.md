# Backend URL Configuration Update

## ✅ **Updated Configuration**

Your frontend has been updated to use the new Render.com backend:

### **New Backend URL:** `https://cuet-sphere-service.onrender.com`

## 🔧 **Files Updated:**

### 1. **`Frontend/src/services/api.js`**
- Updated `API_BASE_URL` fallback to use Render.com URL
- All API calls will now go to your production backend

### 2. **`Frontend/vite.config.ts`**
- Updated proxy configuration for development server
- Changed `secure: false` to `secure: true` for HTTPS
- Updated target URLs to point to Render.com

### 3. **`Frontend/.env`**
- Set `VITE_API_URL=https://cuet-sphere-service.onrender.com`
- This environment variable takes precedence

## 🚀 **Testing Your Setup**

### 1. **Start Frontend Development Server**
```bash
cd Frontend
npm run dev
```

### 2. **Test API Connection**
- Open browser to `http://localhost:5173`
- Try logging in with admin credentials:
  - Email: `u2204015@student.cuet.ac.bd`
  - Password: `asdf`

### 3. **Check Network Tab**
- Open browser DevTools → Network tab
- Verify API calls are going to `https://cuet-sphere-service.onrender.com`

## 🔄 **Configuration Details**

### **Development Mode (npm run dev)**
- Uses Vite proxy to forward API calls
- Proxy target: `https://cuet-sphere-service.onrender.com`
- All `/api` and `/auth` routes are proxied

### **Production Build (npm run build)**
- Direct API calls to `https://cuet-sphere-service.onrender.com`
- No proxy needed in production

## 🐛 **Troubleshooting**

### **CORS Issues**
If you encounter CORS errors, make sure your backend's CORS configuration allows your frontend domain:

```properties
# In your backend application-prod.properties
cors.allowed.origins=http://localhost:5173,https://your-frontend-domain.onrender.com
```

### **SSL/HTTPS Issues**
- Render.com provides HTTPS by default
- Make sure `secure: true` in Vite config (already updated)

### **Connection Timeout**
- Render.com free tier may have cold starts
- First request might take 30+ seconds if service is sleeping

## ✅ **Verification Checklist**

- [ ] Frontend starts without errors
- [ ] API calls visible in Network tab going to Render.com
- [ ] Login functionality works
- [ ] No CORS errors in console
- [ ] All API endpoints responding correctly

Your frontend is now configured to use your production backend on Render.com!
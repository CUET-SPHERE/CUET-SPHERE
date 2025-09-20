# Environment Configuration Guide

## 🔧 How to Switch Between Development and Production Modes

### Quick Switch:

1. **For Local Development (Backend on localhost:5454):**
   ```bash
   # In Frontend/.env file, set:
   VITE_MODE=development
   ```

2. **For Production (Backend on Render.com):**
   ```bash
   # In Frontend/.env file, set:
   VITE_MODE=production
   ```

### Configuration Options:

| Mode          | Backend URL                                | Use Case                    |
| ------------- | ------------------------------------------ | --------------------------- |
| `development` | `http://localhost:5454`                    | Local testing, development  |
| `production`  | `https://cuet-sphere-service.onrender.com` | Testing against live server |

### Environment Variables:

- `VITE_MODE`: Controls which backend to use (`development` or `production`)
- `VITE_LOCAL_API_URL`: Local backend URL (default: `http://localhost:5454`)
- `VITE_PRODUCTION_API_URL`: Production backend URL (default: `https://cuet-sphere-service.onrender.com`)

### Testing Steps:

1. **Test Local Backend:**
   - Set `VITE_MODE=development` in `.env`
   - Start your backend: `cd backend && mvn spring-boot:run`
   - Start frontend: `cd Frontend && npm run dev`
   - Backend should be accessible at `http://localhost:5454`

2. **Test Production Backend:**
   - Set `VITE_MODE=production` in `.env`
   - Start frontend: `cd Frontend && npm run dev`
   - Frontend will connect to `https://cuet-sphere-service.onrender.com`

### Debugging:

Check the browser console for API configuration logs:
```
🔧 API Configuration:
  Mode: development
  API Base URL: http://localhost:5454
  DEV Mode: false
```

### Common Issues:

1. **403 Errors in Development Mode:**
   - Ensure your local backend is running on port 5454
   - Check CORS configuration in `AppConfig.java`
   - Verify `VITE_MODE=development` in `.env`

2. **403 Errors in Production Mode:**
   - Check if your Render.com deployment is running
   - Verify production CORS allows your frontend domain
   - Check network connectivity

### Files Modified:

- `Frontend/.env` - Environment variables
- `Frontend/src/services/api.js` - API configuration logic
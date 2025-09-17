# CUET Sphere Frontend

A modern React-based frontend for the CUET Sphere university management system.

## Features

### Image Cropping System
The application includes a comprehensive image cropping system for profile and background images:

#### ImageCropModal Component
- **Location**: `src/components/ImageCropModal.jsx`
- **Purpose**: Provides an intuitive interface for users to crop images before uploading
- **Key Features**:
  - Drag-and-resize crop area
  - Zoom controls (50% - 200%)
  - 90-degree rotation
  - Real-time preview
  - Configurable aspect ratios
  - Minimum size validation

#### Profile Image Cropping
- **Aspect Ratio**: 1:1 (Square)
- **Minimum Size**: 150x150 pixels
- **Usage**: Profile pictures in user profiles

#### Background Image Cropping
- **Aspect Ratio**: 16:9 (Widescreen)
- **Minimum Size**: 400x225 pixels
- **Usage**: Cover photos/background images

### How to Use Image Cropping

1. **Navigate to Profile Page**: Click on your profile or the edit profile button
2. **Upload Image**: Click "Choose Image" or "Choose Background" button
3. **Select File**: Choose an image file (JPEG, PNG, or WebP)
4. **Crop Interface**: 
   - Drag the corners to resize the crop area
   - Use the zoom slider to scale the image
   - Click "Rotate" to rotate the image 90 degrees
   - Preview shows the final result
5. **Apply**: Click "Apply Crop" to proceed with upload
6. **Upload**: The cropped image is automatically uploaded to AWS S3

### Dependencies
- `react-image-crop`: Core cropping functionality
- `lucide-react`: Icons for the UI
- Standard React hooks for state management

### File Structure
```
src/
├── components/
│   ├── ImageCropModal.jsx     # Main cropping component
│   └── ...
├── pages/
│   ├── ProfilePage.jsx        # Integrated cropping in profile
│   └── ...
```

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## Mock Credentials for Testing

```
Email: cuetStudent@gmail.com
Password: asdfg1122
```

## Environment Configuration

Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5454
```

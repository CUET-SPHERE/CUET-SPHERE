import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, RotateCw, ZoomIn, ZoomOut, Move, Crop, Check } from 'lucide-react';

const AdvancedImageCropModal = ({
   isOpen,
   onClose,
   onCropComplete,
   imageFile,
   cropType = 'profile', // 'profile' or 'background'
   title = "Crop Image"
}) => {
   const [imageSrc, setImageSrc] = useState(null);
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [rotation, setRotation] = useState(0);
   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
   const [isProcessing, setIsProcessing] = useState(false);

   // Configure aspect ratio and shape based on crop type
   const cropConfig = {
      profile: {
         aspect: 1, // 1:1 for circular profile pictures
         cropShape: 'round',
         showGrid: false,
         minZoom: 0.5,
         maxZoom: 3,
         title: 'Crop Profile Picture'
      },
      background: {
         aspect: 16 / 9, // 16:9 for background images
         cropShape: 'rect',
         showGrid: true,
         minZoom: 0.3,
         maxZoom: 2,
         title: 'Crop Background Image'
      }
   };

   const config = cropConfig[cropType] || cropConfig.profile;

   // Load image when file changes
   React.useEffect(() => {
      if (imageFile && isOpen) {
         const reader = new FileReader();
         reader.onload = (e) => {
            setImageSrc(e.target.result);
            // Reset crop settings when new image is loaded
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
            setCroppedAreaPixels(null);
         };
         reader.readAsDataURL(imageFile);
      }
   }, [imageFile, isOpen]);

   // Handle crop area change
   const onCropChange = useCallback((newCrop) => {
      setCrop(newCrop);
   }, []);

   // Handle zoom change
   const onZoomChange = useCallback((newZoom) => {
      setZoom(newZoom);
   }, []);

   // Handle rotation change
   const onRotationChange = useCallback((newRotation) => {
      setRotation(newRotation);
   }, []);

   // Handle crop complete
   const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
   }, []);

   // Create cropped image
   const createCroppedImage = useCallback(async () => {
      if (!imageSrc || !croppedAreaPixels) return null;

      return new Promise((resolve) => {
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');
         const image = new Image();

         image.onload = () => {
            const { width, height, x, y } = croppedAreaPixels;

            // Set canvas size to the crop size
            canvas.width = width;
            canvas.height = height;

            // Apply rotation if needed
            if (rotation !== 0) {
               ctx.save();
               ctx.translate(width / 2, height / 2);
               ctx.rotate((rotation * Math.PI) / 180);
               ctx.translate(-width / 2, -height / 2);
            }

            // Draw the cropped image
            ctx.drawImage(
               image,
               x,
               y,
               width,
               height,
               0,
               0,
               width,
               height
            );

            if (rotation !== 0) {
               ctx.restore();
            }

            // Convert canvas to blob
            canvas.toBlob((blob) => {
               if (blob) {
                  // Create a new File object from the blob
                  const croppedFile = new File([blob], imageFile.name, {
                     type: imageFile.type,
                     lastModified: Date.now()
                  });
                  resolve(croppedFile);
               } else {
                  resolve(null);
               }
            }, imageFile.type, 0.95);
         };

         image.src = imageSrc;
      });
   }, [imageSrc, croppedAreaPixels, rotation, imageFile]);

   // Handle save crop
   const handleSaveCrop = async () => {
      if (!croppedAreaPixels) {
         alert('Please adjust the crop area before saving.');
         return;
      }

      setIsProcessing(true);
      try {
         const croppedImage = await createCroppedImage();
         if (croppedImage) {
            onCropComplete(croppedImage);
            handleClose();
         } else {
            throw new Error('Failed to create cropped image');
         }
      } catch (error) {
         console.error('Error creating cropped image:', error);
         alert('Failed to crop image. Please try again.');
      } finally {
         setIsProcessing(false);
      }
   };

   // Handle close
   const handleClose = () => {
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setIsProcessing(false);
      onClose();
   };

   // Zoom controls
   const handleZoomIn = () => {
      setZoom(Math.min(zoom + 0.1, config.maxZoom));
   };

   const handleZoomOut = () => {
      setZoom(Math.max(zoom - 0.1, config.minZoom));
   };

   // Rotation controls
   const handleRotateLeft = () => {
      setRotation((rotation - 90) % 360);
   };

   const handleRotateRight = () => {
      setRotation((rotation + 90) % 360);
   };

   if (!isOpen || !imageSrc) {
      return null;
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
               <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                     {title || config.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                     {cropType === 'profile'
                        ? 'Drag to reposition, use controls to zoom and rotate'
                        : 'Crop your background image to 16:9 aspect ratio'
                     }
                  </p>
               </div>
               <button
                  onClick={handleClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  disabled={isProcessing}
               >
                  <X className="h-6 w-6" />
               </button>
            </div>

            {/* Crop Area */}
            <div className="relative">
               <div className="h-96 bg-gray-100 dark:bg-gray-900">
                  <Cropper
                     image={imageSrc}
                     crop={crop}
                     zoom={zoom}
                     rotation={rotation}
                     aspect={config.aspect}
                     cropShape={config.cropShape}
                     showGrid={config.showGrid}
                     onCropChange={onCropChange}
                     onZoomChange={onZoomChange}
                     onRotationChange={onRotationChange}
                     onCropComplete={onCropCompleteCallback}
                     minZoom={config.minZoom}
                     maxZoom={config.maxZoom}
                     restrictPosition={false}
                     style={{
                        containerStyle: {
                           position: 'relative',
                           width: '100%',
                           height: '100%',
                           backgroundColor: '#f3f4f6'
                        }
                     }}
                  />
               </div>

               {/* Crop Info Overlay */}
               {cropType === 'profile' && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-sm">
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                        <span>Circular crop for profile picture</span>
                     </div>
                  </div>
               )}
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
               {/* Zoom Controls */}
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Zoom:
                     </label>
                     <button
                        onClick={handleZoomOut}
                        className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        disabled={zoom <= config.minZoom}
                     >
                        <ZoomOut className="h-4 w-4" />
                     </button>
                     <input
                        type="range"
                        min={config.minZoom}
                        max={config.maxZoom}
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-32"
                     />
                     <button
                        onClick={handleZoomIn}
                        className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        disabled={zoom >= config.maxZoom}
                     >
                        <ZoomIn className="h-4 w-4" />
                     </button>
                     <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                        {Math.round(zoom * 100)}%
                     </span>
                  </div>

                  {/* Rotation Controls */}
                  <div className="flex items-center gap-4">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rotate:
                     </label>
                     <button
                        onClick={handleRotateLeft}
                        className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="Rotate left 90°"
                     >
                        <RotateCw className="h-4 w-4 transform rotate-180" />
                     </button>
                     <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-24"
                     />
                     <button
                        onClick={handleRotateRight}
                        className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="Rotate right 90°"
                     >
                        <RotateCw className="h-4 w-4" />
                     </button>
                     <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                        {rotation}°
                     </span>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end gap-3">
                  <button
                     onClick={handleClose}
                     disabled={isProcessing}
                     className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleSaveCrop}
                     disabled={!croppedAreaPixels || isProcessing}
                     className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                     {isProcessing ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Processing...
                        </>
                     ) : (
                        <>
                           <Check className="h-4 w-4" />
                           Apply Crop
                        </>
                     )}
                  </button>
               </div>

               {/* Crop Instructions */}
               <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="flex items-start gap-3">
                     <Move className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                     <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">How to crop:</p>
                        <ul className="space-y-1 text-xs">
                           <li>• Drag the image to reposition it within the crop area</li>
                           <li>• Use zoom controls to scale the image</li>
                           <li>• Rotate the image if needed</li>
                           <li>• {cropType === 'profile' ? 'Image will be cropped as a circle' : 'Keep important content within the crop area'}</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default AdvancedImageCropModal;
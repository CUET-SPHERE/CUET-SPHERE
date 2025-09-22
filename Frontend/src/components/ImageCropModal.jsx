import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, RotateCw, Crop, Download } from 'lucide-react';

const ImageCropModal = ({ 
  isOpen, 
  onClose, 
  onCropComplete, 
  imageFile, 
  aspectRatio = 1, // 1 for square (profile), 16/9 for banner, etc.
  title = "Crop Image",
  minWidth = 150,
  minHeight = 150 
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  React.useEffect(() => {
    if (imageFile && isOpen) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, isOpen]);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    
    // Set initial crop based on aspect ratio
    let cropWidth, cropHeight;
    
    if (aspectRatio) {
      if (width / height > aspectRatio) {
        cropHeight = 80;
        cropWidth = cropHeight * aspectRatio;
      } else {
        cropWidth = 80;
        cropHeight = cropWidth / aspectRatio;
      }
    } else {
      cropWidth = 80;
      cropHeight = 80;
    }

    setCrop({
      unit: '%',
      width: cropWidth,
      height: cropHeight,
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2
    });
  }, [aspectRatio]);

  const handleRotation = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Set canvas size to crop size
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(cropWidth / 2, cropHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cropWidth / 2, -cropHeight / 2);
    }

    // Draw the cropped image
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    if (rotation !== 0) {
      ctx.restore();
    }

    return new Promise((resolve) => {
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
    });
  }, [completedCrop, rotation, imageFile]);

  const handleCropComplete = async () => {
    try {
      const croppedFile = await generateCroppedImage();
      if (croppedFile) {
        onCropComplete(croppedFile);
        onClose();
      }
    } catch (error) {
      console.error('Error generating cropped image:', error);
      alert('Failed to crop image. Please try again.');
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
    setCompletedCrop(null);
    setRotation(0);
    setScale(1);
    onClose();
  };

  if (!isOpen || !imageSrc) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6">
          <div className="mb-4 max-h-96 overflow-hidden flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={minWidth}
              minHeight={minHeight}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-w-full max-h-96 object-contain"
                style={{
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  transformOrigin: 'center'
                }}
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={handleRotation}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              Rotate
            </button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Zoom:
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(scale * 100)}%
              </span>
            </div>
          </div>

          {/* Preview Canvas (hidden) */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCropComplete}
            disabled={!completedCrop}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <Crop className="h-4 w-4" />
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
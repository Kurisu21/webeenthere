'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * scaleX * pixelRatio;
    canvas.height = crop.height * scaleY * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.95);
  }, [completedCrop, onCropComplete]);

  const handleCrop = () => {
    getCroppedImg();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg border border-app w-full max-w-2xl p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Crop Your Image</h3>
        
        <div className="mb-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={50}
            minHeight={50}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imageSrc}
              style={{ maxHeight: '70vh', maxWidth: '100%' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-surface-elevated dark:bg-surface hover:bg-surface text-primary dark:text-primary border border-app hover:border-primary/30 dark:hover:border-primary/30 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={!completedCrop}
            className="px-6 py-2 bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}


















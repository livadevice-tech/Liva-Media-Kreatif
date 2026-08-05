import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImageBase64: string) => void;
}

export function ImageCropperModal({ isOpen, imageSrc, onClose, onCropComplete }: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        width / height,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const getCroppedImg = () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    onCropComplete(base64Image);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Crop Gambar</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center min-h-[300px]">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoad}
                className="max-h-[60vh] w-auto mx-auto object-contain"
              />
            </ReactCrop>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={getCroppedImg}
            disabled={!completedCrop?.width || !completedCrop?.height}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Terapkan & Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

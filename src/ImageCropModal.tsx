import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropModalProps {
  isOpen: boolean;
  charId: string;
  imageSrc: string;
  characterName: string;
  hasExistingImage?: boolean;
  onClose: () => void;
  onSave: (charId: string, croppedDataUrl: string) => void;
  onRemoveImage?: (charId: string) => void;
  onFilePicked?: (file: File) => void;
}

const VIEWPORT_SIZE = 300; // 300x300 preview square in modal
const OUTPUT_SIZE = 400;   // High-quality, fast & compact 400x400 square for avatar storage

export default function ImageCropModal({
  isOpen,
  charId,
  imageSrc,
  characterName,
  hasExistingImage,
  onClose,
  onSave,
  onRemoveImage,
  onFilePicked
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 400, height: 400 });
  const [isImageReady, setIsImageReady] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fileInputInsideModalRef = useRef<HTMLInputElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Preload and validate image as soon as imageSrc arrives
  useEffect(() => {
    if (!isOpen) return;

    if (!imageSrc) {
      setIsImageReady(false);
      loadedImageRef.current = null;
      return;
    }

    setIsImageReady(false);
    setStatusMessage('CARREGANDO IMAGEM...');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;
      setNaturalDimensions({
        width: img.naturalWidth || 400,
        height: img.naturalHeight || 400
      });
      setIsImageReady(true);
      setStatusMessage('');
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.onerror = () => {
      setIsImageReady(false);
      setStatusMessage('FALHA AO PROCESSAR IMAGEM');
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Compute scale so the image completely covers the 300x300 square
  const baseScale = Math.max(
    VIEWPORT_SIZE / (naturalDimensions.width || 1),
    VIEWPORT_SIZE / (naturalDimensions.height || 1)
  );

  const currentDisplayWidth = naturalDimensions.width * baseScale * zoom;
  const currentDisplayHeight = naturalDimensions.height * baseScale * zoom;

  const clampPan = useCallback((x: number, y: number, z: number) => {
    const w = naturalDimensions.width * baseScale * z;
    const h = naturalDimensions.height * baseScale * z;
    const limitX = Math.max(0, (w - VIEWPORT_SIZE) / 2);
    const limitY = Math.max(0, (h - VIEWPORT_SIZE) / 2);
    return {
      x: Math.max(-limitX, Math.min(limitX, x)),
      y: Math.max(-limitY, Math.min(limitY, y))
    };
  }, [naturalDimensions, baseScale]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const newX = panStartRef.current.x + deltaX;
    const newY = panStartRef.current.y + deltaY;
    setPan(clampPan(newX, newY, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    const newX = panStartRef.current.x + deltaX;
    const newY = panStartRef.current.y + deltaY;
    setPan(clampPan(newX, newY, zoom));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    const nextZoom = Math.min(4, Math.max(1, zoom + delta));
    setZoom(nextZoom);
    setPan(prev => clampPan(prev.x, prev.y, nextZoom));
  };

  const handleZoomChange = (val: number) => {
    const clamped = Math.min(4, Math.max(1, val));
    setZoom(clamped);
    setPan(prev => clampPan(prev.x, prev.y, clamped));
  };

  const handleResetPosition = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // File pick from within the modal
  const handleInternalFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFilePicked) {
      onFilePicked(file);
    }
    e.target.value = '';
  };

  // Execute Crop and Save
  const handleConfirmCrop = () => {
    const img = loadedImageRef.current;
    if (!img) {
      alert('Selecione uma imagem válida primeiro.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Erro ao processar imagem no navegador.');
        return;
      }

      // Background fill
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const ratio = OUTPUT_SIZE / VIEWPORT_SIZE;
      const drawLeft = ((VIEWPORT_SIZE - currentDisplayWidth) / 2 + pan.x) * ratio;
      const drawTop = ((VIEWPORT_SIZE - currentDisplayHeight) / 2 + pan.y) * ratio;
      const drawWidth = currentDisplayWidth * ratio;
      const drawHeight = currentDisplayHeight * ratio;

      ctx.drawImage(img, drawLeft, drawTop, drawWidth, drawHeight);

      // Compact JPEG export (safe, fast, doesn't overload memory)
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      onSave(charId, croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Erro ao recortar imagem:', err);
      alert('Não foi possível recortar a imagem. Tente outro arquivo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-black border-2 border-white max-w-md w-full p-4 md:p-5 flex flex-col items-center shadow-2xl">
        
        {/* Hidden internal file picker */}
        <input
          type="file"
          ref={fileInputInsideModalRef}
          className="hidden"
          accept="image/*"
          onChange={handleInternalFileInput}
        />

        {/* Modal Header */}
        <div className="w-full flex items-center justify-between border-b border-white pb-2 mb-3">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 block font-mono">
              [ FOTO DE PERFIL // ENQUADRAMENTO 1:1 ]
            </span>
            <h3 className="font-extrabold text-xs uppercase text-white tracking-wide truncate max-w-[220px]">
              {characterName || 'PERSONAGEM'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-0.5 border border-white text-xs uppercase font-bold hover:bg-white hover:text-black cursor-pointer"
          >
            FECHAR [X]
          </button>
        </div>

        {/* Instructions */}
        <p className="text-[10px] uppercase text-neutral-300 mb-2 text-center">
          {imageSrc ? "Arraste a imagem para centralizar e use o zoom para ajustar." : "Selecione uma imagem do seu computador para enquadrar."}
        </p>

        {/* Crop Viewport Area (1:1 Square) */}
        {imageSrc && isImageReady ? (
          <div
            className="relative border-2 border-white overflow-hidden bg-neutral-950 cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center touch-none select-none"
            style={{ width: `${VIEWPORT_SIZE}px`, height: `${VIEWPORT_SIZE}px` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onWheel={handleWheel}
          >
            {/* WhatsApp-style 3x3 Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 border border-white/40">
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div></div>
            </div>

            {/* Corner Markers */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white pointer-events-none z-20"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white pointer-events-none z-20"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white pointer-events-none z-20"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white pointer-events-none z-20"></div>

            {/* Scaled & Positioned Image */}
            <img
              src={imageSrc}
              alt="Prévia do Enquadramento"
              draggable={false}
              className="absolute pointer-events-none select-none max-w-none transition-none"
              style={{
                width: `${currentDisplayWidth}px`,
                height: `${currentDisplayHeight}px`,
                left: `${(VIEWPORT_SIZE - currentDisplayWidth) / 2 + pan.x}px`,
                top: `${(VIEWPORT_SIZE - currentDisplayHeight) / 2 + pan.y}px`
              }}
            />
          </div>
        ) : (
          <div
            onClick={() => fileInputInsideModalRef.current?.click()}
            className="border-2 border-dashed border-white/60 hover:border-white bg-neutral-950 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition"
            style={{ width: `${VIEWPORT_SIZE}px`, height: `${VIEWPORT_SIZE}px` }}
          >
            <div className="w-12 h-12 border border-white flex items-center justify-center mb-3 text-xl font-bold font-mono">
              +
            </div>
            <span className="text-xs uppercase font-extrabold text-white mb-1">
              {statusMessage || 'CLIQUE PARA ESCOLHER DO COMPUTADOR'}
            </span>
            <span className="text-[9px] uppercase text-neutral-400 font-mono">
              [ ARQUIVO .JPG, .PNG OU .WEBP ]
            </span>
          </div>
        )}

        {/* Zoom Controls & Slider (Only shown if image is loaded) */}
        {imageSrc && isImageReady && (
          <div className="w-full mt-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase font-mono">
              <span>ZOOM ({Math.round(zoom * 100)}%)</span>
              <button
                onClick={handleResetPosition}
                className="text-white hover:underline text-[9px] uppercase cursor-pointer"
              >
                [ CENTRALIZAR ]
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleZoomChange(zoom - 0.2)}
                className="px-2 py-0.5 border border-white text-xs font-bold hover:bg-white hover:text-black cursor-pointer"
                title="Diminuir Zoom"
              >
                -
              </button>
              <input
                type="range"
                min="1"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="flex-1 accent-white cursor-pointer"
              />
              <button
                onClick={() => handleZoomChange(zoom + 0.2)}
                className="px-2 py-0.5 border border-white text-xs font-bold hover:bg-white hover:text-black cursor-pointer"
                title="Aumentar Zoom"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Secondary Options */}
        <div className="w-full flex items-center justify-between mt-3 pt-2 border-t border-white/30 text-[9px]">
          <button
            onClick={() => fileInputInsideModalRef.current?.click()}
            className="text-neutral-300 hover:text-white uppercase font-bold hover:underline cursor-pointer"
          >
            [ ESCOLHER OUTRO ARQUIVO DO PC ]
          </button>

          {hasExistingImage && onRemoveImage && (
            <button
              onClick={() => {
                onRemoveImage(charId);
                onClose();
              }}
              className="text-red-400 hover:text-red-300 uppercase font-bold hover:underline ml-auto cursor-pointer"
            >
              [ REMOVER FOTO ]
            </button>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="w-full grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={onClose}
            className="py-2 border border-white text-xs font-bold uppercase hover:bg-white hover:text-black transition cursor-pointer text-center"
          >
            CANCELAR
          </button>
          <button
            onClick={handleConfirmCrop}
            disabled={!imageSrc || !isImageReady}
            className={`py-2 border border-white text-xs font-black uppercase transition text-center ${
              imageSrc && isImageReady
                ? 'bg-white text-black hover:bg-black hover:text-white cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed'
            }`}
          >
            SALVAR ENQUADRAMENTO
          </button>
        </div>

      </div>
    </div>
  );
}

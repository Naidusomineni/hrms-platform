import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Modal, Button, Spinner } from './index'
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, Check, X, Shield, Eye } from 'lucide-react'

export const ProfilePhotoCropperModal = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  uploading = false
}) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [maskType, setMaskType] = useState('circle') // 'circle' or 'square'

  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const previewCanvasRef = useRef(null)

  const VIEWPORT_SIZE = 280
  const OUTPUT_SIZE = 400

  // Reset state when opening a new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      setImageLoaded(false)
    }
  }, [isOpen, imageSrc])

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setImageLoaded(true)
    }
  }, [imageSrc, isOpen])

  // Mouse / Touch Dragging Handlers
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch Support for mobile / touch screens
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    }
  }

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.1 : -0.1
    setZoom(prev => Math.min(Math.max(1, prev + delta), 3.5))
  }

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Reset framing
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // Calculate live preview to canvas
  const drawToCanvas = useCallback((targetCanvas, targetSize) => {
    const img = imageRef.current
    if (!img || (!imageLoaded && !img.complete)) return null
    const canvas = targetCanvas || document.createElement('canvas')
    canvas.width = targetSize
    canvas.height = targetSize
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, targetSize, targetSize)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const natW = img.naturalWidth || 400
    const natH = img.naturalHeight || 400

    // Compute base scale to cover the viewport
    const baseScale = Math.max(VIEWPORT_SIZE / natW, VIEWPORT_SIZE / natH)
    const effectiveScale = baseScale * zoom
    const ratio = targetSize / VIEWPORT_SIZE

    ctx.save()
    // Center of canvas
    ctx.translate(targetSize / 2, targetSize / 2)
    // Apply user rotation
    ctx.rotate((rotation * Math.PI) / 180)
    // Apply user panning (scaled to canvas)
    ctx.translate(position.x * ratio, position.y * ratio)

    // Scaled rendered dimensions
    const drawW = natW * effectiveScale * ratio
    const drawH = natH * effectiveScale * ratio

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()

    return canvas
  }, [zoom, rotation, position, imageLoaded])

  // Update live side previews
  useEffect(() => {
    if (previewCanvasRef.current && imageLoaded) {
      drawToCanvas(previewCanvasRef.current, 120)
    }
  }, [drawToCanvas, imageLoaded])

  // Final export and upload
  const handleApplyCrop = () => {
    const exportCanvas = drawToCanvas(null, OUTPUT_SIZE)
    if (!exportCanvas) return

    exportCanvas.toBlob(blob => {
      if (blob) {
        onCropComplete(blob)
      }
    }, 'image/jpeg', 0.92)
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={uploading ? undefined : onClose}
      title="Adjust & Frame Profile Photo"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 select-none">
        <p className="text-xs text-slate-500 leading-relaxed">
          Drag to reposition your face in the center. Use the slider or mouse wheel to zoom in and frame your photo like on WhatsApp & LinkedIn.
        </p>

        {/* Mask toggle tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMaskType('circle')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                maskType === 'circle'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Circular (WhatsApp DP)
            </button>
            <button
              type="button"
              onClick={() => setMaskType('square')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                maskType === 'square'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Square (Corporate Badge)
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <RefreshCw size={13} />
            Reset
          </button>
        </div>

        {/* Cropper Viewport & Previews */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* Main Interactive Crop Area */}
          <div
            ref={containerRef}
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            className="relative overflow-hidden bg-slate-950 rounded-2xl shadow-inner cursor-grab active:cursor-grabbing shrink-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* The draggable, scalable image */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source Crop"
                onLoad={() => setImageLoaded(true)}
                className="max-w-none object-contain select-none"
                style={{
                  minWidth: VIEWPORT_SIZE,
                  minHeight: VIEWPORT_SIZE
                }}
                draggable={false}
              />
            </div>

            {/* Dark vignette overlay outside the aperture */}
            <div className="absolute inset-0 pointer-events-none">
              {maskType === 'circle' ? (
                <div
                  className="w-full h-full"
                  style={{
                    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                    borderRadius: '50%'
                  }}
                />
              ) : (
                <div
                  className="w-full h-full border-2 border-white/60"
                  style={{
                    boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                    borderRadius: '16px'
                  }}
                />
              )}
            </div>

            {/* Subtle Rule-of-thirds grid guides */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Framing helper tag */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur text-[10px] text-white/90 font-medium pointer-events-none">
              Drag to position
            </div>
          </div>

          {/* Live Side Previews */}
          <div className="flex sm:flex-col items-center justify-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live Previews
            </span>

            {/* Circular Preview (WhatsApp / Topbar) */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500 shadow-sm bg-white">
                <canvas
                  ref={previewCanvasRef}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Circle DP</span>
            </div>

            {/* Square Preview (Corporate Profile Card) */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm bg-white">
                <canvas
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                  ref={el => {
                    if (el && imageLoaded) drawToCanvas(el, 120)
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Card Avatar</span>
            </div>
          </div>
        </div>

        {/* Controls: Zoom & Rotate */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(1, z - 0.2))}
              className="p-1 text-slate-500 hover:text-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="1"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-primary-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(3.5, z + 0.2))}
              className="p-1 text-slate-500 hover:text-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <span className="text-xs font-mono font-semibold text-slate-600 w-10 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
            <span className="text-slate-400">Pinch or scroll to zoom</span>
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition"
            >
              <RotateCw size={13} />
              Rotate 90°
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApplyCrop}
            loading={uploading}
          >
            <Check size={16} />
            Set Profile Photo
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ProfilePhotoCropperModal

import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, FabricImage, IText, Rect, Circle, Group } from 'fabric';
import { toast } from 'sonner';
import type { FabricObject } from 'fabric';
import { FrameTemplate } from '@/types/qr';

export interface CanvasLayer {
  id: string;
  name: string;
  type: 'qr' | 'logo' | 'text' | 'shape' | 'frame' | 'center-logo';
  visible: boolean;
  locked: boolean;
  object: FabricObject;
}

interface UseCanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
}

export function useCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, options: UseCanvasOptions, deps: any[] = []) {
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [layers, setLayers] = useState<CanvasLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const layerIdCounter = useRef(0);
  const qrLayerId = useRef<string | null>(null);
  const centerLogoLayerId = useRef<string | null>(null);
  const frameLayerId = useRef<string | null>(null);
  const layersRef = useRef<CanvasLayer[]>([]);

  // Keep layersRef in sync
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // Initialize canvas
  useEffect(() => {
    console.log('useCanvas init effect running', { refCurrent: !!canvasRef.current });
    if (!canvasRef.current) return;

    console.log('Creating new FabricCanvas');
    const canvas = new FabricCanvas(canvasRef.current, {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor || '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    });

    console.log('FabricCanvas instance created:', canvas);
    setFabricCanvas(canvas);
    setLayers([]);
    qrLayerId.current = null;
    centerLogoLayerId.current = null;
    console.log('FabricCanvas created and set, state reset');

    return () => {
      console.log('Disposing FabricCanvas');
      canvas.dispose();
    };
  }, [canvasRef, options.width, options.height, options.backgroundColor, ...deps]);

  // Update canvas selection handlers
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelectionCreated = (e: any) => {
      const obj = e.selected?.[0];
      if (obj) {
        const layer = layersRef.current.find(l => l.object === obj);
        if (layer) setSelectedLayerId(layer.id);
      }
    };

    const handleSelectionUpdated = (e: any) => {
      const obj = e.selected?.[0];
      if (obj) {
        const layer = layersRef.current.find(l => l.object === obj);
        if (layer) setSelectedLayerId(layer.id);
      }
    };

    const handleSelectionCleared = () => {
      setSelectedLayerId(null);
    };

    fabricCanvas.on('selection:created', handleSelectionCreated);
    fabricCanvas.on('selection:updated', handleSelectionUpdated);
    fabricCanvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      fabricCanvas.off('selection:created', handleSelectionCreated);
      fabricCanvas.off('selection:updated', handleSelectionUpdated);
      fabricCanvas.off('selection:cleared', handleSelectionCleared);
    };
  }, [fabricCanvas]);

  const generateLayerId = useCallback(() => {
    layerIdCounter.current += 1;
    return `layer-${layerIdCounter.current}`;
  }, []);

  // Update existing QR code or add new one
  const updateQRCode = useCallback(async (dataUrl: string) => {
    console.log('updateQRCode called with dataUrl length:', dataUrl.length);
    if (!fabricCanvas) {
      console.error('Canvas not initialized');
      return null;
    }

    try {
      console.log('Creating FabricImage from URL...');
      const fabricImg = await FabricImage.fromURL(dataUrl, {
        crossOrigin: 'anonymous'
      });
      console.log('FabricImage created:', {
        width: fabricImg.width,
        height: fabricImg.height,
        visible: fabricImg.visible,
        opacity: fabricImg.opacity
      });

      const currentLayers = layersRef.current;
      const existingLayerIndex = currentLayers.findIndex(l => l.id === qrLayerId.current);

      if (existingLayerIndex >= 0) {
        console.log('Updating existing QR layer');
        // Update existing QR code
        const existingLayer = currentLayers[existingLayerIndex];
        const existingObj = existingLayer.object as FabricImage;

        // Get current position and scale
        const left = existingObj.left ?? (options.width - 200) / 2;
        const top = existingObj.top ?? (options.height - 200) / 2;
        const existingWidth = existingObj.getScaledWidth();
        const existingHeight = existingObj.getScaledHeight();

        // Remove old object
        fabricCanvas.remove(existingObj);

        // Update new image properties
        fabricImg.set({
          left,
          top,
          scaleX: existingWidth / fabricImg.width!,
          scaleY: existingHeight / fabricImg.height!,
        });

        fabricCanvas.add(fabricImg);
        fabricCanvas.bringObjectToFront(fabricImg);
        fabricCanvas.renderAll();

        // Update layer reference
        const updatedLayer = { ...existingLayer, object: fabricImg };
        setLayers(prev => prev.map(l => l.id === existingLayer.id ? updatedLayer : l));
        return updatedLayer;
      } else {
        console.log('Adding new QR layer');
        // Add new QR code
        const scaleX = 200 / fabricImg.width!;
        const scaleY = 200 / fabricImg.height!;
        const left = (options.width - 200) / 2;
        const top = (options.height - 200) / 2;

        console.log('New QR properties:', { left, top, scaleX, scaleY });

        fabricImg.set({
          left,
          top,
          scaleX,
          scaleY,
        });

        fabricCanvas.add(fabricImg);
        fabricCanvas.bringObjectToFront(fabricImg);
        fabricCanvas.renderAll();
        console.log('QR added to canvas and rendered');

        const layerId = generateLayerId();
        qrLayerId.current = layerId;

        const layer: CanvasLayer = {
          id: layerId,
          name: 'QR Code',
          type: 'qr',
          visible: true,
          locked: false,
          object: fabricImg,
        };

        setLayers(prev => [layer, ...prev]);
        return layer;
      }
    } catch (error) {
      console.error('Error adding QR to canvas:', error);
      toast.error('Failed to render QR code on canvas');
      return null;
    }
  }, [fabricCanvas, options.width, options.height, generateLayerId]);

  // Add center logo (logo placed in center of QR code)
  const addCenterLogo = useCallback(async (file: File) => {
    if (!fabricCanvas) return null;

    return new Promise<CanvasLayer | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
          const fabricImg = await FabricImage.fromURL(dataUrl, {
            crossOrigin: 'anonymous'
          });

          // Remove existing center logo if any
          const currentLayers = layersRef.current;
          const existingCenterLogo = currentLayers.find(l => l.id === centerLogoLayerId.current);
          if (existingCenterLogo) {
            fabricCanvas.remove(existingCenterLogo.object);
            setLayers(prev => prev.filter(l => l.id !== centerLogoLayerId.current));
          }

          // Size relative to canvas (about 20% of QR area)
          const maxSize = 60;
          const scale = Math.min(maxSize / fabricImg.width!, maxSize / fabricImg.height!);

          fabricImg.set({
            left: options.width / 2,
            top: options.height / 2,
            scaleX: scale,
            scaleY: scale,
            originX: 'center',
            originY: 'center',
          });

          fabricCanvas.add(fabricImg);
          fabricCanvas.bringObjectToFront(fabricImg);
          fabricCanvas.setActiveObject(fabricImg);
          fabricCanvas.renderAll();

          const layerId = generateLayerId();
          centerLogoLayerId.current = layerId;

          const layer: CanvasLayer = {
            id: layerId,
            name: 'Center Logo',
            type: 'center-logo',
            visible: true,
            locked: false,
            object: fabricImg,
          };

          setLayers(prev => [...prev, layer]);
          setSelectedLayerId(layer.id);
          resolve(layer);
        } catch (error) {
          console.error('Error adding center logo:', error);
          toast.error('Failed to add center logo');
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }, [fabricCanvas, options.width, options.height, generateLayerId]);

  const updateFrame = useCallback((frame: FrameTemplate, qrSize: number) => {
    if (!fabricCanvas) return;

    // Remove existing frame
    const currentLayers = layersRef.current;
    const existingFrame = currentLayers.find(l => l.id === frameLayerId.current);
    if (existingFrame) {
      fabricCanvas.remove(existingFrame.object);
      setLayers(prev => prev.filter(l => l.id !== frameLayerId.current));
      frameLayerId.current = null;
    }

    if (frame.type === 'none') return;

    const padding = 20;
    const frameSize = qrSize + (padding * 2);
    const left = (options.width - frameSize) / 2;
    const top = (options.height - frameSize) / 2;
    const frameColor = frame.color || '#000000';

    let frameGroup: Group | null = null;
    const objects: FabricObject[] = [];

    // White background for the frame (to create the border effect)
    const bgRect = new Rect({
      width: frameSize,
      height: frameSize,
      fill: '#ffffff',
      rx: frame.type === 'rounded' || frame.type === 'simple' ? 20 : 0,
      ry: frame.type === 'rounded' || frame.type === 'simple' ? 20 : 0,
    });
    objects.push(bgRect);

    if (frame.type === 'simple' || frame.type === 'rounded') {
      const borderRect = new Rect({
        width: frameSize,
        height: frameSize,
        fill: 'transparent',
        stroke: frameColor,
        strokeWidth: 10,
        rx: frame.type === 'rounded' ? 20 : 0,
        ry: frame.type === 'rounded' ? 20 : 0,
      });
      objects.push(borderRect);
    } else if (frame.type === 'label') {
      const borderRect = new Rect({
        width: frameSize,
        height: frameSize,
        fill: 'transparent',
        stroke: frameColor,
        strokeWidth: 10,
        rx: 20,
        ry: 20,
      });
      objects.push(borderRect);

      // Label bubble
      const labelHeight = 40;
      const labelWidth = 120;
      const labelY = frame.labelPosition === 'bottom' ? frameSize - (labelHeight / 2) : -(labelHeight / 2);

      const labelRect = new Rect({
        left: (frameSize - labelWidth) / 2,
        top: labelY,
        width: labelWidth,
        height: labelHeight,
        fill: frameColor,
        rx: 20,
        ry: 20,
      });
      objects.push(labelRect);

      const labelText = new IText(frame.labelText || 'SCAN ME', {
        left: (frameSize / 2),
        top: labelY + (labelHeight / 2),
        fontSize: 16,
        fill: '#ffffff',
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center',
        fontWeight: 'bold',
      });
      objects.push(labelText);
    } else if (frame.type === 'banner') {
      const borderRect = new Rect({
        width: frameSize,
        height: frameSize,
        fill: 'transparent',
        stroke: frameColor,
        strokeWidth: 10,
        rx: 10,
        ry: 10,
      });
      objects.push(borderRect);

      const bannerHeight = 50;
      const bannerRect = new Rect({
        left: -5,
        top: frameSize - 20,
        width: frameSize + 10,
        height: bannerHeight,
        fill: frameColor,
        rx: 10,
        ry: 10,
      });
      objects.push(bannerRect);

      const bannerText = new IText(frame.labelText || 'SCAN TO VISIT', {
        left: frameSize / 2,
        top: frameSize - 20 + (bannerHeight / 2),
        fontSize: 18,
        fill: '#ffffff',
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center',
        fontWeight: 'bold',
      });
      objects.push(bannerText);
    }

    if (objects.length > 0) {
      frameGroup = new Group(objects, {
        left: left,
        top: top,
        selectable: false,
        evented: false,
      });

      fabricCanvas.add(frameGroup);
      fabricCanvas.sendObjectToBack(frameGroup);
      fabricCanvas.renderAll();

      const layerId = generateLayerId();
      frameLayerId.current = layerId;

      const layer: CanvasLayer = {
        id: layerId,
        name: 'Frame',
        type: 'frame',
        visible: true,
        locked: true,
        object: frameGroup,
      };

      setLayers(prev => {
        // Ensure frame is at the bottom
        const others = prev.filter(l => l.id !== layerId);
        return [layer, ...others];
      });
    }
  }, [fabricCanvas, options.width, options.height, generateLayerId]);

  const addLogo = useCallback(async (file: File) => {
    if (!fabricCanvas) return null;

    return new Promise<CanvasLayer | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
          const fabricImg = await FabricImage.fromURL(dataUrl, {
            crossOrigin: 'anonymous'
          });

          const maxSize = 80;
          const scale = Math.min(maxSize / fabricImg.width!, maxSize / fabricImg.height!);

          fabricImg.set({
            left: options.width / 2,
            top: options.height / 2,
            scaleX: scale,
            scaleY: scale,
            originX: 'center',
            originY: 'center',
          });

          fabricCanvas.add(fabricImg);
          fabricCanvas.setActiveObject(fabricImg);
          fabricCanvas.renderAll();

          const layer: CanvasLayer = {
            id: generateLayerId(),
            name: file.name.split('.')[0] || 'Logo',
            type: 'logo',
            visible: true,
            locked: false,
            object: fabricImg,
          };

          setLayers(prev => [...prev, layer]);
          setSelectedLayerId(layer.id);
          resolve(layer);
        } catch (error) {
          console.error('Error adding logo:', error);
          toast.error('Failed to add logo');
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }, [fabricCanvas, options.width, options.height, generateLayerId]);

  const addText = useCallback((text: string, textOptions?: { fontSize?: number; fill?: string; fontFamily?: string }) => {
    if (!fabricCanvas) return null;

    const fabricText = new IText(text, {
      left: 50,
      top: 50,
      fontSize: textOptions?.fontSize || 24,
      fill: textOptions?.fill || '#1a365d',
      fontFamily: textOptions?.fontFamily || 'Arial',
    });

    fabricCanvas.add(fabricText);
    fabricCanvas.setActiveObject(fabricText);
    fabricCanvas.renderAll();

    const layerId = generateLayerId();

    // Update layer name when text changes
    fabricText.on('changed', () => {
      setLayers(prev => prev.map(l => {
        if (l.id === layerId) {
          return { ...l, name: fabricText.text?.substring(0, 20) || 'Text' };
        }
        return l;
      }));
    });

    const layer: CanvasLayer = {
      id: layerId,
      name: text.substring(0, 20) || 'Text',
      type: 'text',
      visible: true,
      locked: false,
      object: fabricText,
    };

    setLayers(prev => [...prev, layer]);
    setSelectedLayerId(layer.id);
    return layer;
  }, [fabricCanvas, generateLayerId]);

  const addShape = useCallback((type: 'rect' | 'circle', shapeOptions?: { fill?: string; width?: number; height?: number }) => {
    if (!fabricCanvas) return null;

    let shape: FabricObject;

    if (type === 'rect') {
      shape = new Rect({
        left: 50,
        top: 50,
        width: shapeOptions?.width || 100,
        height: shapeOptions?.height || 100,
        fill: shapeOptions?.fill || '#2dd4bf',
        rx: 8,
        ry: 8,
      });
    } else {
      shape = new Circle({
        left: 50,
        top: 50,
        radius: (shapeOptions?.width || 50) / 2,
        fill: shapeOptions?.fill || '#2dd4bf',
      });
    }

    fabricCanvas.add(shape);
    fabricCanvas.setActiveObject(shape);
    fabricCanvas.renderAll();

    const layer: CanvasLayer = {
      id: generateLayerId(),
      name: type === 'rect' ? 'Rectangle' : 'Circle',
      type: 'shape',
      visible: true,
      locked: false,
      object: shape,
    };

    setLayers(prev => [...prev, layer]);
    setSelectedLayerId(layer.id);
    return layer;
  }, [fabricCanvas, generateLayerId]);

  const selectLayer = useCallback((layerId: string) => {
    if (!fabricCanvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (layer && layer.visible && !layer.locked) {
      fabricCanvas.setActiveObject(layer.object);
      fabricCanvas.renderAll();
      setSelectedLayerId(layerId);
    }
  }, [fabricCanvas, layers]);

  const deleteLayer = useCallback((layerId: string) => {
    if (!fabricCanvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      fabricCanvas.remove(layer.object);
      fabricCanvas.renderAll();
      setLayers(prev => prev.filter(l => l.id !== layerId));
      if (selectedLayerId === layerId) {
        setSelectedLayerId(null);
      }
      if (qrLayerId.current === layerId) {
        qrLayerId.current = null;
      }
    }
  }, [fabricCanvas, layers, selectedLayerId]);

  const toggleLayerVisibility = useCallback((layerId: string) => {
    if (!fabricCanvas) return;

    setLayers(prev => {
      const newLayers = prev.map(l => {
        if (l.id === layerId) {
          const newVisible = !l.visible;
          l.object.set('visible', newVisible);
          return { ...l, visible: newVisible };
        }
        return l;
      });
      fabricCanvas.renderAll();
      return newLayers;
    });
  }, [fabricCanvas]);

  const toggleLayerLock = useCallback((layerId: string) => {
    if (!fabricCanvas) return;

    setLayers(prev => {
      const newLayers = prev.map(l => {
        if (l.id === layerId) {
          const newLocked = !l.locked;
          l.object.set({
            selectable: !newLocked,
            evented: !newLocked,
          });
          if (newLocked && selectedLayerId === layerId) {
            fabricCanvas.discardActiveObject();
            setSelectedLayerId(null);
          }
          return { ...l, locked: newLocked };
        }
        return l;
      });
      fabricCanvas.renderAll();
      return newLayers;
    });
  }, [fabricCanvas, selectedLayerId]);

  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    if (!fabricCanvas) return;

    const layerIndex = layers.findIndex(l => l.id === layerId);
    if (layerIndex === -1) return;

    const newIndex = direction === 'up' ? layerIndex + 1 : layerIndex - 1;
    if (newIndex < 0 || newIndex >= layers.length) return;

    const layer = layers[layerIndex];

    if (direction === 'up') {
      fabricCanvas.bringObjectForward(layer.object);
    } else {
      fabricCanvas.sendObjectBackwards(layer.object);
    }
    fabricCanvas.renderAll();

    const newLayers = [...layers];
    [newLayers[layerIndex], newLayers[newIndex]] = [newLayers[newIndex], newLayers[layerIndex]];
    setLayers(newLayers);
  }, [fabricCanvas, layers]);

  const bringToFront = useCallback((layerId: string) => {
    if (!fabricCanvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      fabricCanvas.bringObjectToFront(layer.object);
      fabricCanvas.renderAll();

      const otherLayers = layers.filter(l => l.id !== layerId);
      setLayers([...otherLayers, layer]);
    }
  }, [fabricCanvas, layers]);

  const sendToBack = useCallback((layerId: string) => {
    if (!fabricCanvas) return;

    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      fabricCanvas.sendObjectToBack(layer.object);
      fabricCanvas.renderAll();

      const otherLayers = layers.filter(l => l.id !== layerId);
      setLayers([layer, ...otherLayers]);
    }
  }, [fabricCanvas, layers]);

  const exportCanvas = useCallback((format: 'png' | 'jpeg' | 'svg', quality = 1): string => {
    if (!fabricCanvas) {
      console.warn('exportCanvas: fabricCanvas is null');
      return '';
    }

    if (format === 'svg') {
      return fabricCanvas.toSVG();
    }

    // Ensure render before export
    fabricCanvas.renderAll();

    // Ensure background color is exported
    const dataUrl = fabricCanvas.toDataURL({
      format: format,
      quality: quality,
      multiplier: 1,
      left: 0,
      top: 0,
      width: options.width,
      height: options.height,
    });

    console.log('exportCanvas generated dataUrl length:', dataUrl.length);
    return dataUrl;
  }, [fabricCanvas, options.width, options.height]);

  const clearCanvas = useCallback(() => {
    if (!fabricCanvas) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = options.backgroundColor || '#ffffff';
    fabricCanvas.renderAll();
    setLayers([]);
    setSelectedLayerId(null);
    qrLayerId.current = null;
    centerLogoLayerId.current = null;
  }, [fabricCanvas, options.backgroundColor]);

  const getCanvasJSON = useCallback(() => {
    if (!fabricCanvas) return null;
    return fabricCanvas.toJSON();
  }, [fabricCanvas]);

  const loadCanvasJSON = useCallback(async (json: object) => {
    if (!fabricCanvas) return false;

    try {
      await fabricCanvas.loadFromJSON(json);
      fabricCanvas.renderAll();

      // Rebuild layers from objects
      const objects = fabricCanvas.getObjects();
      const newLayers: CanvasLayer[] = objects.map((obj, index) => ({
        id: generateLayerId(),
        name: `Layer ${index + 1}`,
        type: 'shape' as const,
        visible: obj.visible ?? true,
        locked: !obj.selectable,
        object: obj,
      }));

      setLayers(newLayers);
      return true;
    } catch (error) {
      console.error('Failed to load canvas JSON:', error);
      return false;
    }
  }, [fabricCanvas, generateLayerId]);

  return {
    canvas: fabricCanvas,
    layers,
    selectedLayerId,
    updateQRCode,
    updateFrame,
    addLogo,
    addCenterLogo,
    addText,
    addShape,
    selectLayer,
    deleteLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    moveLayer,
    bringToFront,
    sendToBack,
    exportCanvas,
    clearCanvas,
    getCanvasJSON,
    loadCanvasJSON,
  };
}

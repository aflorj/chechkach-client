import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { DrawingBoardContext } from '../../providers/DrawingBoardProvider';
import CanvasOverlay from '../CanvasOverlay/CanvasOverlay';
import { LobbyContext } from '../../providers/LobbyProvider';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface IMagicCanvasProps {
  lobbyName: string;
}

export default function MagicCanvas({ lobbyName }: IMagicCanvasProps) {
  const {
    brushSize,
    handleMouseDown: handleMouseDownCtx,
    handleMouseUp: handleMouseUpCtx,
    handleMouseMove: handleMouseMoveCtx,
    setCtx,
    setLobbyName,
    activeTool,
    setIsDrawing,
  } = useContext(DrawingBoardContext);

  const { wordOptions, roundScoreboard, allowedToDraw } =
    useContext(LobbyContext);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { t } = useTranslation();

  const VIRTUAL_WIDTH = 700;
  const VIRTUAL_HEIGHT = 500;

  // Brush size labels mapping
  const getBrushSizeLabel = (size: number) => {
    switch (size) {
      case 1:
        return t('palette.brush_sizes.thin', 'Thin');
      case 4:
        return t('palette.brush_sizes.medium', 'Medium');
      case 8:
        return t('palette.brush_sizes.thick', 'Thick');
      case 16:
        return t('palette.brush_sizes.extra_thick', 'Extra thick');
      default:
        return t('palette.brush_sizes.medium', 'Medium');
    }
  };

  function getVirtualCoords(
    clientX: number,
    clientY: number
  ): { x: number; y: number } {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  }

  const handleMouseDown = (
    ev: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!handleMouseDownCtx || !activeTool) return;
    const { x, y } = getVirtualCoords(ev.clientX, ev.clientY);
    const fakeEvent = {
      ...ev,
      clientX: x,
      clientY: y,
      buttons: 1,
      type: 'mousedown',
    } as any;
    handleMouseDownCtx(fakeEvent);
  };
  const handleMouseMove = (
    ev: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!handleMouseMoveCtx) return;
    if (ev.buttons !== 1) return;
    const { x, y } = getVirtualCoords(ev.clientX, ev.clientY);
    const fakeEvent = {
      ...ev,
      clientX: x,
      clientY: y,
      buttons: 1,
      type: 'mousemove',
    } as any;
    handleMouseMoveCtx(fakeEvent);
  };
  const handleMouseUp = (
    ev: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!handleMouseUpCtx) return;
    const { x, y } = getVirtualCoords(ev.clientX, ev.clientY);
    const fakeEvent = {
      ...ev,
      clientX: x,
      clientY: y,
      buttons: 0,
      type: 'mouseup',
    } as any;
    handleMouseUpCtx(fakeEvent);
  };

  const handleTouchStart = (ev: React.TouchEvent<HTMLCanvasElement>) => {
    if (!handleMouseDownCtx || !activeTool) return;
    if (setIsDrawing) setIsDrawing(true);
    const touch = ev.touches[0];
    const { x, y } = getVirtualCoords(touch.clientX, touch.clientY);
    const fakeEvent = {
      clientX: x,
      clientY: y,
      preventDefault: () => {},
      buttons: 1,
      type: 'mousedown',
    } as any;
    handleMouseDownCtx(fakeEvent);
  };
  const handleTouchMove = (ev: React.TouchEvent<HTMLCanvasElement>) => {
    if (!handleMouseMoveCtx) return;
    const touch = ev.touches[0];
    const { x, y } = getVirtualCoords(touch.clientX, touch.clientY);
    const fakeEvent = {
      clientX: x,
      clientY: y,
      preventDefault: () => {},
      buttons: 1,
      type: 'mousemove',
    } as any;
    handleMouseMoveCtx(fakeEvent);
  };
  const handleTouchEnd = (ev: React.TouchEvent<HTMLCanvasElement>) => {
    if (!handleMouseUpCtx) return;
    if (setIsDrawing) setIsDrawing(false);
    const touch = ev.changedTouches[0] || ev.touches[0];
    if (!touch) return;
    const { x, y } = getVirtualCoords(touch.clientX, touch.clientY);
    const fakeEvent = {
      clientX: x,
      clientY: y,
      preventDefault: () => {},
      buttons: 0,
      type: 'mouseup',
    } as any;
    handleMouseUpCtx(fakeEvent);
  };

  useEffect(() => {
    setLobbyName!(lobbyName);
  }, [lobbyName]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = VIRTUAL_WIDTH * dpr;
    canvas.height = VIRTUAL_HEIGHT * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.lineWidth = brushSize!;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setCtx!(ctx);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <div
        id="canvas-wrapper"
        className={clsx(
          'relative',
          wordOptions || roundScoreboard ? 'mb-4' : ''
        )}
        style={{ width: '100%', maxWidth: 900, aspectRatio: '7 / 5' }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
          <canvas
            className="bg-white rounded-xl shadow-inner border border-gray-200 cursor-crosshair transition-all duration-300 hover:shadow-lg"
            ref={canvasRef}
            width={VIRTUAL_WIDTH}
            height={VIRTUAL_HEIGHT}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              background:
                'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {allowedToDraw && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <span>{t('magic_canvas.drawing_area', 'Drawing area')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full" />
                <span>
                  {t('palette.brush', 'Brush')}:{' '}
                  {getBrushSizeLabel(brushSize || 4)}
                </span>
              </div>
            </div>
          )}
        </div>

        {(wordOptions || roundScoreboard) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <CanvasOverlay lobbyName={lobbyName} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
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
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    setCtx,
    setLobbyName,
  } = useContext(DrawingBoardContext);

  const { wordOptions, roundScoreboard, allowedToDraw } =
    useContext(LobbyContext);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { t } = useTranslation();

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

  useLayoutEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.height = 500;
    canvas.width = 700;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.lineWidth = brushSize!;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setCtx!(ctx);
  }, []);

  useEffect(() => {
    setLobbyName!(lobbyName);
  }, [lobbyName]);

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
      >
        {/* Canvas Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
          <canvas
            className="bg-white rounded-xl shadow-inner border border-gray-200 cursor-crosshair transition-all duration-300 hover:shadow-lg"
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              background:
                'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          />

          {/* Canvas Info - Only show for users who can draw */}
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
                <span>Risalna površina</span>
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

        {/* Overlay for word options or scoreboard */}
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

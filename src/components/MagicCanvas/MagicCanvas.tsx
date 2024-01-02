import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { DrawingBoardContext } from '../../providers/DrawingBoardProvider';
import CanvasOverlay from '../CanvasOverlay/CanvasOverlay';
import { LobbyContext } from '../../providers/LobbyProvider';

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

  const { wordOptions, roundScoreboard } = useContext(LobbyContext);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    <div
      id="canvas-wrapper"
      className={wordOptions || roundScoreboard ? 'relative' : ''}
    >
      <canvas
        // style={{ background: 'url(/paper2.jpeg)' }}
        className="bg-white shadow-inner"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      ></canvas>
      {(wordOptions || roundScoreboard) && (
        <CanvasOverlay lobbyName={lobbyName} />
      )}
    </div>
  );
}

import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { DrawingBoardContext } from '../../providers/DrawingBoardProvider';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.height = 500;
    canvas.width = 500;
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
    <div>
      <canvas
        // style={{ background: 'url(/paper2.jpeg)' }}
        className="border border-black"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      ></canvas>
    </div>
  );
}

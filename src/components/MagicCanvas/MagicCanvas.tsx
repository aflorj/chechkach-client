import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { DrawingBoardContext } from '../../providers/DrawingBoardProvider';

interface IMagicCanvasProps {
  lobbyName: string;
}

export default function MagicCanvas({ lobbyName }: IMagicCanvasProps) {
  const context = useContext(DrawingBoardContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.height = 500;
    canvas.width = 500;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.lineWidth = context.brushSize!;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    context.setCtx!(ctx);
  }, []);

  useEffect(() => {
    context!.setLobbyName!(lobbyName);
  }, [lobbyName]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={context.handleMouseDown}
        onMouseUp={context.handleMouseUp}
        onMouseMove={context.handleMouseMove}
      ></canvas>
    </div>
  );
}

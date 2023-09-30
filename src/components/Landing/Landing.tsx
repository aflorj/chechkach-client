import {
  useContext,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
} from 'react';
import { Link } from 'react-router-dom';

interface ILandingProps {
  stateUsername: string | undefined;
  setStateUsername: (username: string) => void;
}
export default function Landing() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [color, setColor] = useState('red');
  const [brushSize, setBrushSize] = useState(10);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = (ev: any, isEnding = false) => {
    if (!ctx || !isDrawing || false) {
      return;
    }
    const newLine = {
      x: ev.clientX - ctx.canvas.offsetLeft,
      y: ev.clientY - ctx.canvas.offsetTop,
      color,
      brushSize,
      isEnding,
    };
    drawLine(newLine);
    // socket.emit('lineDraw', newLine);
  };

  const drawLine = (line: any) => {
    if (!ctx) {
      return;
    }
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.brushSize;
    ctx.lineTo(line.x, line.y);
    ctx.stroke();
    if (line.isEnding) {
      ctx.beginPath();
    }
  };

  const handleMouseMove = (ev: any): void => {
    draw(ev);
  };
  const handleMouseDown = (ev: any): void => {
    setIsDrawing(true);
    draw(ev);
  };
  const handleMouseUp = (ev: any): void => {
    draw(ev, true);
    setIsDrawing(false);
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.height = 400;
    canvas.width = 400;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setCtx(ctx);
  });

  return (
    <div className="h-screen">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      ></canvas>
    </div>
  );
}

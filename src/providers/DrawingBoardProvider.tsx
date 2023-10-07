import { createContext, useContext, useEffect, useState } from 'react';
import { waitFor } from '../utils';
import { socket } from '../socket';
import { LobbyContext } from './LobbyProvider';

type BoardEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>;
type PickerEvent = React.ChangeEvent<HTMLInputElement>;

export interface Line {
  x: number;
  y: number;
  color: string;
  brushSize: number;
  isEnding: boolean;
}

export interface DrawingBoardContextProps {
  isDrawing: boolean;
  setIsDrawing: (newVal: boolean) => void;
  handleMouseMove: (ev: BoardEvent) => void;
  handleMouseUp: (ev: BoardEvent) => void;
  handleMouseDown: (ev: BoardEvent) => void;
  ctx: CanvasRenderingContext2D;
  setCtx: (ctx: CanvasRenderingContext2D) => void;
  color: string;
  handleColorChange: (newHexColor: string) => void;
  brushSize: number;
  handleBrushSizeChange: (newSize: number) => void;
  setLobbyName: (lobbyName: string) => void;
}

export const DrawingBoardContext = createContext<
  Partial<DrawingBoardContextProps>
>({});

interface DBPProps {
  children: React.ReactNode;
}

const DrawingBoardProvider = (props: DBPProps) => {
  const context = useContext(LobbyContext);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(10);
  const [lobbyName, setLobbyName] = useState<string>();

  useEffect(() => {
    if (ctx) {
      socket.on('newLine', ({ newLine }) => {
        console.log('new line to draw: ', newLine);
        drawLine(newLine);
      });

      socket.on('drawingState', async (lines: Line[]) => {
        for (const line of lines) {
          drawLine(line);
          await waitFor(5);
        }
      });

      socket.on('roundStart', () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      });
    }
  }, [ctx]);

  const drawLine = (line: Line) => {
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

  const draw = (ev: BoardEvent, isEnding = false) => {
    if (!ctx || !isDrawing || !context.allowedToDraw) {
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
    socket.emit('draw', {
      newLine: newLine,
      lobbyName: lobbyName,
    });
  };

  const handleMouseMove = (ev: BoardEvent): void => {
    draw(ev);
  };
  const handleMouseDown = (ev: BoardEvent): void => {
    setIsDrawing(true);
    draw(ev);
  };
  const handleMouseUp = (ev: BoardEvent): void => {
    draw(ev, true);
    setIsDrawing(false);
  };
  const handleColorChange = (newHexColor: string): void => {
    setColor(newHexColor);
  };
  const handleBrushSizeChange = (newSize: number): void => {
    setBrushSize(newSize);
  };

  return (
    <DrawingBoardContext.Provider
      value={{
        isDrawing,
        setIsDrawing,
        setCtx,
        ctx,
        handleMouseMove,
        handleMouseDown,
        handleMouseUp,
        color,
        brushSize,
        handleBrushSizeChange,
        handleColorChange,
        setLobbyName,
      }}
    >
      {props.children}
    </DrawingBoardContext.Provider>
  );
};

export default DrawingBoardProvider;

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
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
  undo: () => void;
  canUndo: boolean;
  activeTool: string;
  setActiveTool: Dispatch<SetStateAction<string>>;
}

export const DrawingBoardContext = createContext<
  Partial<DrawingBoardContextProps>
>({});

interface DBPProps {
  children: React.ReactNode;
}

const DrawingBoardProvider = (props: DBPProps) => {
  let currentLine: Line[] = [];
  const { allowedToDraw, lobbyStatus } = useContext(LobbyContext);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(10);
  const [lobbyName, setLobbyName] = useState<string>();
  const [canUndo, setCanUndo] = useState(false);
  const [activeTool, setActiveTool] = useState('bucket');

  useEffect(() => {
    if (ctx) {
      socket.on('newLine', ({ newLine }) => {
        drawLine(newLine);
      });

      socket.on('fill', ({ fillInfo }) => {
        handleIncomingFill(fillInfo);
      });

      // TODO use this on reconnect or connect in the middle of the game
      socket.on('drawingState', async (lines: Line[]) => {
        for (const line of lines) {
          drawLine(line);
          await waitFor(5);
        }
      });

      socket.on('lobbyStatusChange', ({ newStatus }) => {
        if (newStatus === 'playing') {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
      });

      socket.on('canvasAfterUndo', ({ newCanvas, isCanvasEmpty }) => {
        if (isCanvasEmpty) {
          setCanUndo(false);
        }
        // 'redo' triggered by the drawer, clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // and redraw without the last line
        newCanvas?.forEach((canvasElement: any) => {
          // TODO type 'any' for line and fill obj

          if (canvasElement?.type === 'line') {
            // line
            canvasElement?.content?.forEach((line: Line) => {
              drawLine(line);
            });
          } else if (canvasElement?.type === 'fill') {
            // fill
            fill(null, canvasElement.content);
          }
        });
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

  const handleIncomingFill = (fillInfo: any) => {
    fill(null, fillInfo);
  };

  const draw = (ev: BoardEvent, isEnding = false) => {
    if (!ctx || !isDrawing || !allowedToDraw || lobbyStatus !== 'playing') {
      return;
    }

    const newLine = {
      x: ev.clientX - ctx.canvas.offsetLeft,
      y: ev.clientY - ctx.canvas.offsetTop,
      color,
      brushSize,
      isEnding,
    };
    savePoint(newLine, isEnding);
    drawLine(newLine);
    socket.emit('draw', {
      newLine: newLine,
      lobbyName: lobbyName,
    });
  };

  const hexToRgb = (hex: string) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const fill = (ev: BoardEvent | null, fillInfo: any | null) => {
    if (ctx) {
      let startX = ev ? ev.clientX - ctx.canvas.offsetLeft : fillInfo.startX;
      let startY = ev ? ev.clientY - ctx.canvas.offsetTop : fillInfo.startY;
      let colorLayer = ctx.getImageData(0, 0, 700, 500);

      // starting position
      let startPos = (startY * 700 + startX) * 4;

      // color of the clicked pixel
      let startR = colorLayer.data[startPos];
      let startG = colorLayer.data[startPos + 1];
      let startB = colorLayer.data[startPos + 2];

      // active color hex -> rgb
      let activeColorRGB = ev ? hexToRgb(color) : fillInfo.color;

      // exit immediately if the color of the clicked pixel matches our active color
      if (
        startR === activeColorRGB!.r &&
        startG === activeColorRGB!.g &&
        startB === activeColorRGB!.b
      ) {
        return;
      }

      // emit the fill event if this fill was triggered by us - the drawer
      if (ev) {
        socket.emit('fill', {
          fillInfo: {
            color: hexToRgb(color),
            startX: startX,
            startY: startY,
          },
          lobbyName: lobbyName,
        });
      }

      let pixelStack = [[startX, startY]];

      while (pixelStack.length) {
        const canvasWidth = 700;
        const canvasHeight = 500;
        var newPos, x, y, pixelPos, reachLeft, reachRight;
        newPos = pixelStack.pop();
        x = newPos![0];
        y = newPos![1];

        pixelPos = (y * canvasWidth + x) * 4;
        while (y-- >= 0 && matchStartColor(pixelPos)) {
          pixelPos -= canvasWidth * 4;
        }
        pixelPos += canvasWidth * 4;
        ++y;
        reachLeft = false;
        reachRight = false;
        while (y++ < canvasHeight - 1 && matchStartColor(pixelPos)) {
          // color the pixel
          colorPixel(pixelPos);

          if (x > 0) {
            if (matchStartColor(pixelPos - 4)) {
              if (!reachLeft) {
                pixelStack.push([x - 1, y]);
                reachLeft = true;
              }
            } else if (reachLeft) {
              reachLeft = false;
            }
          }

          if (x < canvasWidth - 1) {
            if (matchStartColor(pixelPos + 4)) {
              if (!reachRight) {
                pixelStack.push([x + 1, y]);
                reachRight = true;
              }
            } else if (reachRight) {
              reachRight = false;
            }
          }

          pixelPos += canvasWidth * 4;
        }
      }

      // aplly the coloring to the canvas
      ctx.putImageData(colorLayer, 0, 0);

      function matchStartColor(pixelPos: any) {
        var r = colorLayer.data[pixelPos];
        var g = colorLayer.data[pixelPos + 1];
        var b = colorLayer.data[pixelPos + 2];

        return r == startR && g == startG && b == startB;
      }

      function colorPixel(pixelPos: any) {
        colorLayer.data[pixelPos] = activeColorRGB!.r;
        colorLayer.data[pixelPos + 1] = activeColorRGB!.g;
        colorLayer.data[pixelPos + 2] = activeColorRGB!.b;
        colorLayer.data[pixelPos + 3] = 255;
      }
    }
  };

  const undo = () => {
    if (allowedToDraw && lobbyStatus === 'playing') {
      socket.emit('undo', {
        lobbyName: lobbyName,
      });
    }
  };

  const savePoint = (line: Line, isEnding: boolean) => {
    if (allowedToDraw && !canUndo) {
      setCanUndo(true);
    }

    if (isEnding) {
      currentLine?.push(line);
      // the line has ended - emit "fullLine"
      socket.emit('fullLine', {
        fullLine: currentLine,
        lobbyName: lobbyName,
      });
    } else {
      currentLine?.push(line);
    }
  };

  const handleMouseMove = (ev: BoardEvent): void => {
    draw(ev);
  };
  const handleMouseDown = (ev: BoardEvent): void => {
    if (activeTool === 'bucket') {
      fill(ev, null);
    } else {
      setIsDrawing(true);
      draw(ev);
    }
  };
  const handleMouseUp = (ev: BoardEvent): void => {
    if (activeTool === 'bucket') {
      // TODO nasty
      //
    } else {
      draw(ev, true);
      setIsDrawing(false);
    }
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
        undo,
        canUndo,
        activeTool,
        setActiveTool,
      }}
    >
      {props.children}
    </DrawingBoardContext.Provider>
  );
};

export default DrawingBoardProvider;

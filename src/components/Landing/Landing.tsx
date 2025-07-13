import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LobbyContext } from '../../providers/LobbyProvider';
import { Line } from '../../providers/DrawingBoardProvider';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type BoardEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>;

type Inputs = {
  userName: string;
};

export default function Landing() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const defaultBrushSize = 4;
  const [brushSize, setBrushSize] = useState(defaultBrushSize);
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [activeTool, setActiveTool] = useState<'brush' | 'bucket'>('brush');
  const [history, setHistory] = useState<string[]>([]);

  const navigate = useNavigate();

  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);

  const { stateUsername, setStateUsername } = useContext(LobbyContext);
  const { t } = useTranslation();

  const colorOptions = [
    { name: 'black', hex: '#000000' },
    { name: 'white', hex: '#FFFFFF' },
    { name: 'red', hex: '#FF0000' },
    { name: 'dark red', hex: '#8B0000' },
    { name: 'orange', hex: '#FFA500' },
    { name: 'yellow', hex: '#FFFF00' },
    { name: 'lime', hex: '#32CD32' },
    { name: 'green', hex: '#008000' },
    { name: 'dark green', hex: '#006400' },
    { name: 'cyan', hex: '#00FFFF' },
    { name: 'blue', hex: '#0000FF' },
    { name: 'dark blue', hex: '#00008B' },
    { name: 'purple', hex: '#800080' },
    { name: 'magenta', hex: '#FF00FF' },
    { name: 'pink', hex: '#FFC0CB' },
    { name: 'brown', hex: '#8B4513' },
    { name: 'gray', hex: '#808080' },
    { name: 'light gray', hex: '#D3D3D3' },
  ];
  const sizeOptions = [
    { size: 1, label: 'Tanek' },
    { size: 4, label: 'Srednji' },
    { size: 8, label: 'Debel' },
    { size: 16, label: 'Zelo debel' },
  ];

  const saveToHistory = () => {
    const canvas = avatarCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev, dataUrl]);
    setCanUndo(true);
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = avatarCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    if (newHistory.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCanUndo(false);
      return;
    }
    const prevDataUrl = newHistory[newHistory.length - 1];
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = prevDataUrl;
    setCanUndo(newHistory.length > 0);
  };

  useLayoutEffect(() => {
    const canvas = avatarCanvasRef.current as HTMLCanvasElement;
    canvas.height = 240;
    canvas.width = 240;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.lineWidth = brushSize!;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, []);

  // Helper: Convert hex color to {r, g, b}
  function hexToRgb(hex: string) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((x) => x + x)
        .join('');
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  const handleMouseDown = (ev: BoardEvent): void => {
    setIsDrawing(true);
    const canvas = avatarCanvasRef.current;
    const ctx = ctxRef.current;
    if (activeTool === 'bucket') {
      saveToHistory();
      if (!ctx || !canvas) return;
      // --- Bucket fill logic ---
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const startX = Math.floor((ev.clientX - rect.left) * scaleX);
      const startY = Math.floor((ev.clientY - rect.top) * scaleY);
      if (
        startX < 0 ||
        startX >= ctx.canvas.width ||
        startY < 0 ||
        startY >= ctx.canvas.height
      ) {
        return;
      }
      let colorLayer = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
      let startPos = (startY * ctx.canvas.width + startX) * 4;
      let startR = colorLayer.data[startPos];
      let startG = colorLayer.data[startPos + 1];
      let startB = colorLayer.data[startPos + 2];
      let activeColorRGB = hexToRgb(color);
      // Exit if the color matches
      if (
        startR === activeColorRGB.r &&
        startG === activeColorRGB.g &&
        startB === activeColorRGB.b
      ) {
        return;
      }
      let pixelStack = [[startX, startY]];
      while (pixelStack.length) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        var newPos, x, y, pixelPos, reachLeft, reachRight;
        newPos = pixelStack.pop();
        if (!newPos) continue;
        x = newPos[0];
        y = newPos[1];
        if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) {
          continue;
        }
        pixelPos = (y * canvasWidth + x) * 4;
        while (y-- >= 0 && matchStartColor(pixelPos)) {
          pixelPos -= canvasWidth * 4;
        }
        pixelPos += canvasWidth * 4;
        ++y;
        reachLeft = false;
        reachRight = false;
        while (y++ < canvasHeight - 1 && matchStartColor(pixelPos)) {
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
      ctx.putImageData(colorLayer, 0, 0);
      function matchStartColor(pixelPos: number) {
        if (pixelPos < 0 || pixelPos >= colorLayer.data.length - 3) {
          return false;
        }
        var r = colorLayer.data[pixelPos];
        var g = colorLayer.data[pixelPos + 1];
        var b = colorLayer.data[pixelPos + 2];
        return r === startR && g === startG && b === startB;
      }
      function colorPixel(pixelPos: number) {
        if (pixelPos < 0 || pixelPos >= colorLayer.data.length - 3) {
          return;
        }
        colorLayer.data[pixelPos] = activeColorRGB.r;
        colorLayer.data[pixelPos + 1] = activeColorRGB.g;
        colorLayer.data[pixelPos + 2] = activeColorRGB.b;
        colorLayer.data[pixelPos + 3] = 255;
      }
      // --- End bucket fill logic ---
    } else if (ctx && canvas) {
      saveToHistory();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (ev.clientX - rect.left) * scaleX;
      const y = (ev.clientY - rect.top) * scaleY;
      ctx.beginPath();
      ctx.moveTo(x, y);
      draw({ x, y, color, brushSize, isEnding: false });
    }
  };

  const handleMouseMove = (ev: BoardEvent): void => {
    if (!isDrawing) return;
    const canvas = avatarCanvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (ev.clientX - rect.left) * scaleX;
    const y = (ev.clientY - rect.top) * scaleY;
    draw({ x, y, color, brushSize, isEnding: false });
  };

  const handleMouseUp = (ev: BoardEvent): void => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = avatarCanvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (ev.clientX - rect.left) * scaleX;
    const y = (ev.clientY - rect.top) * scaleY;
    draw({ x, y, color, brushSize, isEnding: true });
  };

  const handleColorChange = (newHexColor: string): void => {
    setColor(newHexColor);
  };
  const handleBrushSizeChange = (newSize: number): void => {
    setBrushSize(newSize);
  };

  const draw = (line: Line) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.brushSize;
    ctx.lineTo(line.x, line.y);
    ctx.stroke();
    if (line.isEnding) {
      ctx.beginPath();
    }
  };

  const onSubmit = (data: any) => {
    localStorage.setItem('userName', data?.userName);
    setStateUsername!(data?.userName);
    navigate('/lobbies');
  };

  const onError = (err: any) => {
    console.error(err);
  };
  return (
    <div className="container h-screen pt-8 px-4 lg:px-0 mx-auto">
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 px-8 py-8 flex flex-col gap-8 items-center">
          {/* Avatar Drawing Section */}
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative w-full flex flex-col items-center">
              {/* Undo Button - Compact, Top Right */}
              <button
                onClick={() => undo()}
                disabled={!canUndo}
                className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 z-10"
                title={t('landing.undo', 'Undo')}
              >
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
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {t('landing.draw_avatar', 'Draw your avatar')}
              </div>
              <canvas
                className="border border-gray-300 rounded-xl shadow-inner bg-white w-60 h-60 cursor-crosshair"
                ref={avatarCanvasRef}
                width={240}
                height={240}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ touchAction: 'none' }}
              ></canvas>
            </div>
            {/* Tool Selector */}
            <div className="w-full mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1.5">
                {t('landing.tools', 'Tools')}
              </h4>
              <div className="flex gap-1 mb-2">
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    activeTool === 'brush'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'bg-white/50 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setActiveTool('brush')}
                  aria-label="Čopič"
                >
                  <span className="text-sm">🖌️</span>
                  <span className="hidden sm:inline">
                    {t('landing.brush', 'Brush')}
                  </span>
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    activeTool === 'bucket'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'bg-white/50 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setActiveTool('bucket')}
                  aria-label="Barva"
                >
                  <span className="text-sm">🪣</span>
                  <span className="hidden sm:inline">
                    {t('landing.bucket', 'Fill')}
                  </span>
                </button>
              </div>
            </div>
            {/* Color Palette - Responsive Grid */}
            <div className="w-full">
              <h4 className="text-sm font-medium text-gray-700 mb-1.5">
                {t('landing.colors', 'Colors')}
              </h4>
              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-18 gap-1">
                {colorOptions.map((colorOption, idx) => (
                  <button
                    key={colorOption.hex}
                    style={{ backgroundColor: colorOption.hex }}
                    className={`w-7 h-7 rounded-md shadow-sm border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs relative ${
                      color === colorOption.hex
                        ? 'border-blue-500 scale-110 shadow-md'
                        : 'border-white hover:border-gray-300'
                    }`}
                    onClick={() => handleColorChange!(colorOption.hex)}
                    aria-label={colorOption.name}
                  >
                    {color === colorOption.hex && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-3 h-3 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        </span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {/* Brush Sizes - Compact Row */}
            <div className="w-full mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1.5">
                {t('landing.brush', 'Brush')}
              </h4>
              <div className="flex gap-1">
                {sizeOptions.map((sizeOption) => (
                  <button
                    key={sizeOption.size}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1 bg-white/50 border-2 hover:shadow-md ${
                      brushSize === sizeOption.size
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => handleBrushSizeChange!(sizeOption.size)}
                    aria-label={sizeOption.label}
                  >
                    <span
                      className="rounded-full bg-gray-800"
                      style={{
                        width: Math.min(sizeOption.size * 1.5, 16),
                        height: Math.min(sizeOption.size * 1.5, 16),
                      }}
                    />
                    <span className="hidden sm:inline">
                      {t(
                        `landing.brush_sizes.${sizeOption.label
                          .toLowerCase()
                          .replace(/ /g, '_')}`,
                        sizeOption.label
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {/* Username Form Section - now stacked below everything */}
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="flex flex-col gap-6 w-full max-w-xs mt-6"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="userName" className="text-gray-700 font-medium">
                  {t('landing.username_label', 'Username')}
                </label>
                <input
                  id="userName"
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all outline-none text-lg bg-white/70 shadow"
                  {...register('userName', { required: true })}
                  autoComplete="off"
                  placeholder={t(
                    'landing.username_placeholder',
                    'Enter your name...'
                  )}
                />
                {errors?.userName && (
                  <span className="text-red-500 text-sm">
                    {t('landing.username_required', 'This field is required')}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg text-lg transition-all duration-300"
              >
                {t('landing.show_lobbies', 'Show lobbies')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

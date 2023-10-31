import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LobbyContext } from '../../providers/LobbyProvider';
import { Line } from '../../providers/DrawingBoardProvider';
import { useForm, SubmitHandler } from 'react-hook-form';

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

  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [brushSize, setBrushSize] = useState(10);
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const navigate = useNavigate();

  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);

  const { stateUsername, setStateUsername } = useContext(LobbyContext);

  const undo = () => {
    //
  };

  const colorOptions = [
    {
      name: 'black',
      hex: '#000000',
    },
    {
      name: 'red',
      hex: '#FF0000',
    },
    {
      name: 'yellow',
      hex: '#FFFF00',
    },
    {
      name: 'green',
      hex: '#008000',
    },
    {
      name: 'blue',
      hex: '#0000FF',
    },
  ];

  const sizeOptions = [1, 4, 8, 16];

  useLayoutEffect(() => {
    const canvas = avatarCanvasRef.current as HTMLCanvasElement;
    canvas.height = 500;
    canvas.width = 500;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.lineWidth = brushSize!;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setCtx!(ctx);
  }, []);

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

  const draw = (ev: BoardEvent, isEnding = false) => {
    if (!ctx || !isDrawing) {
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
  };

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

  const onSubmit = (data: any) => {
    localStorage.setItem('userName', data?.userName);
    setStateUsername!(data?.userName);
    navigate('/lobbies');
  };

  const onError = (err: any) => {
    console.error(err);
  };
  return (
    <div className="h-screen">
      <div className="p-4 mt-8 md:w-1/2 bg-gray-300 mx-auto">
        <div className="flex mb-2">
          <div>avatar:</div>
          <div className="flex flex-col">
            <canvas
              // style={{ background: 'url(/paper2.jpeg)' }}
              className="border border-black"
              ref={avatarCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            ></canvas>
            <div className="flex p-2">
              <div
                className="h-12 w-12 me-2"
                style={{ backgroundColor: color }}
              ></div>
              {colorOptions?.map((colorOption) => (
                <div
                  style={{ backgroundColor: colorOption.hex }}
                  className="h-6 w-6"
                  onClick={() => handleColorChange!(colorOption.hex)}
                ></div>
              ))}
              {sizeOptions?.map((sizeOption) => (
                <div
                  className="mx-1"
                  onClick={() => handleBrushSizeChange!(sizeOption)}
                >
                  {sizeOption}
                </div>
              ))}
              <button
                // disabled={!context.canUndo}
                onClick={() => undo()}
              >
                Undo
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="flex mb-2">
            <div>Username:</div>
            <input
              className="shadow appearance-none border rounded ms-2"
              {...register('userName', { required: true })}
            />
          </div>
          {errors?.userName && <small className="text-danger">Required</small>}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Check lobbies
          </button>
        </form>
      </div>
    </div>
  );
}

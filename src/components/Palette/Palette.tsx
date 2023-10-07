import { useContext } from 'react';
import { DrawingBoardContext } from '../../providers/DrawingBoardProvider';

export default function Palette() {
  const context = useContext(DrawingBoardContext);

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

  return (
    <div className="flex p-2">
      <div
        className="h-12 w-12 me-2"
        style={{ backgroundColor: context.color }}
      ></div>
      {colorOptions?.map((colorOption) => (
        <div
          style={{ backgroundColor: colorOption.hex }}
          className="h-6 w-6"
          onClick={() => context.handleColorChange!(colorOption.hex)}
        ></div>
      ))}
      {sizeOptions?.map((sizeOption) => (
        <div
          className="mx-1"
          onClick={() => context.handleBrushSizeChange!(sizeOption)}
        >
          {sizeOption}
        </div>
      ))}
    </div>
  );
}

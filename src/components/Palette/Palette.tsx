import { useContext } from 'react';
import { DrawingBoardContext } from '../../providers/DrawingBoardProvider';
import { motion } from 'motion/react';
import Button from '../Button/Button';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { sizeOptions, colorOptions } from '../../constants/brushOptions';

export default function Palette() {
  const {
    color,
    handleColorChange,
    handleBrushSizeChange,
    canUndo,
    undo,
    setActiveTool,
    activeTool,
    brushSize,
  } = useContext(DrawingBoardContext);

  const { t } = useTranslation();

  const tools = [
    {
      name: 'brush',
      label: 'Čopič',
      icon: '🖌️',
      active: activeTool === 'brush',
    },
    {
      name: 'bucket',
      label: 'Barva',
      icon: '🪣',
      active: activeTool === 'bucket',
    },
  ];

  // Get the default brush size (4) to show as active
  const defaultBrushSize = 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-4"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 relative">
        {/* Undo Button - Compact, Top Right */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => undo!()}
          disabled={!canUndo}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          title={t('palette.undo', 'Undo')}
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
        </motion.button>

        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
            />
          </svg>
          {t('palette.palette_title', 'Tool palette')}
        </h3>

        <div className="space-y-3">
          {/* Color Palette - More Compact Grid */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1.5">
              {t('palette.colors', 'Colors')}
            </h4>
            <div className="grid grid-cols-9 sm:grid-cols-12 lg:grid-cols-18 gap-1">
              {colorOptions.map((colorOption) => (
                <motion.div
                  key={colorOption.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={clsx(
                    'w-7 h-7 rounded-md shadow-sm border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs relative',
                    color === colorOption.hex
                      ? 'border-blue-500 scale-110 shadow-md'
                      : 'border-white hover:border-gray-300'
                  )}
                  style={{ backgroundColor: colorOption.hex }}
                  onClick={() => handleColorChange!(colorOption.hex)}
                  title={colorOption.name}
                >
                  {color === colorOption.hex && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-3 h-3 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Brush Sizes and Tools - Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Brush Sizes */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t('palette.brush', 'Brush')}
              </h4>
              <div className="flex gap-1">
                {sizeOptions.map((sizeOption) => (
                  <motion.button
                    key={sizeOption.size}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                      'px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1',
                      'bg-white/50 border-2 hover:shadow-md',
                      brushSize === sizeOption.size ||
                        (brushSize === defaultBrushSize &&
                          sizeOption.size === defaultBrushSize)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    )}
                    onClick={() => handleBrushSizeChange!(sizeOption.size)}
                  >
                    <div
                      className="rounded-full bg-gray-800"
                      style={{
                        width: Math.min(sizeOption.size * 1.5, 16),
                        height: Math.min(sizeOption.size * 1.5, 16),
                      }}
                    />
                    <span className="hidden sm:inline">
                      {t(
                        `palette.brush_sizes.${sizeOption.label}`,
                        sizeOption.label
                      )}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t('palette.tools', 'Tools')}
              </h4>
              <div className="flex gap-1">
                {tools.map((tool) => (
                  <motion.button
                    key={tool.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1',
                      tool.active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'bg-white/50 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                    )}
                    onClick={() => setActiveTool!(tool.name)}
                  >
                    <span className="text-sm">{tool.icon}</span>
                    <span className="hidden sm:inline">
                      {t(`palette.${tool.name}`, tool.label)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

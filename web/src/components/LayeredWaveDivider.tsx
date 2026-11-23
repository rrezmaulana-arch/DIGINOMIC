import React from 'react';
import { MagicMotionLines } from './MagicMotionLines';

interface LayeredWaveDividerProps {
  toBg?: string;
  flip?: boolean;
}

/**
 * LayeredWaveDivider
 * Clean, subtle glowing motion line between sections.
 * No severed brown shapes or clunky barriers.
 */
export const LayeredWaveDivider: React.FC<LayeredWaveDividerProps> = () => {
  return (
    <div className="relative w-full overflow-hidden select-none pointer-events-none z-10 my-[-25px]">
      <MagicMotionLines variant="horizontal" />
    </div>
  );
};

/**
 * SlideCornerOrnaments
 * Clean placeholder (no severed waves or clutter)
 */
export const SlideCornerOrnaments: React.FC = () => null;

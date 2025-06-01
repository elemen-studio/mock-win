import { Sketch } from '@uiw/react-color';

interface ColorPickerSidebarProps {
  onColorSelect: (color: string) => void;
  selectedColor: string;
}

export function ColorPickerSidebar({ onColorSelect, selectedColor }: ColorPickerSidebarProps) {
  return (
    <div className="bg-white rounded-lg border border-stroke font-jetbrains">
      {/* Header */}
      <div className="p-4 border-b border-stroke">
        <h2 className="text-lg font-semibold text-accent font-inter">Background Color</h2>
      </div>

      {/* Sketch Color Picker */}
      <div className="p-4">
        <Sketch
          color={selectedColor}
          onChange={(color) => {
            onColorSelect(color.hex);
            console.log(color.hex);
          }}
        />
      </div>
    </div>
  );
} 
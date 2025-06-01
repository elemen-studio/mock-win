import ColorPicker from 'react-best-gradient-color-picker';

interface ColorPickerSidebarProps {
  onColorSelect: (color: string) => void;
  selectedColor: string;
}

export function ColorPickerSidebar({ onColorSelect, selectedColor }: ColorPickerSidebarProps) {
  // Ensure we have a valid color value - default to white if invalid
  const colorValue = selectedColor || 'rgba(255, 255, 255, 1)';

  return (
    <div className="bg-white rounded-lg border border-stroke font-jetbrains">
      {/* Header */}
      <div className="p-4 border-b border-stroke">
        <h2 className="text-lg font-semibold text-accent font-inter">Background Color</h2>
      </div>

      {/* Gradient Color Picker */}
      <div className="p-4">
        <ColorPicker
          value={colorValue}
          onChange={(color) => {
            onColorSelect(color);
            console.log('Color selected:', color);
          }}
          disableDarkMode={true}
          presets={[
            'rgba(255, 255, 255, 1)',
            'rgba(0, 0, 0, 1)',
            'rgba(255, 0, 0, 1)',
            'rgba(0, 255, 0, 1)',
            'rgba(0, 0, 255, 1)',
            'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,255,0,1) 100%)',
            'linear-gradient(90deg, rgba(0,255,255,1) 0%, rgba(255,0,255,1) 100%)',
            'linear-gradient(45deg, rgba(255,0,150,1) 0%, rgba(0,204,255,1) 100%)',
          ]}
        />
      </div>
    </div>
  );
} 
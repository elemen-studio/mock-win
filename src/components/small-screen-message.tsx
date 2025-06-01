import { Smartphone } from 'lucide-react';

export function SmallScreenMessage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-6">
      <div className="text-center max-w-sm">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <Smartphone className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-3 font-inter">
          Screen Too Small
        </h2>
        
        <p className="text-gray-600 mb-4 font-jetbrains text-sm leading-relaxed">
          Please open mock.win in a larger screen for the best experience.
        </p>
        
        <div className="text-xs text-gray-500 font-jetbrains">
          Minimum recommended width: 640px
        </div>
      </div>
    </div>
  );
} 
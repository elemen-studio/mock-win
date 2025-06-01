import { Github } from 'lucide-react';

export function SocialsSection() {
  return (
    <div className="bg-white rounded-lg border border-stroke font-jetbrains">
      {/* GitHub Link */}
      <div className="p-4">
        <a 
          href="https://github.com/elemen-studio/mock-win" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <Github className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
              View on GitHub
            </span>
            <span className="text-xs text-gray-500 group-hover:text-gray-600">
              Star the repository
            </span>
          </div>
        </a>
      </div>
    </div>
  );
} 
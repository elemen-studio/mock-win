import { forwardRef } from 'react';
import type { ReactNode, ForwardedRef } from 'react';

interface IPhoneMockupProps {
  children: ReactNode;
  className?: string;
}

export const IPhoneMockup = forwardRef<SVGSVGElement, IPhoneMockupProps>(({ 
  children, 
  className = "" 
}, ref: ForwardedRef<SVGSVGElement>) => {
  return (
    <div className={`relative ${className}`}>
      {/* iPhone mockup as base */}
      <svg 
        ref={ref} 
        width="385" 
        height="785" 
        viewBox="0 0 385 785" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Side buttons */}
        <path d="M0 151C0 149.895 0.895431 149 2 149H5V180H2C0.89543 180 0 179.105 0 178V151Z" fill="#898989" />
        <path d="M0 211C0 209.895 0.895431 209 2 209H5V265H2C0.89543 265 0 264.105 0 263V211Z" fill="#898989" />
        <path d="M0 284C0 282.895 0.895431 282 2 282H5V338H2C0.89543 338 0 337.105 0 336V284Z" fill="#898989" />
        
        <g clipPath="url(#clip0_iphone)">
          <g filter="url(#filter0_f_iphone)">
            <rect x="6.5" y="1.5" width="374" height="782" rx="60.5" stroke="#C3C3C3" strokeWidth="3" />
          </g>
          
          {/* Hardware details */}
          <rect x="298" width="6" height="4" fill="#D0D0D0" />
          <rect x="5" y="87" width="6" height="4" transform="rotate(-90 5 87)" fill="#D0D0D0" />
          <rect x="5" y="698" width="4" height="6" fill="#D0D0D0" />
          <rect x="68" y="781" width="5" height="4" fill="#D0D0D0" />
          <rect x="378" y="698" width="4" height="6" fill="#D0D0D0" />
          
          <g clipPath="url(#clip1_iphone)">
            <rect x="11" y="6" width="365" height="773" rx="56" stroke="black" strokeWidth="4" />
            {/* Black background to fill the gap */}
            <rect x="13" y="8" width="361" height="769" rx="54" fill="black" />
            
            {/* Content area - this is where children will be rendered */}
            <foreignObject x="17" y="12" width="353" height="761" clipPath="url(#screenClip)">
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '52px',
                  overflow: 'hidden'
                }}
              >
                {children}
              </div>
            </foreignObject>
          </g>
        </g>
        
        <defs>
          <filter id="filter0_f_iphone" x="1" y="-4" width="385" height="793" filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur_iphone" />
          </filter>
          <clipPath id="clip0_iphone">
            <rect x="5" width="377" height="785" rx="62" fill="white" />
          </clipPath>
          <clipPath id="clip1_iphone">
            <rect x="9" y="4" width="369" height="777" rx="58" fill="white" />
          </clipPath>
          <clipPath id="screenClip">
            <rect x="17" y="12" width="353" height="761" rx="52" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
});

IPhoneMockup.displayName = 'IPhoneMockup';
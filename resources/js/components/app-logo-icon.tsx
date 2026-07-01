import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement> & { className?: string }) {
    // If className is not provided or it doesn't set a size, provide a sensible default size
    const className = props.className || "w-8 h-8 rounded-xl object-contain";
    
    return (
        <img
            src="/images/re-logo.png"
            alt="ReTech Logo"
            {...props}
            className={className}
        />
    );
}

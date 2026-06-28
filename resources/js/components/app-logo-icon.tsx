import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            aria-hidden="true"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="7"
                y="10"
                width="6"
                height="44"
                rx="3"
                fill="currentColor"
            />
            <text
                x="36"
                y="41"
                fill="currentColor"
                fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fontSize="30"
                fontWeight="800"
                letterSpacing="0"
                textAnchor="middle"
            >
                Re
            </text>
            <rect
                x="22"
                y="49"
                width="20"
                height="4"
                rx="2"
                fill="currentColor"
            />
            <rect
                x="46"
                y="49"
                width="8"
                height="4"
                rx="2"
                fill="currentColor"
                opacity="0.7"
            />
        </svg>
    );
}

import { Package } from 'lucide-react';

export default function AppLogoIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <div {...props} className={`flex items-center justify-center rounded-lg bg-orange-600 text-white ${props.className}`}>
            <Package className="h-6 w-6" strokeWidth={1.5} />
        </div>
    );
}

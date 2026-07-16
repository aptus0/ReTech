import { useEffect, useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageCropperProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageFile: File | null;
    onCropComplete: (croppedFile: File) => void;
}

const OUTPUT_SIZE = 1200;

async function createCroppedFile(imageSrc: string, crop: Area, source: File): Promise<File> {
    const image = new Image();
    image.src = imageSrc;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Görsel işleme başlatılamadı.');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
    );

    const outputType = source.type === 'image/png' ? 'image/png' : 'image/webp';
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Görsel kaydedilemedi.')), outputType, 0.9);
    });
    const extension = outputType === 'image/png' ? 'png' : 'webp';
    const baseName = source.name.replace(/\.[^.]+$/, '') || 'urun-gorseli';

    return new File([blob], `${baseName}.${extension}`, { type: outputType });
}

export function ImageCropper({ open, onOpenChange, imageFile, onCropComplete }: ImageCropperProps) {
    const [imageSrc, setImageSrc] = useState('');
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedArea, setCroppedArea] = useState<Area | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!imageFile) {
            setImageSrc('');
            return;
        }

        const url = URL.createObjectURL(imageFile);
        setImageSrc(url);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedArea(null);

        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const handleSave = async () => {
        if (!croppedArea || !imageFile || !imageSrc) return;

        setSaving(true);
        try {
            onCropComplete(await createCroppedFile(imageSrc, croppedArea, imageFile));
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[680px]">
                <DialogHeader>
                    <DialogTitle>Ürün görselini ayarla</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Görseli sürükleyerek konumlandırın, yakınlaştırma çubuğuyla boyutunu ayarlayın.
                    </p>
                </DialogHeader>

                <div className="relative h-[420px] overflow-hidden rounded-lg bg-neutral-950">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            minZoom={1}
                            maxZoom={4}
                            zoomSpeed={0.15}
                            showGrid
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, pixels) => setCroppedArea(pixels)}
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <label htmlFor="product-image-zoom" className="font-medium">Görsel boyutu</label>
                        <span className="text-muted-foreground">%{Math.round(zoom * 100)}</span>
                    </div>
                    <input
                        id="product-image-zoom"
                        type="range"
                        min={1}
                        max={4}
                        step={0.01}
                        value={zoom}
                        onChange={(event) => setZoom(Number(event.target.value))}
                        className="w-full accent-primary"
                    />
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
                    <Button type="button" onClick={handleSave} disabled={!croppedArea || saving}>
                        {saving ? 'Hazırlanıyor…' : 'Uygula'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Search, Package, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function QuickSearchModal() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);

        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        if (!query) {
            setResults([]);

            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            axios.get(`/products?search=${query}`)
                .then(res => {
                    // Extract data from inertia pagination payload if needed, or create a fast API endpoint
                    // For now, assuming products are returned in standard inertia props structure
                    // But usually, an API endpoint is better. Let's assume /api/products/search exists
                    // We'll fallback to an empty array if format doesn't match
                    if (res.data && res.data.data) {
                        setResults(res.data.data.slice(0, 5));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <>
            {/* Buton (opsiyonel olarak menüde gösterilebilir) */}
            <button
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md transition-colors"
            >
                <Search className="w-4 h-4" />
                <span>Hızlı Arama...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 font-mono text-[10px] bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded ml-4">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-0 shadow-2xl">
                    <div className="flex items-center border-b px-4 py-3 bg-white dark:bg-neutral-950">
                        <Search className="w-5 h-5 text-neutral-400 mr-3" />
                        <input
                            className="flex-1 bg-transparent outline-none text-lg placeholder:text-neutral-400"
                            placeholder="Ürün adı, barkod veya SKU ara..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <kbd className="hidden md:inline-flex text-[10px] text-neutral-400 border rounded px-2 py-0.5 ml-3">ESC</kbd>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/50 min-h-[300px] max-h-[500px] overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center p-8 text-neutral-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
                                Aranıyor...
                            </div>
                        )}

                        {!loading && query && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-12 text-neutral-500">
                                <Package className="w-12 h-12 mb-4 opacity-20" />
                                <p>Sonuç bulunamadı.</p>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="p-2 space-y-1">
                                {results.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">{product.name}</div>
                                                <div className="text-xs text-neutral-500 font-mono">{product.barcode || 'Barkodsuz'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-bold text-neutral-900 dark:text-neutral-100">₺{product.sale_price}</div>
                                                <div className="text-[10px] text-neutral-400">Stok: {product.current_stock}</div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:text-orange-500 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!query && (
                            <div className="p-8 text-center text-sm text-neutral-500 flex flex-col items-center">
                                <Search className="w-10 h-10 mb-4 opacity-20" />
                                Hızlıca ürün bulmak için yazmaya başlayın.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

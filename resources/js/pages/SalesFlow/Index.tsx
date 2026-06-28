import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { Search, ShoppingCart, User, CreditCard, Banknote, Trash2, Tag, Calendar, BadgePercent, AlertTriangle } from 'lucide-react';
import InputError from '@/components/input-error';
import { toast } from 'sonner';

export default function SalesFlow({ products, customers, registers }: { products: any[], customers: any[], registers: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        items: [] as any[],
        subtotal: 0,
        tax_total: 0,
        grand_total: 0,
        payment_type: 'cash' as 'cash'|'credit'|'partial',
        cash_amount: 0,
        register_id: registers.length > 0 ? registers[0].id : '',
        due_date: '',
        notes: ''
    });

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        return products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (p.barcode && p.barcode.includes(searchQuery)) ||
            (p.stock_code && p.stock_code.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [products, searchQuery]);

    const addToCart = (product: any) => {
        const existing = data.items.find(i => i.product_id === product.id);
        let newItems = [];
        if (existing) {
            newItems = data.items.map(i => 
                i.product_id === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unit_price } : i
            );
        } else {
            newItems = [...data.items, {
                product_id: product.id,
                product_name: product.name,
                quantity: 1,
                unit_price: product.sale_price,
                tax_rate: product.tax_rate || 0,
                total: product.sale_price
            }];
        }
        updateTotals(newItems);
    };

    const updateQuantity = (index: number, quantity: number) => {
        if (quantity < 0.1) return;
        const newItems = [...data.items];
        newItems[index].quantity = quantity;
        newItems[index].total = quantity * newItems[index].unit_price;
        updateTotals(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        updateTotals(newItems);
    };

    const updateTotals = (newItems: any[]) => {
        let subtotal = 0;
        newItems.forEach(i => subtotal += i.total);
        // Assuming prices include tax for simplicity in this demo, or we calculate tax separately.
        const tax_total = subtotal * 0.18; // Fake 18% tax calculation for demo
        const grand_total = subtotal; // Assuming sale_price is tax inclusive

        setData(prev => ({
            ...prev,
            items: newItems,
            subtotal: subtotal,
            tax_total: tax_total,
            grand_total: grand_total,
            cash_amount: prev.payment_type === 'cash' ? grand_total : prev.cash_amount
        }));
    };

    const submitSale = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.items.length === 0) {
            toast.error('Sepette ürün yok!');
            return;
        }

        post('/sales-flow', {
            onSuccess: () => {
                reset();
                toast.success('Satış başarıyla tamamlandı!');
            },
            onError: (err) => {
                console.error(err);
                if (Object.values(err).length > 0) {
                    toast.error(Object.values(err)[0] as string);
                } else {
                    toast.error('Satış işlemi sırasında bir hata oluştu.');
                }
            }
        });
    };

    return (
        <>
            <Head title="Satıştan Tahsilata" />
            <div className="flex h-[calc(100vh-140px)] gap-4 p-4 overflow-hidden">
                {/* Sol / Orta Panel: Ürünler ve Arama */}
                <div className="w-2/3 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Ürün adı, barkod veya stok kodu okutun..." 
                            className="pl-10 h-12 text-lg font-medium shadow-sm border-orange-200 focus-visible:ring-orange-600"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 rounded-lg border p-4 overflow-y-auto grid grid-cols-3 gap-3 content-start shadow-inner">
                        {filteredProducts.map(product => (
                            <div 
                                key={product.id} 
                                onClick={() => addToCart(product)}
                                className="bg-card border rounded-md p-3 cursor-pointer hover:border-orange-500 hover:shadow-md transition-all group flex flex-col justify-between h-28 relative overflow-hidden"
                            >
                                <div className="font-semibold text-sm leading-tight group-hover:text-orange-600">{product.name}</div>
                                <div className="text-xs text-muted-foreground mt-1 flex-1">{product.stock_code}</div>
                                <div className="flex justify-between items-end">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.current_stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        Stok: {product.current_stock}
                                    </span>
                                    <span className="font-bold text-lg">₺{Number(product.sale_price).toLocaleString('tr-TR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sağ Panel: Sepet ve Ödeme */}
                <div className="w-1/3 bg-white dark:bg-neutral-900 rounded-lg border shadow-lg flex flex-col overflow-hidden">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-4 border-b flex items-center justify-between">
                        <h2 className="font-bold text-lg flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2 text-orange-600" /> Sepet
                        </h2>
                        <BadgePercent className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {data.items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <ShoppingCart className="w-16 h-16 mb-4" />
                                <p>Sepetiniz boş.</p>
                                <p className="text-sm">Sol taraftan ürün seçin veya barkod okutun.</p>
                            </div>
                        ) : (
                            data.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md border">
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm">{item.product_name}</div>
                                        <div className="text-xs text-muted-foreground font-mono mt-1">₺{item.unit_price} x 
                                            <input 
                                                type="number" 
                                                className="w-12 mx-2 text-center border-neutral-300 rounded-sm text-xs py-0.5" 
                                                value={item.quantity}
                                                onChange={e => updateQuantity(index, parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <div className="font-bold">₺{item.total.toLocaleString('tr-TR')}</div>
                                    <button onClick={() => removeItem(index)} className="ml-3 p-1.5 text-red-500 hover:bg-red-100 rounded-md">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={submitSale} className="bg-neutral-50 dark:bg-neutral-950 p-4 border-t space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center text-xs uppercase tracking-wider text-muted-foreground"><User className="w-3 h-3 mr-1" /> Müşteri (Opsiyonel)</Label>
                            <select 
                                className="w-full h-9 rounded-md border-neutral-300 text-sm shadow-sm"
                                value={data.customer_id}
                                onChange={e => setData('customer_id', e.target.value)}
                            >
                                <option value="">Perakende Müşteri (Peşin)</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button 
                                type="button" 
                                variant={data.payment_type === 'cash' ? 'default' : 'outline'} 
                                className={data.payment_type === 'cash' ? 'bg-green-600 hover:bg-green-700 text-xs' : 'text-xs'}
                                onClick={() => setData(prev => ({...prev, payment_type: 'cash', cash_amount: prev.grand_total, due_date: ''}))}
                            >
                                <Banknote className="w-4 h-4 mr-1" /> Peşin
                            </Button>
                            <Button 
                                type="button" 
                                variant={data.payment_type === 'credit' ? 'default' : 'outline'}
                                className={data.payment_type === 'credit' ? 'bg-orange-600 hover:bg-orange-700 text-xs' : 'text-xs'}
                                onClick={() => setData('payment_type', 'credit')}
                            >
                                <Calendar className="w-4 h-4 mr-1" /> Vadeli
                            </Button>
                            <Button 
                                type="button" 
                                variant={data.payment_type === 'partial' ? 'default' : 'outline'}
                                className={data.payment_type === 'partial' ? 'bg-blue-600 hover:bg-blue-700 text-xs' : 'text-xs'}
                                onClick={() => setData('payment_type', 'partial')}
                            >
                                <CreditCard className="w-4 h-4 mr-1" /> Parçalı
                            </Button>
                        </div>

                        {data.payment_type !== 'cash' && data.customer_id === '' && (
                            <div className="text-xs text-red-500 flex items-center p-2 bg-red-50 rounded border border-red-100">
                                <AlertTriangle className="w-4 h-4 mr-1" /> Vadeli işlem için müşteri seçmelisiniz.
                            </div>
                        )}

                        {data.payment_type === 'partial' && (
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Alınan Nakit</Label>
                                    <Input 
                                        type="number" 
                                        value={data.cash_amount} 
                                        onChange={e => setData('cash_amount', parseFloat(e.target.value) || 0)} 
                                        className="h-8"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Kalan (Açık Hesap)</Label>
                                    <Input disabled value={data.grand_total - data.cash_amount} className="h-8 bg-neutral-100" />
                                </div>
                            </div>
                        )}

                        {data.payment_type !== 'cash' && (
                            <div className="space-y-1">
                                <Label className="text-xs">Vade Tarihi</Label>
                                <Input 
                                    type="date" 
                                    value={data.due_date} 
                                    onChange={e => setData('due_date', e.target.value)} 
                                    className="h-8"
                                    required={data.payment_type === 'credit'}
                                />
                            </div>
                        )}

                        <div className="border-t border-dashed pt-3 pb-1">
                            <div className="flex justify-between items-end">
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Genel Toplam</div>
                                <div className="text-3xl font-black text-orange-600">₺{data.grand_total.toLocaleString('tr-TR')}</div>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={processing || data.items.length === 0 || (data.payment_type !== 'cash' && !data.customer_id)} 
                            className="w-full h-14 text-lg font-bold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xl"
                        >
                            Satışı Tamamla
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}

SalesFlow.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Satıştan Tahsilata', href: '/sales-flow' }]}>
        {page}
    </AppLayout>
);

import { Head, Link, usePage } from '@inertiajs/react';
import { PlusCircle, Edit, Trash2, Users, Search, MoreVertical, Store, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UsersIndex() {
    const { users } = usePage().props as unknown as { users: { data: any[] } };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Sistem Yöneticisi</Badge>;
            case 'manager':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Müdür</Badge>;
            case 'sales_consultant':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">Satış Danışmanı</Badge>;
            case 'warehouse':
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">Depo</Badge>;
            default:
                return <Badge className="bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border-neutral-200">Personel</Badge>;
        }
    };

    return (
        <>
            <Head title="Kullanıcı Yönetimi" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Kullanıcı Yönetimi</h1>
                        <p className="text-muted-foreground mt-1">Sistemdeki tüm personelleri ve yöneticileri buradan yönetebilirsiniz.</p>
                    </div>
                    <Button asChild className="bg-orange-600 hover:bg-orange-700 rounded-full px-6 shadow-md shadow-orange-600/20">
                        <Link href="/settings/users/create" className="flex items-center gap-2 font-semibold">
                            <PlusCircle className="h-5 w-5" />
                            Yeni Kullanıcı Ekle
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-1 items-center gap-4 relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Personel adı, e-posta veya mağaza kodu ara..." 
                            className="max-w-md pl-9 h-11"
                        />
                    </div>
                    <Button variant="secondary" className="h-11 px-6">Ara</Button>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex-1">
                    <Table>
                        <TableHeader className="bg-neutral-50/50 dark:bg-neutral-900/50">
                            <TableRow>
                                <TableHead className="w-[300px]">AD SOYAD & E-POSTA</TableHead>
                                <TableHead>MAĞAZA KODU</TableHead>
                                <TableHead>PERSONEL NO</TableHead>
                                <TableHead>ROL</TableHead>
                                <TableHead className="text-right">İŞLEMLER</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <TableRow key={user.id} className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm font-medium">
                                                <Store className="w-4 h-4 mr-2 text-neutral-400" />
                                                {user.store_code || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-neutral-600">
                                            #{user.personnel_no || 'YOK'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Shield className="w-4 h-4 text-neutral-400" />
                                                {getRoleBadge(user.role)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <Link href={`/settings/users/${user.id}/edit`}>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4 text-blue-500" /> Düzenle
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <Link href={`/settings/users/${user.id}`} method="delete" as="button" className="w-full">
                                                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                                                        </DropdownMenuItem>
                                                    </Link>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center flex-col items-center justify-center">
                                        <Users className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                        <p className="text-neutral-500">Kayıtlı kullanıcı bulunamadı.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Kullanıcı Yönetimi', href: '/settings/users' },
    ],
};

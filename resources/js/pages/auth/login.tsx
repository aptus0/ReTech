import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';


type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [loginType, setLoginType] = useState<'personnel' | 'admin'>('personnel');

    return (
        <>
            <Head title="Giriş Yap" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex gap-4 mb-2">
                            <Button 
                                type="button" 
                                variant={loginType === 'personnel' ? 'default' : 'outline'} 
                                onClick={() => setLoginType('personnel')}
                                className="flex-1"
                            >
                                Personel Girişi
                            </Button>
                            <Button 
                                type="button" 
                                variant={loginType === 'admin' ? 'default' : 'outline'} 
                                onClick={() => setLoginType('admin')}
                                className="flex-1"
                            >
                                Admin Girişi
                            </Button>
                        </div>

                        <div className="grid gap-6">
                            {loginType === 'admin' ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-posta adresi</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="admin@retech.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="store_code">Mağaza Kodu</Label>
                                        <Input
                                            id="store_code"
                                            type="text"
                                            name="store_code"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            placeholder="Örn: MGZ-01"
                                        />
                                        <InputError message={errors.store_code} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="personnel_no">Personel No</Label>
                                        <Input
                                            id="personnel_no"
                                            type="text"
                                            name="personnel_no"
                                            required
                                            tabIndex={2}
                                            placeholder="Örn: 10045"
                                        />
                                        <InputError message={errors.personnel_no} />
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Parola</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Parolanızı mı unuttunuz?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="current-password"
                                    placeholder="Parola"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Beni hatırla</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Giriş Yap
                            </Button>
                        </div>

                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Hesabınıza giriş yapın',
    description: 'Devam etmek için e-posta ve parolanızı girin',
};

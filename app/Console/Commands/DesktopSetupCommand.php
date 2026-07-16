<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Company;
use Spatie\Permission\Models\Role;

class DesktopSetupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:desktop-setup {companyName} {taxNumber} {adminName} {email} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Masaüstü uygulaması ilk kurulumu için firma ve yönetici oluşturur.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Kurulum başlatılıyor...');

        $companyName = $this->argument('companyName');
        $taxNumber = $this->argument('taxNumber');
        $adminName = $this->argument('adminName');
        $email = $this->argument('email');
        $password = $this->argument('password');

        try {
            // Create Company
            $company = Company::create([
                'name' => $companyName,
                'tax_number' => $taxNumber,
                'is_active' => true,
            ]);

            // Create Super Admin User
            $user = User::create([
                'name' => $adminName,
                'email' => $email,
                'password' => Hash::make($password),
                'company_id' => $company->id,
            ]);

            // Assign Super Admin Role (assuming Spatie Permission)
            $role = Role::firstOrCreate(['name' => 'super_admin']);
            $user->assignRole($role);

            $this->info('Kurulum başarıyla tamamlandı.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Kurulum sırasında hata oluştu: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}

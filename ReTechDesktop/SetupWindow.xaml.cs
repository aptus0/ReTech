using System;
using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Input;

namespace ReTechDesktop
{
    public partial class SetupWindow : Window
    {
        private string LaravelPath => Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "laravel");

        public SetupWindow()
        {
            InitializeComponent();
        }

        private void Window_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            DragMove();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }

        private void BtnSave_Click(object sender, RoutedEventArgs e)
        {
            string companyName = TxtCompanyName.Text.Trim();
            string taxNumber = TxtTaxNumber.Text.Trim();
            string adminName = TxtAdminName.Text.Trim();
            string email = TxtEmail.Text.Trim();
            string password = TxtPassword.Password;

            if (string.IsNullOrEmpty(companyName) || string.IsNullOrEmpty(taxNumber) || 
                string.IsNullOrEmpty(adminName) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                TxtStatus.Text = "Lütfen tüm alanları doldurun!";
                return;
            }

            TxtStatus.Text = "Sistem kuruluyor, lütfen bekleyin...";
            
            try
            {
                // Ensure db is migrated
                Process migrateProc = new Process();
                migrateProc.StartInfo.FileName = "php";
                migrateProc.StartInfo.Arguments = "artisan migrate:fresh --force";
                migrateProc.StartInfo.WorkingDirectory = LaravelPath;
                migrateProc.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                migrateProc.StartInfo.CreateNoWindow = true;
                migrateProc.StartInfo.UseShellExecute = false;
                migrateProc.Start();
                migrateProc.WaitForExit();

                // Run Setup Command
                Process setupProc = new Process();
                setupProc.StartInfo.FileName = "php";
                setupProc.StartInfo.Arguments = $"artisan app:desktop-setup \"{companyName}\" \"{taxNumber}\" \"{adminName}\" \"{email}\" \"{password}\"";
                setupProc.StartInfo.WorkingDirectory = LaravelPath;
                setupProc.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                setupProc.StartInfo.CreateNoWindow = true;
                setupProc.StartInfo.RedirectStandardOutput = true;
                setupProc.StartInfo.UseShellExecute = false;
                setupProc.Start();
                
                string output = setupProc.StandardOutput.ReadToEnd();
                setupProc.WaitForExit();

                if (setupProc.ExitCode == 0)
                {
                    MessageBox.Show("Firma başarıyla oluşturuldu! Artık giriş yapabilirsiniz.", "Başarılı", MessageBoxButton.OK, MessageBoxImage.Information);
                    this.Close();
                }
                else
                {
                    MessageBox.Show("Kurulum hatası: " + output, "Hata", MessageBoxButton.OK, MessageBoxImage.Error);
                    TxtStatus.Text = "Kurulum başarısız!";
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Sistem hatası: " + ex.Message, "Kritik Hata", MessageBoxButton.OK, MessageBoxImage.Error);
                TxtStatus.Text = "Bir hata oluştu.";
            }
        }
    }
}

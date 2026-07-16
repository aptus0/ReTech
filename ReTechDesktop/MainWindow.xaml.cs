using System;
using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Input;

namespace ReTechDesktop
{
    public partial class MainWindow : Window
    {
        private string LaravelPath => Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "laravel");

        public MainWindow()
        {
            InitializeComponent();
        }

        private void Window_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            DragMove();
        }

        private void MinimizeButton_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            // Tüm servisleri otomatik başlat
            StartApi();
            StartFrontend();
            StartPrinter();
            OpenWebApp();
        }

        private void BtnStartApi_Click(object sender, RoutedEventArgs e)
        {
            StartApi();
            StartFrontend();
        }

        private void StartApi()
        {
            TxtStatus.Text = "Durum: Servisler Başlatılıyor...";
            
            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = "php",
                    Arguments = "artisan serve --host=0.0.0.0 --port=8000",
                    WorkingDirectory = LaravelPath,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(startInfo);
                
                TxtStatus.Text = "Durum: API Çalışıyor (0.0.0.0:8000)";
            }
            catch (Exception ex)
            {
                MessageBox.Show("API başlatılırken hata oluştu: " + ex.Message, "Hata", MessageBoxButton.OK, MessageBoxImage.Error);
                TxtStatus.Text = "Durum: API Başlatılamadı";
            }
        }

        private void StartFrontend()
        {
            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c npm run dev -- --host",
                    WorkingDirectory = LaravelPath,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(startInfo);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Frontend başlatılırken hata oluştu: " + ex.Message, "Hata", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnStartPrinter_Click(object sender, RoutedEventArgs e)
        {
            StartPrinter();
        }

        private void StartPrinter()
        {
            TxtStatus.Text = "Durum: Printer Servisi Başlatılıyor...";
            
            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c echo Printer Started", 
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true
                };
                Process.Start(startInfo);
                
                TxtStatus.Text = "Durum: Printer Servisi Aktif";
            }
            catch (Exception ex)
            {
                MessageBox.Show("Printer başlatılırken hata oluştu: " + ex.Message, "Hata", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnStartWebApp_Click(object sender, RoutedEventArgs e)
        {
            OpenWebApp();
        }

        private void OpenWebApp()
        {
            try
            {
                // .env dosyasından APP_URL'yi oku
                string appUrl = "https://kobix.test";
                string envPath = Path.Combine(LaravelPath, ".env");
                if (File.Exists(envPath))
                {
                    foreach (string line in File.ReadAllLines(envPath))
                    {
                        if (line.StartsWith("APP_URL="))
                        {
                            appUrl = line.Substring("APP_URL=".Length).Trim().Trim('"');
                            break;
                        }
                    }
                }

                Process.Start(new ProcessStartInfo
                {
                    FileName = appUrl,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Web uygulaması açılamadı: " + ex.Message, "Hata", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnFirstRun_Click(object sender, RoutedEventArgs e)
        {
            SetupWindow setupWindow = new SetupWindow();
            setupWindow.Owner = this;
            setupWindow.ShowDialog();
        }
    }
}
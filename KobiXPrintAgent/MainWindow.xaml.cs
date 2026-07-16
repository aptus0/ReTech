using System;
using System.IO;
using System.IO.Ports;
using System.Drawing.Printing;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace KobiXPrintAgent
{
    public partial class MainWindow : Window
    {
        private HttpListener? _listener;
        private CancellationTokenSource? _cts;

        public MainWindow()
        {
            InitializeComponent();
            LoadPortsAndPrinters();
            Log("KobiX Print Agent başlatıldı.");
        }

        private void LoadPortsAndPrinters()
        {
            CmbPrinters.Items.Clear();
            
            // Add COM Ports
            foreach (string port in SerialPort.GetPortNames())
            {
                CmbPrinters.Items.Add($"PORT: {port}");
            }

            // Add Installed Printers
            foreach (string printer in PrinterSettings.InstalledPrinters)
            {
                CmbPrinters.Items.Add($"PRINTER: {printer}");
            }

            if (CmbPrinters.Items.Count > 0)
                CmbPrinters.SelectedIndex = 0;
            else
                CmbPrinters.Items.Add("Cihaz bulunamadı");
        }

        private void Log(string message)
        {
            Dispatcher.Invoke(() =>
            {
                TxtLogs.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}\n");
                TxtLogs.ScrollToEnd();
            });
        }

        private void BtnStart_Click(object sender, RoutedEventArgs e)
        {
            if (CmbPrinters.SelectedItem == null || CmbPrinters.SelectedItem.ToString() == "Cihaz bulunamadı")
            {
                MessageBox.Show("Lütfen geçerli bir port veya yazıcı seçin.", "Hata", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                _listener = new HttpListener();
                // To allow CORS requests from the browser
                _listener.Prefixes.Add("http://127.0.0.1:8081/");
                _listener.Start();

                _cts = new CancellationTokenSource();
                Task.Run(() => ListenAsync(_cts.Token));

                BtnStart.IsEnabled = false;
                BtnStop.IsEnabled = true;
                CmbPrinters.IsEnabled = false;
                LblStatus.Text = $"Durum: API Çalışıyor (Port 8081) -> Hedef: {CmbPrinters.SelectedItem}";
                LblStatus.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(34, 197, 94)); // Green

                Log("API Sunucusu http://127.0.0.1:8081/ adresinde dinleniyor.");
            }
            catch (Exception ex)
            {
                Log($"Hata: {ex.Message}");
                MessageBox.Show("API başlatılamadı. Yönetici izinleri gerekebilir.", "Hata", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnStop_Click(object sender, RoutedEventArgs e)
        {
            StopApi();
        }

        private void StopApi()
        {
            if (_listener != null && _listener.IsListening)
            {
                _cts?.Cancel();
                _listener.Stop();
                _listener.Close();
                _listener = null;

                BtnStart.IsEnabled = true;
                BtnStop.IsEnabled = false;
                CmbPrinters.IsEnabled = true;
                LblStatus.Text = "Durum: Durduruldu.";
                LblStatus.Foreground = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(220, 38, 38)); // Red

                Log("API Sunucusu durduruldu.");
            }
        }

        private async Task ListenAsync(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                try
                {
                    var context = await _listener.GetContextAsync();
                    
                    // Handle CORS Preflight
                    if (context.Request.HttpMethod == "OPTIONS")
                    {
                        context.Response.AddHeader("Access-Control-Allow-Origin", "*");
                        context.Response.AddHeader("Access-Control-Allow-Headers", "*");
                        context.Response.AddHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
                        context.Response.StatusCode = 200;
                        context.Response.Close();
                        continue;
                    }

                    context.Response.AddHeader("Access-Control-Allow-Origin", "*");

                    if (context.Request.Url.AbsolutePath == "/print" && context.Request.HttpMethod == "POST")
                    {
                        using (var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding))
                        {
                            string printData = await reader.ReadToEndAsync();
                            Log($"Baskı isteği alındı. Boyut: {printData.Length} bytes.");
                            
                            // Here you would implement actual printing to the selected COM port or Printer
                            // e.g. send 'printData' bytes to SerialPort or RawPrinterHelper
                            Log("Baskı hedefe gönderildi: " + Dispatcher.Invoke(() => CmbPrinters.SelectedItem.ToString()));
                        }

                        byte[] buffer = Encoding.UTF8.GetBytes("{\"status\":\"success\"}");
                        context.Response.ContentType = "application/json";
                        context.Response.ContentLength64 = buffer.Length;
                        await context.Response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
                        context.Response.Close();
                    }
                    else
                    {
                        context.Response.StatusCode = 404;
                        context.Response.Close();
                    }
                }
                catch (HttpListenerException)
                {
                    // Listener stopped or cancelled
                    break;
                }
                catch (Exception ex)
                {
                    Log($"Hata (API): {ex.Message}");
                }
            }
        }

        protected override void OnClosed(EventArgs e)
        {
            StopApi();
            base.OnClosed(e);
        }
    }
}
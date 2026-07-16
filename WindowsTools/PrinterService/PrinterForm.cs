using System;
using System.Drawing.Printing;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace PrinterService
{
    public partial class PrinterForm : Form
    {
        private TcpListener _server;
        private bool _isRunning = false;

        public PrinterForm()
        {
            InitializeComponent();
        }

        private void PrinterForm_Load(object sender, EventArgs e)
        {
            LoadPrinters();
            StartSocketServer();
        }

        private void LoadPrinters()
        {
            lstPrinters.Items.Clear();
            foreach (string printer in PrinterSettings.InstalledPrinters)
            {
                lstPrinters.Items.Add(printer);
            }
            Log("Loaded " + PrinterSettings.InstalledPrinters.Count + " local printers.");
        }

        private async void StartSocketServer()
        {
            try
            {
                int port = 9100; // Common RAW print port or custom port for Laravel
                _server = new TcpListener(IPAddress.Any, port);
                _server.Start();
                _isRunning = true;
                
                Log($"Socket server started on 0.0.0.0:{port}. Listening for Laravel...");

                while (_isRunning)
                {
                    TcpClient client = await _server.AcceptTcpClientAsync();
                    _ = HandleClientAsync(client);
                }
            }
            catch (Exception ex)
            {
                if (_isRunning)
                {
                    Log("Server Error: " + ex.Message);
                }
            }
        }

        private async Task HandleClientAsync(TcpClient client)
        {
            try
            {
                Log($"Client connected: {client.Client.RemoteEndPoint}");
                using (NetworkStream stream = client.GetStream())
                {
                    byte[] buffer = new byte[4096];
                    int bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
                    if (bytesRead > 0)
                    {
                        string dataReceived = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                        Log("Received Print Job/Data: " + dataReceived.Substring(0, Math.Min(dataReceived.Length, 50)) + "...");
                        // Here you would parse the job and send it to a printer
                        
                        string response = "OK: Job Received";
                        byte[] responseBytes = Encoding.UTF8.GetBytes(response);
                        await stream.WriteAsync(responseBytes, 0, responseBytes.Length);
                    }
                }
            }
            catch (Exception ex)
            {
                Log("Client Error: " + ex.Message);
            }
            finally
            {
                client.Close();
                Log("Client disconnected.");
            }
        }

        private void Log(string message)
        {
            if (txtLog.InvokeRequired)
            {
                txtLog.Invoke(new Action(() => Log(message)));
                return;
            }
            
            txtLog.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}{Environment.NewLine}");
            txtLog.ScrollToCaret();
        }

        private void btnRefresh_Click(object sender, EventArgs e)
        {
            LoadPrinters();
        }

        private void PrinterForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            _isRunning = false;
            _server?.Stop();
        }
    }
}

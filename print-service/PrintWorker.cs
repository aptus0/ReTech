using System;
using System.Collections.Generic;
using System.IO.Ports;
using System.Management;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace EnvanzoPrintService
{
    public class PrintWorker : BackgroundService
    {
        private readonly ILogger<PrintWorker> _logger;
        private readonly HttpListener _listener;
        private readonly HttpClient _httpClient;
        
        // This should ideally come from a settings file. For now, we assume local or a specific server URL.
        private string _serverUrl = "http://127.0.0.1:8000/api";

        public PrintWorker(ILogger<PrintWorker> logger)
        {
            _logger = logger;
            _listener = new HttpListener();
            _listener.Prefixes.Add("http://*:8080/printers/");
            _listener.Prefixes.Add("http://+:8080/printers/");
            _httpClient = new HttpClient();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Envanzo Print Service started at: {time}", DateTimeOffset.Now);

            // Start HTTP Listener for local printer discovery
            _listener.Start();
            _ = Task.Run(() => HandleIncomingConnections(stoppingToken), stoppingToken);

            // Polling loop
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckForPrintJobsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error checking print jobs");
                }

                await Task.Delay(2000, stoppingToken); // Check every 2 seconds
            }

            _listener.Stop();
        }

        private async Task HandleIncomingConnections(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var context = await _listener.GetContextAsync();
                    var request = context.Request;
                    var response = context.Response;

                    // CORS
                    response.AppendHeader("Access-Control-Allow-Origin", "*");
                    response.AppendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
                    response.AppendHeader("Access-Control-Allow-Headers", "Content-Type");

                    if (request.HttpMethod == "OPTIONS")
                    {
                        response.StatusCode = 200;
                        response.Close();
                        continue;
                    }

                    if (request.HttpMethod == "GET" && request.Url?.AbsolutePath == "/printers/")
                    {
                        var printers = GetPrinters();
                        string json = JsonSerializer.Serialize(printers);
                        
                        byte[] buffer = Encoding.UTF8.GetBytes(json);
                        response.ContentType = "application/json";
                        response.ContentLength64 = buffer.Length;
                        await response.OutputStream.WriteAsync(buffer, 0, buffer.Length);
                    }
                    else
                    {
                        response.StatusCode = 404;
                    }

                    response.Close();
                }
                catch (HttpListenerException) when (stoppingToken.IsCancellationRequested)
                {
                    // Ignore if stopping
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error handling HTTP request");
                }
            }
        }

        private List<object> GetPrinters()
        {
            var printers = new List<object>();

            // Get Windows Printers
            try
            {
                var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Printer");
                foreach (ManagementObject printer in searcher.Get())
                {
                    printers.Add(new
                    {
                        Type = "USB/Windows",
                        Name = printer["Name"]?.ToString(),
                        PortName = printer["PortName"]?.ToString(),
                        DriverName = printer["DriverName"]?.ToString(),
                        IsDefault = (bool)(printer["Default"] ?? false),
                        Status = printer["Status"]?.ToString()
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error querying WMI printers");
            }

            // Get COM Ports
            try
            {
                string[] ports = SerialPort.GetPortNames();
                foreach (var port in ports)
                {
                    printers.Add(new
                    {
                        Type = "COM",
                        Name = port,
                        PortName = port,
                        DriverName = "Serial Port",
                        IsDefault = false,
                        Status = "Ready"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error querying COM ports");
            }

            return printers;
        }

        private async Task CheckForPrintJobsAsync(CancellationToken stoppingToken)
        {
            // Call Laravel API
            try
            {
                var response = await _httpClient.GetAsync($"{_serverUrl}/barcode-print-queues/pending", stoppingToken);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync(stoppingToken);
                    var payload = JsonSerializer.Deserialize<PrintQueueResponse>(content);

                    if (payload != null && payload.Jobs != null)
                    {
                        foreach (var job in payload.Jobs)
                        {
                            bool success = PrintJob(job);
                            if (success)
                            {
                                // Mark as completed
                                await _httpClient.PostAsync($"{_serverUrl}/barcode-print-queues/{job.Id}/complete", null, stoppingToken);
                            }
                        }
                    }
                }
            }
            catch (HttpRequestException)
            {
                // Silent catch for connection errors if server is unreachable
            }
        }

        private bool PrintJob(PrintJob job)
        {
            try
            {
                if (job.ConnectionType == "COM")
                {
                    using (SerialPort port = new SerialPort(job.PrinterName, 9600, Parity.None, 8, StopBits.One))
                    {
                        port.Open();
                        port.Write(job.RawCommand);
                        port.Close();
                    }
                }
                else
                {
                    RawPrinterHelper.SendStringToPrinter(job.PrinterName, job.RawCommand);
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error printing job ID {jobId}", job.Id);
                return false;
            }
        }
    }

    public class PrintQueueResponse
    {
        public List<PrintJob>? Jobs { get; set; }
    }

    public class PrintJob
    {
        public int Id { get; set; }
        public string PrinterName { get; set; } = "";
        public string ConnectionType { get; set; } = "";
        public string RawCommand { get; set; } = "";
    }
}

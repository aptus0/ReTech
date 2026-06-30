using System;
using System.Management;
using System.Security.Cryptography;
using System.Text;
using System.Net.NetworkInformation;
using System.Linq;

namespace ReTechKeyGen
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "ReTech Lisans ve Donanim Kimligi Uretici";
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("==================================================");
            Console.WriteLine("       RETECH DONANIM KIMLIGI (HWID) URETICI      ");
            Console.WriteLine("==================================================");
            Console.ResetColor();
            Console.WriteLine("Sistem taranıyor...\n");

            try
            {
                string cpuId = GetCpuId();
                string boardId = GetBoardId();
                string macAddress = GetMacAddress();

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"[CPU ID]      : {cpuId}");
                Console.WriteLine($"[ANAKART ID]  : {boardId}");
                Console.WriteLine($"[MAC ADRESI]  : {macAddress}");
                Console.ResetColor();

                string rawHwid = $"{cpuId}-{boardId}-{macAddress}";
                string licenseKey = GenerateLicenseKey(rawHwid);

                Console.WriteLine("\n==================================================");
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("LİSANS ANAHTARINIZ BASARIYLA URETILDI:");
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.DarkRed;
                Console.WriteLine($"  {licenseKey}  ");
                Console.ResetColor();
                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Lutfen bu 30 karakterlik anahtari kopyalayip");
                Console.WriteLine("ReTech sistemine giris yapin.");
                Console.ResetColor();
                Console.WriteLine("==================================================");
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("\n[HATA] Donanim bilgileri okunamadi: " + ex.Message);
                Console.ResetColor();
            }

            Console.WriteLine("\nKapatmak icin herhangi bir tusa basin...");
            Console.ReadKey();
        }

        static string GetCpuId()
        {
            string cpuInfo = string.Empty;
            ManagementClass mc = new ManagementClass("win32_processor");
            ManagementObjectCollection moc = mc.GetInstances();
            foreach (ManagementObject mo in moc)
            {
                if (cpuInfo == "")
                {
                    cpuInfo = mo.Properties["processorID"].Value.ToString();
                    break;
                }
            }
            return cpuInfo;
        }

        static string GetBoardId()
        {
            string boardInfo = string.Empty;
            ManagementObjectSearcher searcher = new ManagementObjectSearcher("root\\CIMV2", "SELECT * FROM Win32_BaseBoard");
            foreach (ManagementObject wmi in searcher.Get())
            {
                try
                {
                    boardInfo = wmi.GetPropertyValue("SerialNumber").ToString();
                    break;
                }
                catch { }
            }
            return boardInfo;
        }

        static string GetMacAddress()
        {
            var macAddr = (from nic in NetworkInterface.GetAllNetworkInterfaces()
                           where nic.OperationalStatus == OperationalStatus.Up
                           select nic.GetPhysicalAddress().ToString()
                           ).FirstOrDefault();
            return macAddr ?? "UNKNOWN_MAC";
        }

        static string GenerateLicenseKey(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData + "RETECH_SALT_2027!"));

                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("X2"));
                }
                
                string hash = builder.ToString();
                
                // Format as 30 characters: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
                string trimmed = hash.Substring(0, 30);
                return $"{trimmed.Substring(0, 5)}-{trimmed.Substring(5, 5)}-{trimmed.Substring(10, 5)}-{trimmed.Substring(15, 5)}-{trimmed.Substring(20, 5)}-{trimmed.Substring(25, 5)}";
            }
        }
    }
}

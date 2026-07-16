using System;
using System.Windows.Forms;

namespace PrinterService
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();
            Application.Run(new PrinterForm());
        }
    }
}

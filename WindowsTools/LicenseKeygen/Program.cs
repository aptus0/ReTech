using System;
using System.Windows.Forms;
using DevExpress.Skins;
using DevExpress.UserSkins;

namespace LicenseKeygen
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();
            // Setup DevExpress Skin
            SkinManager.EnableFormSkins();
            BonusSkins.Register();
            Application.Run(new KeygenForm());
        }
    }
}

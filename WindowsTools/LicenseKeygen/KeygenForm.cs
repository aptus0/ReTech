using System;
using System.Security.Cryptography;
using System.Text;
using DevExpress.XtraEditors;

namespace LicenseKeygen
{
    public partial class KeygenForm : XtraForm
    {
        public KeygenForm()
        {
            InitializeComponent();
        }

        private void btnGenerate_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtHardwareId.Text))
            {
                XtraMessageBox.Show("Please enter a Hardware ID.", "Error", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
                return;
            }

            string licenseKey = GenerateLicenseKey(txtHardwareId.Text, txtCustomerName.Text, dateExpire.DateTime);
            txtLicenseKey.Text = licenseKey;
        }

        private string GenerateLicenseKey(string hardwareId, string customer, DateTime expirationDate)
        {
            string rawData = $"{hardwareId}|{customer}|{expirationDate:yyyy-MM-dd}|EnvanzoSecretKey2027";
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("X2"));
                }
                
                // Format as a typical license key: XXXX-XXXX-XXXX-XXXX
                string hashString = builder.ToString();
                return $"{hashString.Substring(0, 4)}-{hashString.Substring(4, 4)}-{hashString.Substring(8, 4)}-{hashString.Substring(12, 4)}";
            }
        }
    }
}

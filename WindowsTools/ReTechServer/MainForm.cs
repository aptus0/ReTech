using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace EnvanzoServer
{
    public partial class MainForm : Form
    {
        private Process phpProcess;
        private Process nodeProcess;

        public MainForm()
        {
            InitializeComponent();
        }

        private void btnStart_Click(object sender, EventArgs e)
        {
            try
            {
                string projectPath = Path.GetFullPath(Path.Combine(Application.StartupPath, "..\\..\\..\\..\\")); 
                // Adjust projectPath depending on where the exe is located relative to the laravel root.
                // Normally you would place the exe in the root or read from config.

                // Start PHP Artisan
                phpProcess = new Process();
                phpProcess.StartInfo.FileName = "cmd.exe";
                phpProcess.StartInfo.Arguments = "/c php artisan serve --host=0.0.0.0 --port=8000";
                phpProcess.StartInfo.WorkingDirectory = projectPath;
                phpProcess.StartInfo.CreateNoWindow = true;
                phpProcess.StartInfo.UseShellExecute = false;
                phpProcess.Start();

                // Start Vite (NPM)
                nodeProcess = new Process();
                nodeProcess.StartInfo.FileName = "cmd.exe";
                nodeProcess.StartInfo.Arguments = "/c npm run dev -- --host=0.0.0.0";
                nodeProcess.StartInfo.WorkingDirectory = projectPath;
                nodeProcess.StartInfo.CreateNoWindow = true;
                nodeProcess.StartInfo.UseShellExecute = false;
                nodeProcess.Start();

                lblStatus.Text = "Status: Running on 0.0.0.0:8000";
                lblStatus.ForeColor = System.Drawing.Color.Green;
                btnStart.Enabled = false;
                btnStop.Enabled = true;
                
                MessageBox.Show("Server started on 0.0.0.0:8000. You can now access it from other computers.", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error starting server: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void btnStop_Click(object sender, EventArgs e)
        {
            StopServices();
            lblStatus.Text = "Status: Stopped";
            lblStatus.ForeColor = System.Drawing.Color.Red;
            btnStart.Enabled = true;
            btnStop.Enabled = false;
        }

        private void StopServices()
        {
            if (phpProcess != null && !phpProcess.HasExited)
            {
                phpProcess.Kill();
                phpProcess.Dispose();
            }
            if (nodeProcess != null && !nodeProcess.HasExited)
            {
                nodeProcess.Kill();
                nodeProcess.Dispose();
            }
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            StopServices();
        }
    }
}

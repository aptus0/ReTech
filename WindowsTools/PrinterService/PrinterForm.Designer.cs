namespace PrinterService
{
    partial class PrinterForm
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            this.lstPrinters = new System.Windows.Forms.ListBox();
            this.lblPrinters = new System.Windows.Forms.Label();
            this.btnRefresh = new System.Windows.Forms.Button();
            this.txtLog = new System.Windows.Forms.RichTextBox();
            this.lblLog = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // lstPrinters
            // 
            this.lstPrinters.FormattingEnabled = true;
            this.lstPrinters.ItemHeight = 15;
            this.lstPrinters.Location = new System.Drawing.Point(12, 34);
            this.lstPrinters.Name = "lstPrinters";
            this.lstPrinters.Size = new System.Drawing.Size(264, 304);
            this.lstPrinters.TabIndex = 0;
            // 
            // lblPrinters
            // 
            this.lblPrinters.AutoSize = true;
            this.lblPrinters.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point);
            this.lblPrinters.Location = new System.Drawing.Point(12, 13);
            this.lblPrinters.Name = "lblPrinters";
            this.lblPrinters.Size = new System.Drawing.Size(103, 15);
            this.lblPrinters.TabIndex = 1;
            this.lblPrinters.Text = "Installed Printers";
            // 
            // btnRefresh
            // 
            this.btnRefresh.Location = new System.Drawing.Point(201, 9);
            this.btnRefresh.Name = "btnRefresh";
            this.btnRefresh.Size = new System.Drawing.Size(75, 23);
            this.btnRefresh.TabIndex = 2;
            this.btnRefresh.Text = "Refresh";
            this.btnRefresh.UseVisualStyleBackColor = true;
            this.btnRefresh.Click += new System.EventHandler(this.btnRefresh_Click);
            // 
            // txtLog
            // 
            this.txtLog.Location = new System.Drawing.Point(292, 34);
            this.txtLog.Name = "txtLog";
            this.txtLog.ReadOnly = true;
            this.txtLog.Size = new System.Drawing.Size(418, 304);
            this.txtLog.TabIndex = 3;
            this.txtLog.Text = "";
            // 
            // lblLog
            // 
            this.lblLog.AutoSize = true;
            this.lblLog.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point);
            this.lblLog.Location = new System.Drawing.Point(292, 13);
            this.lblLog.Name = "lblLog";
            this.lblLog.Size = new System.Drawing.Size(130, 15);
            this.lblLog.TabIndex = 4;
            this.lblLog.Text = "Socket & Laravel Server Log";
            // 
            // PrinterForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(722, 350);
            this.Controls.Add(this.lblLog);
            this.Controls.Add(this.txtLog);
            this.Controls.Add(this.btnRefresh);
            this.Controls.Add(this.lblPrinters);
            this.Controls.Add(this.lstPrinters);
            this.Name = "PrinterForm";
            this.Text = "Envanzo Printer Service";
            this.Load += new System.EventHandler(this.PrinterForm_Load);
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.PrinterForm_FormClosing);
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        private System.Windows.Forms.ListBox lstPrinters;
        private System.Windows.Forms.Label lblPrinters;
        private System.Windows.Forms.Button btnRefresh;
        private System.Windows.Forms.RichTextBox txtLog;
        private System.Windows.Forms.Label lblLog;
    }
}

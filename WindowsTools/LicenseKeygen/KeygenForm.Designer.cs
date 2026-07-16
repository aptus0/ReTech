namespace LicenseKeygen
{
    partial class KeygenForm
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
            this.txtHardwareId = new DevExpress.XtraEditors.TextEdit();
            this.txtCustomerName = new DevExpress.XtraEditors.TextEdit();
            this.dateExpire = new DevExpress.XtraEditors.DateEdit();
            this.txtLicenseKey = new DevExpress.XtraEditors.TextEdit();
            this.btnGenerate = new DevExpress.XtraEditors.SimpleButton();
            this.lblHardwareId = new DevExpress.XtraEditors.LabelControl();
            this.lblCustomer = new DevExpress.XtraEditors.LabelControl();
            this.lblExpire = new DevExpress.XtraEditors.LabelControl();
            this.lblLicense = new DevExpress.XtraEditors.LabelControl();
            ((System.ComponentModel.ISupportInitialize)(this.txtHardwareId.Properties)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.txtCustomerName.Properties)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dateExpire.Properties)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dateExpire.Properties.CalendarTimeProperties)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.txtLicenseKey.Properties)).BeginInit();
            this.SuspendLayout();
            // 
            // txtHardwareId
            // 
            this.txtHardwareId.Location = new System.Drawing.Point(135, 23);
            this.txtHardwareId.Name = "txtHardwareId";
            this.txtHardwareId.Size = new System.Drawing.Size(223, 20);
            this.txtHardwareId.TabIndex = 0;
            // 
            // txtCustomerName
            // 
            this.txtCustomerName.Location = new System.Drawing.Point(135, 59);
            this.txtCustomerName.Name = "txtCustomerName";
            this.txtCustomerName.Size = new System.Drawing.Size(223, 20);
            this.txtCustomerName.TabIndex = 1;
            // 
            // dateExpire
            // 
            this.dateExpire.EditValue = null;
            this.dateExpire.Location = new System.Drawing.Point(135, 95);
            this.dateExpire.Name = "dateExpire";
            this.dateExpire.Properties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.dateExpire.Properties.CalendarTimeProperties.Buttons.AddRange(new DevExpress.XtraEditors.Controls.EditorButton[] {
            new DevExpress.XtraEditors.Controls.EditorButton(DevExpress.XtraEditors.Controls.ButtonPredefines.Combo)});
            this.dateExpire.Size = new System.Drawing.Size(223, 20);
            this.dateExpire.TabIndex = 2;
            // 
            // txtLicenseKey
            // 
            this.txtLicenseKey.Location = new System.Drawing.Point(135, 185);
            this.txtLicenseKey.Name = "txtLicenseKey";
            this.txtLicenseKey.Properties.ReadOnly = true;
            this.txtLicenseKey.Size = new System.Drawing.Size(223, 20);
            this.txtLicenseKey.TabIndex = 4;
            // 
            // btnGenerate
            // 
            this.btnGenerate.Location = new System.Drawing.Point(135, 137);
            this.btnGenerate.Name = "btnGenerate";
            this.btnGenerate.Size = new System.Drawing.Size(223, 30);
            this.btnGenerate.TabIndex = 3;
            this.btnGenerate.Text = "Generate License";
            this.btnGenerate.Click += new System.EventHandler(this.btnGenerate_Click);
            // 
            // lblHardwareId
            // 
            this.lblHardwareId.Location = new System.Drawing.Point(23, 26);
            this.lblHardwareId.Name = "lblHardwareId";
            this.lblHardwareId.Size = new System.Drawing.Size(63, 13);
            this.lblHardwareId.TabIndex = 5;
            this.lblHardwareId.Text = "Hardware ID:";
            // 
            // lblCustomer
            // 
            this.lblCustomer.Location = new System.Drawing.Point(23, 62);
            this.lblCustomer.Name = "lblCustomer";
            this.lblCustomer.Size = new System.Drawing.Size(80, 13);
            this.lblCustomer.TabIndex = 6;
            this.lblCustomer.Text = "Customer Name:";
            // 
            // lblExpire
            // 
            this.lblExpire.Location = new System.Drawing.Point(23, 98);
            this.lblExpire.Name = "lblExpire";
            this.lblExpire.Size = new System.Drawing.Size(77, 13);
            this.lblExpire.TabIndex = 7;
            this.lblExpire.Text = "Expiration Date:";
            // 
            // lblLicense
            // 
            this.lblLicense.Appearance.Font = new System.Drawing.Font("Tahoma", 8.25F, System.Drawing.FontStyle.Bold);
            this.lblLicense.Appearance.Options.UseFont = true;
            this.lblLicense.Location = new System.Drawing.Point(23, 188);
            this.lblLicense.Name = "lblLicense";
            this.lblLicense.Size = new System.Drawing.Size(68, 13);
            this.lblLicense.TabIndex = 8;
            this.lblLicense.Text = "License Key:";
            // 
            // KeygenForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(400, 240);
            this.Controls.Add(this.lblLicense);
            this.Controls.Add(this.lblExpire);
            this.Controls.Add(this.lblCustomer);
            this.Controls.Add(this.lblHardwareId);
            this.Controls.Add(this.btnGenerate);
            this.Controls.Add(this.txtLicenseKey);
            this.Controls.Add(this.dateExpire);
            this.Controls.Add(this.txtCustomerName);
            this.Controls.Add(this.txtHardwareId);
            this.Name = "KeygenForm";
            this.Text = "Envanzo License Keygen";
            ((System.ComponentModel.ISupportInitialize)(this.txtHardwareId.Properties)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.txtCustomerName.Properties)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dateExpire.Properties.CalendarTimeProperties)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dateExpire.Properties)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.txtLicenseKey.Properties)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        private DevExpress.XtraEditors.TextEdit txtHardwareId;
        private DevExpress.XtraEditors.TextEdit txtCustomerName;
        private DevExpress.XtraEditors.DateEdit dateExpire;
        private DevExpress.XtraEditors.TextEdit txtLicenseKey;
        private DevExpress.XtraEditors.SimpleButton btnGenerate;
        private DevExpress.XtraEditors.LabelControl lblHardwareId;
        private DevExpress.XtraEditors.LabelControl lblCustomer;
        private DevExpress.XtraEditors.LabelControl lblExpire;
        private DevExpress.XtraEditors.LabelControl lblLicense;
    }
}

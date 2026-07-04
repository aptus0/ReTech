//
//  ServerSettingsView.swift
//  ReTech
//

import SwiftUI

struct ServerSettingsView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var inputURL   = ""
    @State private var inputToken = ""
    @State private var port       = "80"

    @State private var isTesting       = false
    @State private var testResult      = ""
    @State private var isSuccess       = false
    @State private var isShowingScanner = false

    @FocusState private var focus: Field?
    enum Field { case url, port, token }

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Ayarlar")
                                .font(.system(size: 26, weight: .bold))
                                .foregroundColor(DS.textPrimary)
                            Text("Sunucu bağlantısını yapılandırın")
                                .font(.system(size: 13))
                                .foregroundColor(DS.textSecondary)
                        }
                        Spacer()
                        ZStack {
                            Circle().fill(DS.primary.opacity(0.14)).frame(width: 44, height: 44)
                            Image(systemName: "gearshape.fill")
                                .font(.system(size: 18))
                                .foregroundColor(DS.primary)
                        }
                    }
                    .padding(.top, 8)

                    // QR Quick Connect
                    Button {
                        isShowingScanner = true
                    } label: {
                        HStack(spacing: 14) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(DS.primary.opacity(0.15))
                                    .frame(width: 46, height: 46)
                                Image(systemName: "qrcode.viewfinder")
                                    .font(.system(size: 22))
                                    .foregroundColor(DS.primary)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text("QR Kod ile Hızlı Bağlan")
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(DS.textPrimary)
                                Text("Önerilen yöntem")
                                    .font(.system(size: 12))
                                    .foregroundColor(DS.textSecondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(DS.textTertiary)
                        }
                        .padding(16)
                        .background(
                            LinearGradient(
                                colors: [DS.primary.opacity(0.18), DS.secondary.opacity(0.10)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(DS.primary.opacity(0.25), lineWidth: 1))
                        .cornerRadius(16)
                    }

                    // Manual Config Section
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Manuel Yapılandırma")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(DS.textSecondary)

                        settingsField(
                            label: "Sunucu URL",
                            icon: "network",
                            placeholder: "http://192.168.1.50",
                            text: $inputURL,
                            field: .url,
                            keyboard: .URL
                        )

                        settingsField(
                            label: "Port",
                            icon: "number",
                            placeholder: "80",
                            text: $port,
                            field: .port,
                            keyboard: .numberPad
                        )

                        // Token (secure)
                        VStack(alignment: .leading, spacing: 8) {
                            Text("API Token")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(DS.textSecondary)
                            HStack(spacing: 12) {
                                Image(systemName: "key")
                                    .foregroundColor(focus == .token ? DS.primary : DS.textTertiary)
                                    .font(.system(size: 16)).frame(width: 22)
                                SecureField("",
                                            text: $inputToken,
                                            prompt: Text("••••••••••••").foregroundColor(DS.textTertiary))
                                    .foregroundColor(DS.textPrimary)
                                    .autocorrectionDisabled()
                                    .textInputAutocapitalization(.never)
                                    .focused($focus, equals: .token)
                            }
                            .darkField(focused: focus == .token)
                        }
                    }
                    .padding(18)
                    .glassCard()

                    // Test button
                    Button(action: testConnection) {
                        if isTesting {
                            HStack(spacing: 10) {
                                ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .white)).scaleEffect(0.9)
                                Text("Test Ediliyor...")
                            }
                        } else {
                            HStack(spacing: 8) {
                                Image(systemName: "wifi")
                                Text("Bağlantıyı Test Et")
                            }
                        }
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(isTesting || inputURL.isEmpty)
                    .opacity(inputURL.isEmpty ? 0.5 : 1)

                    // Test result
                    if !testResult.isEmpty {
                        StatusBanner(message: testResult, isSuccess: isSuccess)
                    }

                    // Save button
                    Button(action: saveSettings) {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Kaydet ve Devam Et")
                        }
                    }
                    .font(.system(size: 16, weight: .semibold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        isSuccess
                            ? DS.successGradient
                            : LinearGradient(colors: [Color.white.opacity(0.07)], startPoint: .leading, endPoint: .trailing)
                    )
                    .foregroundColor(isSuccess ? .white : DS.textTertiary)
                    .cornerRadius(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(isSuccess ? Color.clear : DS.border, lineWidth: 1)
                    )
                    .disabled(!isSuccess)

                    // Support Log
                    NavigationLink(destination: SupportLogView()) {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(Color(hex: "475569").opacity(0.20))
                                    .frame(width: 38, height: 38)
                                Image(systemName: "terminal.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(Color(hex: "94A3B8"))
                            }
                            Text("Destek & Log Kayıtları")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(DS.textSecondary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 13))
                                .foregroundColor(DS.textTertiary)
                        }
                        .padding(14)
                        .glassCard(cornerRadius: 14)
                    }

                    Spacer(minLength: 90)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            if !serverURL.isEmpty { inputURL = serverURL }
            if !authToken.isEmpty { inputToken = authToken }
        }
        .sheet(isPresented: $isShowingScanner) {
            ScannerView { code in
                isShowingScanner = false
                handleQRCode(code: code)
            }
            .ignoresSafeArea()
        }
    }

    // MARK: Field Builder
    private func settingsField(label: String, icon: String, placeholder: String,
                               text: Binding<String>, field: Field, keyboard: UIKeyboardType) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(DS.textSecondary)
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(focus == field ? DS.primary : DS.textTertiary)
                    .font(.system(size: 16)).frame(width: 22)
                TextField("",
                          text: text,
                          prompt: Text(placeholder).foregroundColor(DS.textTertiary))
                    .foregroundColor(DS.textPrimary)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .keyboardType(keyboard)
                    .focused($focus, equals: field)
            }
            .darkField(focused: focus == field)
        }
    }

    // MARK: Actions
    private func handleQRCode(code: String) {
        guard let data = code.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: String],
              let ip = json["ip"] ?? json["url"] ?? json["serverURL"] else {
            testResult = "Geçersiz QR formatı."; isSuccess = false; return
        }
        inputURL = ip
        isTesting = true
        let urlWithPort = ServerSettings.normalizedBaseURL(inputURL, port: port)
        ServerConnectionService.shared.testConnection(url: urlWithPort) { result in
            isTesting = false
            switch result {
            case .success(let response) where response.success:
                isSuccess = true
                serverURL = urlWithPort
                if let token = json["token"] { authToken = token; inputToken = token }
                testResult = "QR ile bağlantı başarılı ✓ Kaydedildi."
            case .success:
                isSuccess = false; testResult = "Bağlantı başarılı ama API yanıtı hatalı."
            case .failure(let e):
                isSuccess = false; testResult = "Bağlanamadı: \(e.localizedDescription)"
            }
        }
    }

    private func testConnection() {
        guard !inputURL.isEmpty else { return }
        isTesting = true; testResult = ""; isSuccess = false
        let urlWithPort = ServerSettings.normalizedBaseURL(inputURL, port: port)
        ServerConnectionService.shared.testConnection(url: urlWithPort) { result in
            isTesting = false
            switch result {
            case .success(let r) where r.success:
                isSuccess = true; testResult = "Re Tech API aktif ve erişilebilir ✓"
            case .success:
                isSuccess = false; testResult = "Bağlantı var ama API yanıtı hatalı."
            case .failure(let e):
                isSuccess = false; testResult = "Bağlanamadı. Aynı Wi-Fi'deyseniz tekrar deneyin.\n\(e.localizedDescription)"
            }
        }
    }

    private func saveSettings() {
        let urlWithPort = ServerSettings.normalizedBaseURL(inputURL, port: port)
        serverURL = urlWithPort
        authToken = inputToken
        testResult = "Ayarlar kaydedildi ✓ Ana Sayfaya dönebilirsiniz."
    }
}

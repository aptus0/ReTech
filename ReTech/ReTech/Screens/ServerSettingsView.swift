import SwiftUI

struct ServerSettingsView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""
    
    @State private var inputURL: String = ""
    @State private var inputToken: String = ""
    @State private var port: String = "80"
    
    @State private var isTesting = false
    @State private var testResult: String = ""
    @State private var isSuccess = false
    @State private var isShowingScanner = false
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Hızlı Kurulum")) {
                    Button(action: {
                        isShowingScanner = true
                    }) {
                        HStack {
                            Image(systemName: "qrcode.viewfinder")
                            Text("QR Kod ile Bağlan (Önerilen)")
                        }
                        .foregroundColor(.blue)
                    }
                }

                Section(header: Text("Server Bağlantısı")) {
                    TextField("Server URL (Örn: http://192.168.1.50)", text: $inputURL)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    TextField("Port", text: $port)
                        .keyboardType(.numberPad)
                        
                    SecureField("API Token (Zorunlu)", text: $inputToken)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                }
                
                Section {
                    Button(action: testConnection) {
                        if isTesting {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                        } else {
                            Text("Bağlantıyı Test Et")
                        }
                    }
                    .disabled(isTesting || inputURL.isEmpty)
                    
                    if !testResult.isEmpty {
                        Text(testResult)
                            .foregroundColor(isSuccess ? .green : .red)
                            .font(.footnote)
                    }
                }
                
                Section {
                    Button(action: saveSettings) {
                        Text("Kaydet ve Devam Et")
                            .frame(maxWidth: .infinity, alignment: .center)
                            .foregroundColor(.white)
                            .padding()
                            .background(isSuccess ? Color.blue : Color.gray)
                            .cornerRadius(8)
                    }
                    .disabled(!isSuccess)
                }
                
                Section(header: Text("Sistem")) {
                    NavigationLink(destination: SupportLogView()) {
                        HStack {
                            Image(systemName: "terminal")
                            Text("Destek Kayıtları (Log)")
                        }
                        .foregroundColor(.gray)
                    }
                }
            }
            .navigationTitle("Ayarlar")
            .onAppear {
                if !serverURL.isEmpty {
                    inputURL = serverURL
                }
                if !authToken.isEmpty {
                    inputToken = authToken
                }
            }
            .sheet(isPresented: $isShowingScanner) {
                ScannerView { code in
                    isShowingScanner = false
                    handleQRCode(code: code)
                }
                .edgesIgnoringSafeArea(.all)
            }
        }
    }

    private func handleQRCode(code: String) {
        do {
            if let data = code.data(using: .utf8),
               let json = try JSONSerialization.jsonObject(with: data) as? [String: String],
               let ip = json["ip"] ?? json["url"] ?? json["serverURL"] {
                inputURL = ip
                
                isTesting = true
                let urlWithPort = ServerSettings.normalizedBaseURL(inputURL, port: port)
                
                ServerConnectionService.shared.testConnection(url: urlWithPort) { result in
                    isTesting = false
                    switch result {
                    case .success(let response):
                        if response.success {
                            isSuccess = true
                            testResult = "Bağlantı ve Token başarıyla doğrulandı!"
                            
                            // Automatically save
                            serverURL = urlWithPort
                            if let token = json["token"] {
                                authToken = token
                            }
                            
                            // Notify user instead of switching tab
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                testResult = "Kaydedildi. Alt menüden Ana Sayfaya dönebilirsiniz."
                            }
                        } else {
                            isSuccess = false
                            testResult = "Bağlantı başarılı ama API yanıtı hatalı."
                        }
                    case .failure(let error):
                        isSuccess = false
                        testResult = "Server'a ulaşılamadı. Aynı Wi-Fi ağına bağlı olduğunuzdan emin olun.\n\(error.localizedDescription)"
                    }
                }
            }
        } catch {
            testResult = "Geçersiz QR formatı."
        }
    }
    
    private func testConnection() {
        guard !inputURL.isEmpty else { return }
        isTesting = true
        testResult = ""
        isSuccess = false
        
        let urlWithPort = ServerSettings.normalizedBaseURL(inputURL, port: port)
        
        ServerConnectionService.shared.testConnection(url: urlWithPort) { result in
            isTesting = false
            switch result {
            case .success(let response):
                if response.success {
                    isSuccess = true
                    testResult = "Server bulundu. Re Tech API aktif."
                } else {
                    isSuccess = false
                    testResult = "Bağlantı başarılı ama API yanıtı hatalı."
                }
            case .failure(let error):
                isSuccess = false
                testResult = "Server'a ulaşılamadı. Aynı Wi-Fi ağına bağlı olduğunuzdan emin olun.\n\(error.localizedDescription)"
            }
        }
    }
    
    private func saveSettings() {
        let urlWithPort = ServerSettings.normalizedBaseURL(inputURL, port: port)
        serverURL = urlWithPort
        authToken = inputToken
        testResult = "Kaydedildi! Alt menüden Ana Sayfaya geçebilirsiniz."
    }
}

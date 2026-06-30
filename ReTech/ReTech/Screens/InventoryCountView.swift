import SwiftUI

struct InventoryCountView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""
    
    @State private var isScanning = true
    @State private var barcode: String = ""
    @State private var product: ProductInfo?
    
    @State private var countedQuantity: String = ""
    
    @State private var isLoading = false
    @State private var isSaving = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    
    var body: some View {
        ZStack {
            if isScanning {
                ScannerView { code in
                    barcode = code
                    isScanning = false
                    fetchProduct(code)
                }
                .edgesIgnoringSafeArea(.all)
                
                VStack {
                    Spacer()
                    Text("Sayılan Ürünü Okutun")
                        .font(.headline)
                        .padding()
                        .background(Color.black.opacity(0.7))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .padding(.bottom, 40)
                }
            } else if isLoading {
                ProgressView("Ürün Bilgisi Çekiliyor...")
                    .scaleEffect(1.5)
            } else if let prod = product {
                Form {
                    Section(header: Text("Ürün Bilgileri")) {
                        HStack {
                            Text("Adı")
                            Spacer()
                            Text(prod.name).bold()
                        }
                        HStack {
                            Text("Barkod")
                            Spacer()
                            Text(prod.barcode ?? prod.code ?? "").foregroundColor(.gray)
                        }
                        HStack {
                            Text("Sistemdeki Stok")
                            Spacer()
                            Text("\(prod.current_stock ?? 0)")
                                .foregroundColor(.blue)
                                .bold()
                        }
                    }
                    
                    Section(header: Text("Fiili (Sayılan) Stok")) {
                        TextField("Sayılan Miktar", text: $countedQuantity)
                            .keyboardType(.numberPad)
                            .font(.title2)
                    }
                    
                    Section {
                        Button(action: saveCount) {
                            if isSaving {
                                ProgressView()
                                    .frame(maxWidth: .infinity)
                            } else {
                                Text("Sayımı Kaydet")
                                    .frame(maxWidth: .infinity, alignment: .center)
                                    .foregroundColor(.white)
                                    .padding()
                                    .background(countedQuantity.isEmpty ? Color.gray : Color.orange)
                                    .cornerRadius(8)
                            }
                        }
                        .disabled(countedQuantity.isEmpty || isSaving)
                    }
                    .listRowBackground(Color.clear)
                    
                    if let error = errorMessage {
                        Section {
                            Text(error).foregroundColor(.red).font(.footnote)
                        }
                    }
                    if let success = successMessage {
                        Section {
                            Text(success).foregroundColor(.green).font(.footnote)
                        }
                    }
                    
                    Section {
                        Button("Sonraki Ürüne Geç") { reset() }
                        .foregroundColor(.blue)
                        .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
            } else {
                VStack(spacing: 20) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.red)
                    Text("Ürün Bulunamadı")
                        .font(.title2)
                        .fontWeight(.bold)
                    if let err = errorMessage { Text(err).multilineTextAlignment(.center).padding() }
                    
                    Button("Tekrar Dene") { reset() }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            }
        }
        .navigationTitle("Depo / Stok Sayımı")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func reset() {
        barcode = ""
        product = nil
        countedQuantity = ""
        errorMessage = nil
        successMessage = nil
        isScanning = true
    }
    
    private func fetchProduct(_ code: String) {
        isLoading = true
        errorMessage = nil
        
        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        
        guard let url = URL(string: "\(baseURL)/api/mobile/products/inquiry/\(code)") else {
            errorMessage = "Geçersiz sunucu adresi."
            isLoading = false
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }
        
        NetworkManager.shared.session.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isLoading = false
                
                if let error = error {
                    self.errorMessage = "Bağlantı hatası: \(error.localizedDescription)"
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse, let data = data else {
                    self.errorMessage = "Geçersiz yanıt."
                    return
                }
                
                if httpResponse.statusCode == 200 {
                    do {
                        let result = try JSONDecoder().decode(ProductInfo.self, from: data)
                        self.product = result
                        // Default count value to current stock to make it easier to adjust
                        self.countedQuantity = "\(result.current_stock ?? 0)"
                    } catch {
                        self.errorMessage = "Veri okunamadı."
                    }
                } else if httpResponse.statusCode == 404 {
                    self.errorMessage = "Ürün bulunamadı."
                } else {
                    self.errorMessage = "Sunucu hatası (\(httpResponse.statusCode))."
                }
            }
        }.resume()
    }
    
    private func saveCount() {
        guard let quantity = Int(countedQuantity), quantity >= 0 else {
            errorMessage = "Geçerli bir miktar girin."
            return
        }
        
        isSaving = true
        errorMessage = nil
        successMessage = nil
        
        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        
        guard let url = URL(string: "\(baseURL)/api/mobile/inventory-count") else {
            errorMessage = "Geçersiz sunucu adresi."
            isSaving = false
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }
        
        let body: [String: Any] = ["barcode": barcode, "counted_quantity": quantity]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        NetworkManager.shared.session.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isSaving = false
                
                if let error = error {
                    self.errorMessage = "Bağlantı hatası: \(error.localizedDescription)"
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    self.errorMessage = "Geçersiz yanıt."
                    return
                }
                
                if httpResponse.statusCode == 200 {
                    self.successMessage = "Sayım başarıyla kaydedildi!"
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        self.reset()
                    }
                } else {
                    self.errorMessage = "Sunucu hatası (\(httpResponse.statusCode))."
                }
            }
        }.resume()
    }
}

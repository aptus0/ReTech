import SwiftUI
import UserNotifications

struct ProductResponse: Codable {
    let message: String
    let product: ProductInfo?
}

struct ProductInfo: Codable {
    let id: Int
    let name: String
    let barcode: String?
    let code: String?
    let sale_price: Double
    let current_stock: Int?
    let stock_quantity: Int?

    enum CodingKeys: String, CodingKey {
        case id, name, barcode, code, sale_price, current_stock, stock_quantity
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        barcode = try container.decodeIfPresent(String.self, forKey: .barcode)
        code = try container.decodeIfPresent(String.self, forKey: .code)
        current_stock = try container.decodeIfPresent(Int.self, forKey: .current_stock)
        stock_quantity = try container.decodeIfPresent(Int.self, forKey: .stock_quantity)

        if let priceDouble = try? container.decode(Double.self, forKey: .sale_price) {
            sale_price = priceDouble
        } else if let priceString = try? container.decode(String.self, forKey: .sale_price), let priceDouble = Double(priceString) {
            sale_price = priceDouble
        } else {
            sale_price = 0.0
        }
    }
}

struct PrintQueueScannerView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""
    
    @State private var isScanning = true
    @State private var scannedProduct: ProductInfo?
    @State private var errorMessage: String?
    @State private var showResult = false
    
    var body: some View {
        ZStack {
            if isScanning {
                ScannerView { code in
                    isScanning = false
                    addToQueue(barcode: code)
                }
                .edgesIgnoringSafeArea(.all)
                .onAppear {
                    requestNotificationPermission()
                }
                
                VStack {
                    Spacer()
                    Text("Barkodu Okutun")
                        .font(.headline)
                        .padding()
                        .background(Color.black.opacity(0.7))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .padding(.bottom, 40)
                }
            } else {
                VStack(spacing: 20) {
                    if let product = scannedProduct {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.green)
                        
                        Text("Kuyruğa Eklendi!")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        VStack(alignment: .leading, spacing: 10) {
                            Text(product.name)
                                .font(.headline)
                            HStack {
                                Text("Fiyat:")
                                Spacer()
                                Text(String(format: "%.2f TL", product.sale_price))
                                    .fontWeight(.bold)
                            }
                            HStack {
                                Text("Stok:")
                                Spacer()
                                Text("\(product.current_stock ?? product.stock_quantity ?? 0) Adet")
                                    .fontWeight(.bold)
                            }
                        }
                        .padding()
                        .background(Color(UIColor.secondarySystemBackground))
                        .cornerRadius(12)
                        .padding(.horizontal, 30)
                    } else if let error = errorMessage {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.red)
                        Text("Hata")
                            .font(.title)
                            .fontWeight(.bold)
                        Text(error)
                            .multilineTextAlignment(.center)
                            .padding()
                    } else {
                        ProgressView("İşleniyor...")
                    }
                    
                    Button(action: {
                        scannedProduct = nil
                        errorMessage = nil
                        isScanning = true
                    }) {
                        Text("Yeni Barkod Okut")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                            .padding(.horizontal, 30)
                    }
                    .padding(.top, 20)
                }
            }
        }
        .navigationTitle("Hızlı Barkod Çıkart")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                print("Bildirim izni verildi")
            }
        }
    }
    
    private func sendNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }

    private func addToQueue(barcode: String) {
        var baseURL = serverURL
        if !baseURL.hasPrefix("http") {
            baseURL = "http://" + baseURL
        }
        
        guard let url = URL(string: "\(baseURL)/api/mobile/print-queue/add") else {
            errorMessage = "Geçersiz sunucu adresi: \(baseURL)"
            sendNotification(title: "Hata", body: "Geçersiz sunucu adresi. URL: \(baseURL)")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }
        
        let body: [String: Any] = ["barcode": barcode]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        NetworkManager.shared.session.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    self.errorMessage = "Bağlantı hatası: \(error.localizedDescription)"
                    self.sendNotification(title: "Bağlantı Hatası", body: error.localizedDescription)
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse, let data = data else {
                    self.errorMessage = "Geçersiz yanıt."
                    self.sendNotification(title: "Hata", body: "Sunucudan geçersiz yanıt alındı.")
                    return
                }
                
                if httpResponse.statusCode == 200 {
                    do {
                        let result = try JSONDecoder().decode(ProductResponse.self, from: data)
                        self.scannedProduct = result.product
                        
                        if let prod = result.product {
                            self.sendNotification(title: "Kuyruğa Eklendi ✅", body: "\(prod.name) | Fiyat: \(prod.sale_price) TL | Stok: \(prod.current_stock ?? prod.stock_quantity ?? 0)")
                        }
                    } catch {
                        self.errorMessage = "Veri okunamadı."
                        self.sendNotification(title: "Veri Hatası", body: "Ürün bilgileri çözümlenemedi.")
                    }
                } else {
                    if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                       let msg = errorJson["message"] as? String {
                        self.errorMessage = msg
                        self.sendNotification(title: "İşlem Başarısız ❌", body: "\(msg) (Kod: \(httpResponse.statusCode))")
                    } else {
                        self.errorMessage = "Ürün bulunamadı veya sunucu hatası (\(httpResponse.statusCode))."
                        self.sendNotification(title: "İşlem Başarısız ❌", body: "Hata Kodu: \(httpResponse.statusCode)")
                    }
                }
            }
        }.resume()
    }
}

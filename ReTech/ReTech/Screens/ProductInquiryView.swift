import SwiftUI

struct ProductInquiryView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""
    
    @State private var isScanning = true
    @State private var scannedProduct: ProductInfo?
    @State private var errorMessage: String?
    
    var body: some View {
        ZStack {
            if isScanning {
                ScannerView { code in
                    isScanning = false
                    inquireProduct(barcode: code)
                }
                .edgesIgnoringSafeArea(.all)
                
                VStack {
                    Spacer()
                    Text("Ürün Barkodunu Okutun")
                        .font(.headline)
                        .padding()
                        .background(Color.black.opacity(0.7))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .padding(.bottom, 40)
                }
            } else {
                ScrollView {
                    VStack(spacing: 20) {
                        if let product = scannedProduct {
                            Image(systemName: "magnifyingglass.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.blue)
                            
                            Text("Ürün Bulundu")
                                .font(.title)
                                .fontWeight(.bold)
                            
                            VStack(alignment: .leading, spacing: 15) {
                                Text(product.name)
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                
                                Divider()
                                
                                HStack {
                                    Text("Fiyat:")
                                        .foregroundColor(.gray)
                                    Spacer()
                                    Text(String(format: "%.2f TL", product.sale_price))
                                        .font(.title3)
                                        .fontWeight(.bold)
                                        .foregroundColor(.green)
                                }
                                
                                HStack {
                                    Text("Stok Durumu:")
                                        .foregroundColor(.gray)
                                    Spacer()
                                    let stock = product.current_stock ?? product.stock_quantity ?? 0
                                    Text("\(stock) Adet")
                                        .font(.title3)
                                        .fontWeight(.bold)
                                        .foregroundColor(stock > 0 ? .primary : .red)
                                }
                                
                                if let barcode = product.barcode {
                                    HStack {
                                        Text("Barkod:")
                                            .foregroundColor(.gray)
                                        Spacer()
                                        Text(barcode)
                                            .font(.body)
                                    }
                                }
                            }
                            .padding()
                            .background(Color(UIColor.secondarySystemBackground))
                            .cornerRadius(12)
                            .padding(.horizontal, 20)
                            
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
                            ProgressView("Sorgulanıyor...")
                                .scaleEffect(1.5)
                        }
                        
                        Button(action: {
                            scannedProduct = nil
                            errorMessage = nil
                            isScanning = true
                        }) {
                            Text("Yeni Sorgu")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                                .padding(.horizontal, 20)
                        }
                        .padding(.top, 20)
                    }
                    .padding(.vertical, 40)
                }
            }
        }
        .navigationTitle("Ürün Sorgula")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func inquireProduct(barcode: String) {
        var baseURL = serverURL
        if !baseURL.hasPrefix("http") {
            baseURL = "http://" + baseURL
        }
        
        guard let url = URL(string: "\(baseURL)/api/mobile/products/inquiry/\(barcode)") else {
            errorMessage = "Geçersiz sunucu adresi."
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
                        self.scannedProduct = result
                    } catch {
                        self.errorMessage = "Veri okunamadı."
                    }
                } else if httpResponse.statusCode == 404 {
                    self.errorMessage = "Bu barkoda ait ürün bulunamadı."
                } else {
                    self.errorMessage = "Sunucu hatası (\(httpResponse.statusCode))."
                }
            }
        }.resume()
    }
}

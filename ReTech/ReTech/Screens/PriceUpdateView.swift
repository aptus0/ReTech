//
//  PriceUpdateView.swift
//  ReTech
//

import SwiftUI

struct PriceUpdateView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var isScanning    = true
    @State private var barcode       = ""
    @State private var product: ProductInfo?
    @State private var newPrice      = ""
    @State private var isLoading     = false
    @State private var isSaving      = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    @FocusState private var priceFocused: Bool

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            if isScanning {
                cameraOverlay
            } else if isLoading {
                rtLoadingView(message: "Ürün Aranıyor...")
            } else if let prod = product {
                productForm(prod)
            } else {
                rtErrorState(message: errorMessage ?? "Ürün bulunamadı.") { reset() }
            }
        }
        .navigationTitle("Fiyat Güncelle")
        .darkNavBar()
    }

    // MARK: Camera
    private var cameraOverlay: some View {
        ZStack {
            ScannerView { code in
                barcode = code
                isScanning = false
                fetchProduct(code)
            }
            .ignoresSafeArea()

            VStack {
                Spacer()
                scannerLabel("Fiyatı Güncellenecek Ürünü Okutun")
            }
        }
    }

    // MARK: Product Form
    private func productForm(_ prod: ProductInfo) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 18) {

                // Product info card
                VStack(spacing: 0) {
                    HStack(spacing: 14) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(DS.primary.opacity(0.15))
                                .frame(width: 50, height: 50)
                            Image(systemName: "tag.fill")
                                .font(.system(size: 22))
                                .foregroundColor(DS.primary)
                        }
                        VStack(alignment: .leading, spacing: 4) {
                            Text(prod.name)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                                .lineLimit(2)
                            Text(prod.barcode ?? prod.code ?? "—")
                                .font(.system(size: 12))
                                .foregroundColor(DS.textSecondary)
                        }
                        Spacer()
                    }
                    .padding(.bottom, 14)

                    Divider().background(DS.border).padding(.bottom, 14)

                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Mevcut Fiyat")
                                .font(.system(size: 11))
                                .foregroundColor(DS.textSecondary)
                            Text(String(format: "%.2f ₺", prod.sale_price))
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(.white)
                                .strikethrough(true, color: DS.error.opacity(0.7))
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Sistemdeki Stok")
                                .font(.system(size: 11))
                                .foregroundColor(DS.textSecondary)
                            Text("\(prod.current_stock ?? prod.stock_quantity ?? 0) Adet")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(DS.success)
                        }
                    }
                }
                .padding(18)
                .glassCard()

                // New price input
                VStack(alignment: .leading, spacing: 10) {
                    Text("Yeni Satış Fiyatı")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(DS.textSecondary)

                    HStack(spacing: 14) {
                        Image(systemName: "turkishlirasign")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(priceFocused ? DS.success : DS.textTertiary)
                        TextField("",
                                  text: $newPrice,
                                  prompt: Text("0.00").foregroundColor(DS.textTertiary))
                            .keyboardType(.decimalPad)
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(DS.success)
                            .focused($priceFocused)
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 16)
                    .background(DS.surface2)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(priceFocused ? DS.success.opacity(0.55) : DS.border, lineWidth: 1)
                    )
                    .cornerRadius(16)
                }

                // Feedback banners
                if let err = errorMessage   { StatusBanner(message: err,     isSuccess: false) }
                if let suc = successMessage { StatusBanner(message: suc,     isSuccess: true) }

                // Save button
                Button(action: savePrice) {
                    if isSaving {
                        HStack(spacing: 10) {
                            ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .white)).scaleEffect(0.9)
                            Text("Kaydediliyor...")
                        }
                    } else {
                        Text("Fiyatı Güncelle")
                    }
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(newPrice.isEmpty || isSaving)
                .opacity(newPrice.isEmpty ? 0.5 : 1)

                Button("Vazgeç / Yeni Ürün Tara") { reset() }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(DS.textSecondary)

                Spacer(minLength: 80)
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
        }
    }

    // MARK: Networking
    private func reset() {
        barcode = ""; product = nil; newPrice = ""
        errorMessage = nil; successMessage = nil
        isScanning = true
    }

    private func fetchProduct(_ code: String) {
        isLoading = true; errorMessage = nil
        var base = serverURL
        if !base.hasPrefix("http") { base = "http://" + base }
        guard let url = URL(string: "\(base)/api/mobile/products/inquiry/\(code)") else {
            errorMessage = "Geçersiz sunucu adresi."; isLoading = false; return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty { req.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization") }
        NetworkManager.shared.session.dataTask(with: req) { data, resp, error in
            DispatchQueue.main.async {
                self.isLoading = false
                if let e = error { self.errorMessage = "Bağlantı hatası: \(e.localizedDescription)"; return }
                guard let http = resp as? HTTPURLResponse, let data = data else { self.errorMessage = "Geçersiz yanıt."; return }
                if http.statusCode == 200 {
                    if let r = try? JSONDecoder().decode(ProductInfo.self, from: data) { self.product = r }
                    else { self.errorMessage = "Veri okunamadı." }
                } else if http.statusCode == 404 { self.errorMessage = "Ürün bulunamadı."
                } else { self.errorMessage = "Sunucu hatası (\(http.statusCode))." }
            }
        }.resume()
    }

    private func savePrice() {
        guard let price = Double(newPrice.replacingOccurrences(of: ",", with: ".")), price >= 0 else {
            errorMessage = "Geçerli bir fiyat girin."; return
        }
        isSaving = true; errorMessage = nil; successMessage = nil
        var base = serverURL
        if !base.hasPrefix("http") { base = "http://" + base }
        guard let url = URL(string: "\(base)/api/mobile/products/\(barcode)/price") else {
            errorMessage = "Geçersiz sunucu adresi."; isSaving = false; return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty { req.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization") }
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["price": price])
        NetworkManager.shared.session.dataTask(with: req) { _, resp, error in
            DispatchQueue.main.async {
                self.isSaving = false
                if let e = error { self.errorMessage = "Bağlantı hatası: \(e.localizedDescription)"; return }
                guard let http = resp as? HTTPURLResponse else { self.errorMessage = "Geçersiz yanıt."; return }
                if http.statusCode == 200 {
                    self.successMessage = "Fiyat \(String(format: "%.2f", price)) ₺ olarak güncellendi ✓"
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) { self.reset() }
                } else {
                    self.errorMessage = "Sunucu hatası (\(http.statusCode))."
                }
            }
        }.resume()
    }
}

// MARK: - Shared Helpers (used by multiple scan views)
func scannerLabel(_ text: String) -> some View {
    Text(text)
        .font(.system(size: 14, weight: .semibold))
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.black.opacity(0.68))
        .foregroundColor(.white)
        .cornerRadius(14)
        .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
        .padding(.bottom, 64)
}

func rtLoadingView(message: String) -> some View {
    VStack(spacing: 14) {
        ProgressView()
            .progressViewStyle(CircularProgressViewStyle(tint: DS.primary))
            .scaleEffect(1.4)
        Text(message)
            .font(.system(size: 14))
            .foregroundColor(DS.textSecondary)
    }
}

func rtErrorState(message: String, onRetry: @escaping () -> Void) -> some View {
    VStack(spacing: 20) {
        ZStack {
            Circle().fill(DS.error.opacity(0.14)).frame(width: 88, height: 88)
            Image(systemName: "xmark.circle.fill").font(.system(size: 44)).foregroundColor(DS.error)
        }
        Text("Ürün Bulunamadı")
            .font(.system(size: 20, weight: .bold)).foregroundColor(.white)
        Text(message)
            .font(.system(size: 14)).foregroundColor(DS.textSecondary)
            .multilineTextAlignment(.center).padding(.horizontal, 36)
        Button("Tekrar Dene", action: onRetry)
            .buttonStyle(PrimaryButtonStyle())
            .padding(.horizontal, 48)
    }
}

//
//  InventoryCountView.swift
//  ReTech
//

import SwiftUI

struct InventoryCountView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var isScanning       = true
    @State private var barcode          = ""
    @State private var product: ProductInfo?
    @State private var countedQuantity  = ""
    @State private var isLoading        = false
    @State private var isSaving         = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    @FocusState private var qtyFocused: Bool

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            if isScanning {
                cameraOverlay
            } else if isLoading {
                rtLoadingView(message: "Ürün Bilgisi Çekiliyor...")
            } else if let prod = product {
                countForm(prod)
            } else {
                rtErrorState(message: errorMessage ?? "Ürün bulunamadı.") { reset() }
            }
        }
        .navigationTitle("Stok Sayım")
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
                scannerLabel("Sayılan Ürünü Okutun")
            }
        }
    }

    // MARK: Count Form
    private func countForm(_ prod: ProductInfo) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 18) {

                // Product info card
                VStack(spacing: 0) {
                    HStack(spacing: 14) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(hex: "059669").opacity(0.15))
                                .frame(width: 50, height: 50)
                            Image(systemName: "archivebox.fill")
                                .font(.system(size: 22))
                                .foregroundColor(Color(hex: "059669"))
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
                            Text("Sistemdeki Stok")
                                .font(.system(size: 11))
                                .foregroundColor(DS.textSecondary)
                            Text("\(prod.current_stock ?? 0) Adet")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(DS.accent)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Satış Fiyatı")
                                .font(.system(size: 11))
                                .foregroundColor(DS.textSecondary)
                            Text(String(format: "%.2f ₺", prod.sale_price))
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(DS.success)
                        }
                    }
                }
                .padding(18)
                .glassCard()

                // Counted quantity input
                VStack(alignment: .leading, spacing: 10) {
                    Text("Sayılan (Fiili) Miktar")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(DS.textSecondary)

                    HStack(spacing: 14) {
                        Image(systemName: "number")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(qtyFocused ? DS.accent : DS.textTertiary)
                        TextField("",
                                  text: $countedQuantity,
                                  prompt: Text("0").foregroundColor(DS.textTertiary))
                            .keyboardType(.numberPad)
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(DS.accent)
                            .focused($qtyFocused)
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 16)
                    .background(DS.surface2)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(qtyFocused ? DS.accent.opacity(0.55) : DS.border, lineWidth: 1)
                    )
                    .cornerRadius(16)

                    // Difference hint
                    if let counted = Int(countedQuantity) {
                        let diff = counted - (prod.current_stock ?? 0)
                        if diff != 0 {
                            HStack(spacing: 6) {
                                Image(systemName: diff > 0 ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                                    .foregroundColor(diff > 0 ? DS.success : DS.error)
                                Text("Sistemden \(abs(diff)) adet \(diff > 0 ? "fazla" : "az")")
                                    .font(.system(size: 13))
                                    .foregroundColor(diff > 0 ? DS.success : DS.error)
                            }
                            .padding(.top, 4)
                        }
                    }
                }

                // Feedback
                if let err = errorMessage   { StatusBanner(message: err, isSuccess: false) }
                if let suc = successMessage { StatusBanner(message: suc, isSuccess: true) }

                // Save button
                Button(action: saveCount) {
                    if isSaving {
                        HStack(spacing: 10) {
                            ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .white)).scaleEffect(0.9)
                            Text("Kaydediliyor...")
                        }
                    } else {
                        Text("Sayımı Kaydet")
                    }
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(countedQuantity.isEmpty || isSaving)
                .opacity(countedQuantity.isEmpty ? 0.5 : 1)

                Button("Sonraki Ürüne Geç") { reset() }
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
        barcode = ""; product = nil; countedQuantity = ""
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
                    if let r = try? JSONDecoder().decode(ProductInfo.self, from: data) {
                        self.product = r
                        self.countedQuantity = "\(r.current_stock ?? 0)"
                    } else { self.errorMessage = "Veri okunamadı." }
                } else if http.statusCode == 404 { self.errorMessage = "Ürün bulunamadı."
                } else { self.errorMessage = "Sunucu hatası (\(http.statusCode))." }
            }
        }.resume()
    }

    private func saveCount() {
        guard let qty = Int(countedQuantity), qty >= 0 else {
            errorMessage = "Geçerli bir miktar girin."; return
        }
        isSaving = true; errorMessage = nil; successMessage = nil
        var base = serverURL
        if !base.hasPrefix("http") { base = "http://" + base }
        guard let url = URL(string: "\(base)/api/mobile/inventory-count") else {
            errorMessage = "Geçersiz sunucu adresi."; isSaving = false; return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty { req.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization") }
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["barcode": barcode, "counted_quantity": qty])
        NetworkManager.shared.session.dataTask(with: req) { _, resp, error in
            DispatchQueue.main.async {
                self.isSaving = false
                if let e = error { self.errorMessage = "Bağlantı hatası: \(e.localizedDescription)"; return }
                guard let http = resp as? HTTPURLResponse else { self.errorMessage = "Geçersiz yanıt."; return }
                if http.statusCode == 200 {
                    self.successMessage = "Sayım başarıyla kaydedildi ✓"
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) { self.reset() }
                } else { self.errorMessage = "Sunucu hatası (\(http.statusCode))." }
            }
        }.resume()
    }
}

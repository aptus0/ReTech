//
//  PrintQueueScannerView.swift
//  ReTech
//

import SwiftUI
import UserNotifications

struct ProductResponse: Codable {
    let message: String
    let product: ProductInfo?
}

struct PrintQueueScannerView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var isScanning     = true
    @State private var scannedProduct: ProductInfo?
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            if isScanning {
                cameraOverlay
            } else {
                resultContent
            }
        }
        .navigationTitle("Hızlı Barkod Çıkart")
        .darkNavBar()
        .onAppear { requestNotificationPermission() }
    }

    // MARK: Camera
    private var cameraOverlay: some View {
        ZStack {
            ScannerView { code in
                isScanning = false
                addToQueue(barcode: code)
            }
            .ignoresSafeArea()

            VStack {
                Spacer()
                scannerLabel("Barkodu Kameraya Gösterin")
            }
        }
    }

    // MARK: Result
    @ViewBuilder
    private var resultContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 22) {
                if let product = scannedProduct {
                    // Success state
                    VStack(spacing: 16) {
                        ZStack {
                            Circle().fill(DS.success.opacity(0.14)).frame(width: 90, height: 90)
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 48))
                                .foregroundColor(DS.success)
                        }
                        Text("Kuyruğa Eklendi!")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.white)
                    }

                    // Product card
                    VStack(spacing: 0) {
                        HStack(spacing: 14) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(DS.success.opacity(0.14))
                                    .frame(width: 48, height: 48)
                                Image(systemName: "printer.fill")
                                    .font(.system(size: 21))
                                    .foregroundColor(DS.success)
                            }
                            VStack(alignment: .leading, spacing: 4) {
                                Text(product.name)
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.white)
                                    .lineLimit(2)
                                Text(product.barcode ?? product.code ?? "—")
                                    .font(.system(size: 12))
                                    .foregroundColor(DS.textSecondary)
                            }
                            Spacer()
                        }
                        .padding(.bottom, 14)

                        Divider().background(DS.border).padding(.bottom, 14)

                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Fiyat")
                                    .font(.system(size: 11))
                                    .foregroundColor(DS.textSecondary)
                                Text(String(format: "%.2f ₺", product.sale_price))
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundColor(DS.success)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 4) {
                                Text("Stok")
                                    .font(.system(size: 11))
                                    .foregroundColor(DS.textSecondary)
                                Text("\(product.current_stock ?? product.stock_quantity ?? 0) Adet")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(DS.accent)
                            }
                        }
                    }
                    .padding(18)
                    .glassCard()
                    .padding(.horizontal, 20)

                } else if let error = errorMessage {
                    VStack(spacing: 14) {
                        ZStack {
                            Circle().fill(DS.error.opacity(0.14)).frame(width: 80, height: 80)
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 40))
                                .foregroundColor(DS.error)
                        }
                        Text("İşlem Başarısız")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.white)
                        Text(error)
                            .font(.system(size: 14))
                            .foregroundColor(DS.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 30)
                    }
                } else {
                    rtLoadingView(message: "İşleniyor...")
                }

                Button {
                    scannedProduct = nil
                    errorMessage = nil
                    isScanning = true
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "barcode.viewfinder")
                        Text("Yeni Barkod Okut")
                    }
                }
                .buttonStyle(PrimaryButtonStyle())
                .padding(.horizontal, 20)

                Spacer(minLength: 80)
            }
            .padding(.top, 32)
        }
    }

    // MARK: Notifications
    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { _, _ in }
    }

    private func sendNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title; content.body = body; content.sound = .default
        UNUserNotificationCenter.current().add(
            UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        )
    }

    // MARK: Networking
    private func addToQueue(barcode: String) {
        var base = serverURL
        if !base.hasPrefix("http") { base = "http://" + base }
        guard let url = URL(string: "\(base)/api/mobile/print-queue/add") else {
            errorMessage = "Geçersiz sunucu adresi."
            sendNotification(title: "Hata ❌", body: "Geçersiz sunucu adresi.")
            return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty { req.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization") }
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["barcode": barcode])

        NetworkManager.shared.session.dataTask(with: req) { data, response, error in
            DispatchQueue.main.async {
                if let e = error {
                    self.errorMessage = "Bağlantı hatası: \(e.localizedDescription)"
                    self.sendNotification(title: "Bağlantı Hatası ❌", body: e.localizedDescription)
                    return
                }
                guard let http = response as? HTTPURLResponse, let data = data else {
                    self.errorMessage = "Geçersiz yanıt."
                    self.sendNotification(title: "Hata ❌", body: "Geçersiz sunucu yanıtı.")
                    return
                }
                if http.statusCode == 200 {
                    if let result = try? JSONDecoder().decode(ProductResponse.self, from: data) {
                        self.scannedProduct = result.product
                        if let prod = result.product {
                            self.sendNotification(
                                title: "Kuyruğa Eklendi ✅",
                                body: "\(prod.name) | \(String(format: "%.2f", prod.sale_price)) ₺ | Stok: \(prod.current_stock ?? prod.stock_quantity ?? 0)"
                            )
                        }
                    } else {
                        self.errorMessage = "Veri okunamadı."
                        self.sendNotification(title: "Veri Hatası ❌", body: "Ürün bilgileri çözümlenemedi.")
                    }
                } else {
                    let msg: String
                    if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                       let m = json["message"] as? String { msg = m }
                    else { msg = "Sunucu hatası (\(http.statusCode))." }
                    self.errorMessage = msg
                    self.sendNotification(title: "İşlem Başarısız ❌", body: msg)
                }
            }
        }.resume()
    }
}

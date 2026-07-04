//
//  ReportsView.swift
//  ReTech
//

import SwiftUI

struct ReportData: Codable {
    let success: Bool
    let total_products: Int
    let total_stock: Int
    let total_purchase_value: Double
    let total_sale_value: Double
}

struct ReportsView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var reportData: ReportData? = nil
    @State private var isLoading = true
    @State private var errorMessage: String? = nil

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            if isLoading {
                VStack(spacing: 16) {
                    ProgressView().progressViewStyle(CircularProgressViewStyle(tint: DS.primary))
                    Text("Raporlar hesaplanıyor...").foregroundColor(DS.textSecondary)
                }
            } else if let error = errorMessage {
                rtErrorState(message: error) {
                    fetchReports()
                }
            } else if let data = reportData {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        
                        // Header card
                        VStack(spacing: 8) {
                            Text("Toplam Stok Satış Değeri")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(DS.textSecondary)
                            
                            Text(String(format: "%.2f TL", data.total_sale_value))
                                .font(.system(size: 32, weight: .heavy, design: .rounded))
                                .foregroundColor(DS.primary)
                        }
                        .padding(.vertical, 24)
                        .frame(maxWidth: .infinity)
                        .glassCard(cornerRadius: 24)
                        .padding(.top, 16)
                        
                        // Grid stats
                        LazyVGrid(columns: columns, spacing: 16) {
                            reportMetricCard(
                                title: "Fiziksel Stok",
                                value: "\(data.total_stock) Adet",
                                icon: "shippingbox.fill",
                                color: DS.success
                            )
                            
                            reportMetricCard(
                                title: "Çeşit Sayısı",
                                value: "\(data.total_products) Çeşit",
                                icon: "square.grid.2x2.fill",
                                color: Color(hex: "3B82F6")
                            )
                        }
                        
                        // Full width stat
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                ZStack {
                                    Circle().fill(DS.textSecondary.opacity(0.15)).frame(width: 40, height: 40)
                                    Image(systemName: "arrow.down.left.circle.fill").font(.system(size: 20)).foregroundColor(DS.textSecondary)
                                }
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Toplam Maliyet (Geliş)")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(DS.textSecondary)
                                    Text(String(format: "%.2f TL", data.total_purchase_value))
                                        .font(.system(size: 20, weight: .bold))
                                        .foregroundColor(DS.textPrimary)
                                }
                                Spacer()
                            }
                        }
                        .padding(20)
                        .glassCard(cornerRadius: 16)
                        
                        Spacer(minLength: 40)
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
        .navigationTitle("Raporlar")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            fetchReports()
        }
    }
    
    private func reportMetricCard(title: String, value: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(color.opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(DS.textSecondary)
                Text(value)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(DS.textPrimary)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassCard(cornerRadius: 16)
    }

    private func fetchReports() {
        guard !serverURL.isEmpty, !authToken.isEmpty else {
            errorMessage = "Sunucu ayarları eksik."
            isLoading = false
            return
        }

        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        if baseURL.hasSuffix("/") { baseURL.removeLast() }

        guard let url = URL(string: "\(baseURL)/api/mobile/inventory/reports") else {
            errorMessage = "Geçersiz URL."
            isLoading = false
            return
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        isLoading = true
        errorMessage = nil

        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isLoading = false
                if let error = error {
                    self.errorMessage = "Bağlantı hatası: \(error.localizedDescription)"
                    return
                }

                guard let data = data else {
                    self.errorMessage = "Sunucudan veri alınamadı."
                    return
                }

                do {
                    let decoded = try JSONDecoder().decode(ReportData.self, from: data)
                    if decoded.success {
                        self.reportData = decoded
                    } else {
                        self.errorMessage = "Veri alınırken bir hata oluştu."
                    }
                } catch {
                    self.errorMessage = "Veri ayrıştırma hatası."
                }
            }
        }.resume()
    }
}

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
    let low_stock_products: [ProductInfo]?
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
                                .foregroundColor(Color.white.opacity(0.8))
                            
                            Text(String(format: "%.2f TL", data.total_sale_value))
                                .font(.system(size: 34, weight: .heavy, design: .rounded))
                                .foregroundColor(.white)
                        }
                        .padding(.vertical, 32)
                        .frame(maxWidth: .infinity)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "6366F1"), Color(hex: "8B5CF6")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .cornerRadius(24)
                        .shadow(color: Color(hex: "6366F1").opacity(0.4), radius: 12, y: 6)
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
                                    Circle().fill(Color(hex: "F43F5E").opacity(0.15)).frame(width: 44, height: 44)
                                    Image(systemName: "arrow.down.left.circle.fill").font(.system(size: 22)).foregroundColor(Color(hex: "F43F5E"))
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
                        .background(DS.surface)
                        .cornerRadius(20)
                        .shadow(color: Color.black.opacity(0.04), radius: 8, y: 4)
                        
                        // LOW STOCK WIDGET
                        if let lowStocks = data.low_stock_products, !lowStocks.isEmpty {
                            VStack(alignment: .leading, spacing: 14) {
                                HStack {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .foregroundColor(DS.error)
                                    Text("Düşük Stok Uyarıları")
                                        .font(.system(size: 18, weight: .bold))
                                        .foregroundColor(DS.textPrimary)
                                }
                                .padding(.horizontal, 4)
                                
                                ForEach(lowStocks) { product in
                                    HStack(spacing: 12) {
                                        ZStack {
                                            Circle().fill(DS.error.opacity(0.1)).frame(width: 40, height: 40)
                                            Text("\(product.current_stock ?? 0)")
                                                .font(.system(size: 14, weight: .bold))
                                                .foregroundColor(DS.error)
                                        }
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(product.name)
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundColor(DS.textPrimary)
                                            Text(product.barcode ?? product.code ?? "")
                                                .font(.system(size: 12))
                                                .foregroundColor(DS.textSecondary)
                                        }
                                        Spacer()
                                    }
                                    .padding(12)
                                    .background(DS.surface)
                                    .cornerRadius(16)
                                    .shadow(color: Color.black.opacity(0.03), radius: 6, y: 2)
                                }
                            }
                            .padding(.top, 10)
                        }
                        
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
                RoundedRectangle(cornerRadius: 14)
                    .fill(color.opacity(0.15))
                    .frame(width: 48, height: 48)
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(color)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(DS.textSecondary)
                Text(value)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(DS.textPrimary)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(DS.surface)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.04), radius: 8, y: 4)
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
                    self.reportData = decoded
                } catch {
                    self.errorMessage = "Veri ayrıştırma hatası. Sunucunuzda güncellemeleri kontrol edin."
                }
            }
        }.resume()
    }
}

//
//  InventoryListView.swift
//  ReTech
//

import SwiftUI

struct InventoryListView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var products: [ProductInfo] = []
    @State private var isLoading = true
    @State private var errorMessage: String? = nil

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            if isLoading {
                VStack(spacing: 16) {
                    ProgressView().progressViewStyle(CircularProgressViewStyle(tint: DS.primary))
                    Text("Stoklar yükleniyor...").foregroundColor(DS.textSecondary)
                }
            } else if let error = errorMessage {
                rtErrorState(message: error) {
                    fetchInventory()
                }
            } else if products.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "shippingbox")
                        .font(.system(size: 48))
                        .foregroundColor(DS.textTertiary)
                    Text("Stokta ürün bulunmuyor.")
                        .font(.system(size: 16))
                        .foregroundColor(DS.textSecondary)
                }
            } else {
                ScrollView(showsIndicators: false) {
                    LazyVStack(spacing: 12) {
                        ForEach(products) { product in
                            ProductResultCard(product: product)
                        }
                    }
                    .padding(20)
                }
            }
        }
        .navigationTitle("Stok Listesi")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            fetchInventory()
        }
    }

    private func fetchInventory() {
        guard !serverURL.isEmpty, !authToken.isEmpty else {
            errorMessage = "Sunucu ayarları eksik."
            isLoading = false
            return
        }

        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        if baseURL.hasSuffix("/") { baseURL.removeLast() }

        guard let url = URL(string: "\(baseURL)/api/mobile/inventory/list") else {
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
                    let decoded = try JSONDecoder().decode([ProductInfo].self, from: data)
                    self.products = decoded
                } catch {
                    self.errorMessage = "Veri ayrıştırma hatası."
                }
            }
        }.resume()
    }
}

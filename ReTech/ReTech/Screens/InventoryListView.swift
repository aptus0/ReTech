//
//  InventoryListView.swift
//  ReTech
//

import SwiftUI

struct PaginatedProducts: Codable {
    let data: [ProductInfo]
    let current_page: Int
    let last_page: Int
}

struct InventoryListView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var products: [ProductInfo] = []
    @State private var isLoading = true
    @State private var isFetchingMore = false
    @State private var errorMessage: String? = nil

    // Pagination & Search State
    @State private var currentPage = 1
    @State private var lastPage = 1
    @State private var searchText = ""
    @State private var sortOption = "stock_desc"

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            VStack(spacing: 0) {
                // Top Bar: Search & Filter
                HStack(spacing: 12) {
                    // Search Bar
                    HStack(spacing: 8) {
                        Image(systemName: "magnifyingglass").foregroundColor(DS.textSecondary)
                        TextField("Ürün Ara (İsim, Kod, Barkod)", text: $searchText, onCommit: {
                            resetAndFetch()
                        })
                        .font(.system(size: 15))
                        .foregroundColor(DS.textPrimary)
                        .disableAutocorrection(true)
                        
                        if !searchText.isEmpty {
                            Button(action: {
                                searchText = ""
                                resetAndFetch()
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(DS.textSecondary)
                            }
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(Color.black.opacity(0.04))
                    .cornerRadius(10)
                    
                    // Filter Menu
                    Menu {
                        Button("Stoğa Göre (En Çok)") { sortOption = "stock_desc"; resetAndFetch() }
                        Button("Stoğa Göre (En Az)") { sortOption = "stock_asc"; resetAndFetch() }
                        Button("Fiyata Göre (Pahalı)") { sortOption = "price_desc"; resetAndFetch() }
                        Button("Fiyata Göre (Ucuz)") { sortOption = "price_asc"; resetAndFetch() }
                        Button("İsme Göre (A-Z)") { sortOption = "name_asc"; resetAndFetch() }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(DS.primary)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(DS.surface.shadow(color: .black.opacity(0.03), radius: 4, y: 2))

                // Content Area
                if isLoading && products.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        ProgressView().progressViewStyle(CircularProgressViewStyle(tint: DS.primary))
                        Text("Stoklar yükleniyor...").foregroundColor(DS.textSecondary)
                    }
                    Spacer()
                } else if let error = errorMessage, products.isEmpty {
                    Spacer()
                    rtErrorState(message: error) { resetAndFetch() }
                    Spacer()
                } else if products.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "shippingbox")
                            .font(.system(size: 48))
                            .foregroundColor(DS.textTertiary)
                        Text("Kriterlere uygun ürün bulunamadı.")
                            .font(.system(size: 16))
                            .foregroundColor(DS.textSecondary)
                    }
                    Spacer()
                } else {
                    ScrollView(showsIndicators: false) {
                        LazyVStack(spacing: 12) {
                            ForEach(products) { product in
                                ProductResultCard(product: product)
                                    .onAppear {
                                        if product.id == products.last?.id {
                                            loadMore()
                                        }
                                    }
                            }
                            
                            if isFetchingMore {
                                ProgressView()
                                    .padding(.vertical, 20)
                            }
                        }
                        .padding(20)
                    }
                }
            }
        }
        .navigationTitle("Stok Listesi")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if products.isEmpty {
                resetAndFetch()
            }
        }
    }
    
    private func resetAndFetch() {
        currentPage = 1
        products.removeAll()
        isLoading = true
        fetchInventory()
    }
    
    private func loadMore() {
        if currentPage < lastPage && !isFetchingMore {
            currentPage += 1
            isFetchingMore = true
            fetchInventory()
        }
    }

    private func fetchInventory() {
        guard !serverURL.isEmpty, !authToken.isEmpty else {
            errorMessage = "Sunucu ayarları eksik."
            isLoading = false
            isFetchingMore = false
            return
        }

        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        if baseURL.hasSuffix("/") { baseURL.removeLast() }

        var queryItems = [
            URLQueryItem(name: "page", value: "\(currentPage)"),
            URLQueryItem(name: "sort", value: sortOption)
        ]
        
        let trimmedSearch = searchText.trimmingCharacters(in: .whitespaces)
        if !trimmedSearch.isEmpty {
            queryItems.append(URLQueryItem(name: "search", value: trimmedSearch))
        }
        
        var urlComponents = URLComponents(string: "\(baseURL)/api/mobile/inventory/list")
        urlComponents?.queryItems = queryItems

        guard let url = urlComponents?.url else {
            errorMessage = "Geçersiz URL."
            isLoading = false
            isFetchingMore = false
            return
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        errorMessage = nil

        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isLoading = false
                self.isFetchingMore = false
                
                if let error = error {
                    self.errorMessage = "Bağlantı hatası: \(error.localizedDescription)"
                    return
                }

                guard let data = data else {
                    self.errorMessage = "Sunucudan veri alınamadı."
                    return
                }

                do {
                    let decoded = try JSONDecoder().decode(PaginatedProducts.self, from: data)
                    if self.currentPage == 1 {
                        self.products = decoded.data
                    } else {
                        self.products.append(contentsOf: decoded.data)
                    }
                    self.lastPage = decoded.last_page
                } catch {
                    self.errorMessage = "Veri format hatası. Lütfen sunucunuzda güncellemeleri kontrol edin."
                }
            }
        }.resume()
    }
}

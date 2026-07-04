//
//  ProductInquiryView.swift
//  ReTech
//

import SwiftUI
import UserNotifications

// MARK: - Search Mode
enum SearchMode: String, CaseIterable {
    case manual = "İsim / Barkod"
    case camera = "Kamera"

    var icon: String {
        switch self {
        case .manual: return "keyboard"
        case .camera: return "barcode.viewfinder"
        }
    }
}

// MARK: - Main View
struct ProductInquiryView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var searchMode: SearchMode = .manual
    @State private var searchText: String = ""
    @State private var searchResults: [ProductInfo] = []
    @State private var selectedProduct: ProductInfo?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showProductDetail = false
    @State private var isCameraScanning = false
    @FocusState private var isSearchFocused: Bool
    @State private var debounceTimer: Timer?

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            if isCameraScanning {
                cameraOverlay
            } else {
                mainContent
            }
        }
        .navigationTitle("Ürün Sorgula")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showProductDetail) {
            if let product = selectedProduct {
                ProductDetailSheet(product: product)
            }
        }
        .onAppear {
            requestNotificationPermission()
        }
    }

    // MARK: - Main Content
    private var mainContent: some View {
        VStack(spacing: 0) {
            // Header card
            headerSection

            // Mode selector
            modeSelectorSection
                .padding(.top, 20)
                .padding(.horizontal, 20)

            // Search bar (manual mode)
            if searchMode == .manual {
                searchBarSection
                    .padding(.top, 16)
                    .padding(.horizontal, 20)
            } else {
                // Camera mode launch button
                cameraLaunchSection
                    .padding(.top, 20)
                    .padding(.horizontal, 20)
            }

            // Results / States
            resultsSection
                .padding(.top, 12)
        }
    }

    // MARK: - Header
    private var headerSection: some View {
        VStack(spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Ürün Sorgula")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("İsim, barkod veya kamerayla arayın")
                        .font(.system(size: 14, weight: .regular))
                        .foregroundColor(Color.white.opacity(0.55))
                }
                Spacer()
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: "6366F1"), Color(hex: "8B5CF6")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 48, height: 48)
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
            .padding(.bottom, 16)
        }
    }

    // MARK: - Mode Selector
    private var modeSelectorSection: some View {
        HStack(spacing: 0) {
            ForEach(SearchMode.allCases, id: \.self) { mode in
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                        searchMode = mode
                        if mode == .manual {
                            isCameraScanning = false
                        }
                        clearResults()
                    }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: mode.icon)
                            .font(.system(size: 13, weight: .medium))
                        Text(mode.rawValue)
                            .font(.system(size: 14, weight: searchMode == mode ? .bold : .medium))
                    }
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity)
                    .background(
                        searchMode == mode
                            ? LinearGradient(
                                colors: [Color(hex: "6366F1"), Color(hex: "8B5CF6")],
                                startPoint: .leading,
                                endPoint: .trailing
                              )
                            : LinearGradient(
                                colors: [Color.clear, Color.clear],
                                startPoint: .leading,
                                endPoint: .trailing
                              )
                    )
                    .foregroundColor(searchMode == mode ? .white : DS.textSecondary)
                    .cornerRadius(10)
                }
            }
        }
        .padding(4)
        .background(Color.black.opacity(0.05))
        .cornerRadius(14)
    }

    // MARK: - Search Bar
    private var searchBarSection: some View {
        HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(isSearchFocused ? Color(hex: "6366F1") : DS.textSecondary)

            TextField("", text: $searchText, prompt: Text("Ürün adı, barkod veya kod girin...")
                .foregroundColor(DS.textSecondary.opacity(0.6)))
                .foregroundColor(DS.textPrimary)
                .font(.system(size: 15))
                .focused($isSearchFocused)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .onChange(of: searchText) { newValue in
                    debounceSearch(query: newValue)
                }
                .onSubmit {
                    performSearch(query: searchText)
                }

            if !searchText.isEmpty {
                Button {
                    withAnimation {
                        searchText = ""
                        clearResults()
                    }
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(DS.textSecondary)
                        .font(.system(size: 16))
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(Color.white)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(
                    isSearchFocused ? Color(hex: "6366F1").opacity(0.8) : Color.black.opacity(0.1),
                    lineWidth: 1
                )
        )
        .cornerRadius(14)
        .shadow(color: Color.black.opacity(0.03), radius: 5, x: 0, y: 2)
        .animation(.easeInOut(duration: 0.2), value: isSearchFocused)
    }

    // MARK: - Camera Launch
    private var cameraLaunchSection: some View {
        Button {
            withAnimation {
                isCameraScanning = true
                clearResults()
            }
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "barcode.viewfinder")
                    .font(.system(size: 22, weight: .medium))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Kamerayı Başlat")
                        .font(.system(size: 16, weight: .semibold))
                    Text("Barkodu kameraya gösterin")
                        .font(.system(size: 13))
                        .opacity(0.75)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .opacity(0.6)
            }
            .padding(18)
            .foregroundColor(.white)
            .background(
                LinearGradient(
                    colors: [Color(hex: "6366F1"), Color(hex: "8B5CF6")],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(16)
        }
        .onAppear {
            if searchMode == .manual && searchText.isEmpty && searchResults.isEmpty {
                performSearch(query: "")
            }
        }
    }

    // MARK: - Camera Overlay
    private var cameraOverlay: some View {
        ZStack {
            ScannerView { code in
                isCameraScanning = false
                performBarcodeInquiry(barcode: code)
            }
            .ignoresSafeArea()

            // Scan frame
            VStack {
                Spacer()
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color(hex: "6366F1"), lineWidth: 3)
                    .frame(width: 260, height: 180)
                    .shadow(color: Color(hex: "6366F1").opacity(0.6), radius: 10)
                Spacer()

                HStack(spacing: 0) {
                    Button {
                        withAnimation {
                            isCameraScanning = false
                        }
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "xmark")
                                .font(.system(size: 14, weight: .semibold))
                            Text("İptal")
                                .font(.system(size: 15, weight: .semibold))
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 13)
                        .background(Color.black.opacity(0.5))
                        .foregroundColor(.white)
                        .cornerRadius(14)
                    }
                }
                .padding(.bottom, 50)
            }

            VStack {
                HStack {
                    Spacer()
                    Text("Barkodu çerçeveye alın")
                        .font(.system(size: 14, weight: .medium))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.black.opacity(0.6))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                    Spacer()
                }
                .padding(.top, 60)
                Spacer()
            }
        }
    }

    // MARK: - Results Section
    @ViewBuilder
    private var resultsSection: some View {
        if isLoading {
            loadingView
        } else if let error = errorMessage {
            errorView(message: error)
        } else if !searchResults.isEmpty {
            searchResultsList
        } else if searchMode == .manual && searchText.count >= 2 && !isLoading {
            emptyResultsView
        } else if searchMode == .manual && searchText.isEmpty {
            idleHintView
        }
    }

    // MARK: - Loading
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: Color(hex: "6366F1")))
                .scaleEffect(1.5)
            Text("Aranıyor...")
                .foregroundColor(DS.textSecondary)
                .font(.system(size: 14))
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 60)
    }

    // MARK: - Error
    private func errorView(message: String) -> some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.1))
                    .frame(width: 72, height: 72)
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(.red)
            }
            Text("Ürün Bulunamadı")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(DS.textPrimary)
            Text(message)
                .font(.system(size: 14))
                .foregroundColor(DS.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Button {
                withAnimation {
                    clearResults()
                    searchText = ""
                }
            } label: {
                Text("Tekrar Ara")
                    .font(.system(size: 15, weight: .semibold))
                    .padding(.horizontal, 28)
                    .padding(.vertical, 12)
                    .background(Color(hex: "6366F1"))
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 48)
    }

    // MARK: - Empty Results
    private var emptyResultsView: some View {
        VStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 36))
                .foregroundColor(DS.textSecondary.opacity(0.3))
            Text("Sonuç bulunamadı")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(DS.textSecondary)
            Text("\"\(searchText)\" için eşleşen ürün yok")
                .font(.system(size: 13))
                .foregroundColor(DS.textSecondary.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 60)
    }

    // MARK: - Idle Hint
    private var idleHintView: some View {
        VStack(spacing: 20) {
            Divider()
                .background(DS.textSecondary.opacity(0.2))
                .padding(.horizontal, 20)

            VStack(spacing: 12) {
                hintItem(icon: "textformat", text: "Ürün adını yazmaya başlayın")
                hintItem(icon: "barcode", text: "Barkod numarası ile arayın")
                hintItem(icon: "number", text: "Ürün kodu ile arayın")
            }
            .padding(.horizontal, 30)
        }
        .padding(.top, 8)
    }

    private func hintItem(icon: String, text: String) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(Color(hex: "6366F1").opacity(0.8))
                .frame(width: 32)
            Text(text)
                .font(.system(size: 14))
                .foregroundColor(DS.textSecondary)
            Spacer()
        }
    }

    // MARK: - Search Results List
    private var searchResultsList: some View {
        ScrollView {
            VStack(spacing: 10) {
                HStack {
                    Text("\(searchResults.count) ürün bulundu")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(DS.textSecondary)
                    Spacer()
                }
                .padding(.horizontal, 20)

                ForEach(searchResults) { product in
                    ProductResultCard(product: product)
                        .onTapGesture {
                            selectedProduct = product
                            showProductDetail = true
                            sendNotification(
                                title: "Ürün Bulundu ✅",
                                body: "\(product.name) — \(String(format: "%.2f TL", product.sale_price))"
                            )
                        }
                        .padding(.horizontal, 20)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
            .padding(.bottom, 30)
            .animation(.spring(response: 0.4, dampingFraction: 0.75), value: searchResults.count)
        }
    }

    // MARK: - Actions
    private func debounceSearch(query: String) {
        debounceTimer?.invalidate()
        clearResults()
        guard query.trimmingCharacters(in: .whitespaces).count >= 2 else { return }
        debounceTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: false) { _ in
            performSearch(query: query)
        }
    }

    private func performSearch(query: String) {
        let trimmed = query.trimmingCharacters(in: .whitespaces)
        // If not empty, it proceeds. If empty, it asks backend for the default 50 items.
        isLoading = true
        errorMessage = nil

        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        guard let encoded = trimmed.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(baseURL)/api/mobile/products/search?q=\(encoded)") else {
            isLoading = false
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
                        let results = try JSONDecoder().decode([ProductInfo].self, from: data)
                        withAnimation {
                            self.searchResults = results
                        }
                        if results.isEmpty {
                            self.errorMessage = nil
                        }
                    } catch {
                        self.errorMessage = "Veri okunamadı."
                    }
                } else {
                    self.errorMessage = "Sunucu hatası (\(httpResponse.statusCode))."
                }
            }
        }.resume()
    }

    private func performBarcodeInquiry(barcode: String) {
        isLoading = true
        errorMessage = nil
        searchMode = .manual
        searchText = barcode

        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        guard let url = URL(string: "\(baseURL)/api/mobile/products/inquiry/\(barcode)") else {
            isLoading = false
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
                        let product = try JSONDecoder().decode(ProductInfo.self, from: data)
                        withAnimation {
                            self.searchResults = [product]
                        }
                        self.sendNotification(
                            title: "Ürün Bulundu ✅",
                            body: "\(product.name) — \(String(format: "%.2f TL", product.sale_price))"
                        )
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

    private func clearResults() {
        searchResults = []
        errorMessage = nil
        selectedProduct = nil
    }

    // MARK: - Notifications
    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { _, _ in }
    }

    private func sendNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }
}

// MARK: - Product Result Card (List Item)
struct ProductResultCard: View {
    let product: ProductInfo
    @AppStorage("serverURL") private var serverURL: String = ""

    private var stockCount: Int {
        product.current_stock ?? product.stock_quantity ?? 0
    }
    
    private var imageURL: URL? {
        guard let imagePath = product.image, !imagePath.isEmpty else { return nil }
        if imagePath.hasPrefix("http") {
            return URL(string: imagePath)
        }
        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        if baseURL.hasSuffix("/") { baseURL.removeLast() }
        let path = imagePath.hasPrefix("/") ? imagePath : "/\(imagePath)"
        return URL(string: "\(baseURL)/storage\(path)")
    }

    var body: some View {
        NavigationLink(destination: ProductDetailView(product: product)) {
            HStack(spacing: 16) {
                // Image or Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(hex: "6366F1").opacity(0.1))
                        .frame(width: 60, height: 60)
                    
                    if let url = imageURL {
                        AsyncImage(url: url) { phase in
                            if let image = phase.image {
                                image.resizable().scaledToFill()
                            } else {
                                Image(systemName: "photo.fill").foregroundColor(Color(hex: "6366F1").opacity(0.5))
                            }
                        }
                        .frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    } else {
                        Image(systemName: "tag.fill")
                            .font(.system(size: 20))
                            .foregroundColor(Color(hex: "6366F1"))
                    }
                }

                // Info
                VStack(alignment: .leading, spacing: 6) {
                    Text(product.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(DS.textPrimary)
                        .lineLimit(2)
                    
                    HStack(spacing: 12) {
                        if let barcode = product.barcode {
                            Text(barcode)
                                .font(.system(size: 13))
                                .foregroundColor(DS.textSecondary)
                        }
                        
                        // Stock Badge
                        HStack(spacing: 4) {
                            Circle()
                                .fill(stockCount > 0 ? DS.success : DS.error)
                                .frame(width: 6, height: 6)
                            Text("\(stockCount) Stok")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(stockCount > 0 ? DS.success : DS.error)
                        }
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background((stockCount > 0 ? DS.success : DS.error).opacity(0.1))
                        .cornerRadius(6)
                    }
                }

                Spacer()

                // Price
                VStack(alignment: .trailing) {
                    Text(String(format: "%.2f", product.sale_price))
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(DS.textPrimary)
                    Text("TL")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(DS.textSecondary)
                }
            }
            .padding(14)
            .background(Color.black.opacity(0.02))
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.black.opacity(0.05), lineWidth: 1))
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Product Detail Sheet
struct ProductDetailSheet: View {
    let product: ProductInfo
    @Environment(\.dismiss) private var dismiss

    private var stockCount: Int {
        product.current_stock ?? product.stock_quantity ?? 0
    }

    private var stockLabel: String {
        stockCount > 0 ? "\(stockCount) Adet Mevcut" : "Stokta Yok"
    }

    private var stockColor: Color {
        stockCount > 10 ? Color(hex: "22C55E") :
        stockCount > 0  ? Color(hex: "F59E0B") :
                          Color(hex: "EF4444")
    }

    var body: some View {
        ZStack {
            Color(hex: "0F172A").ignoresSafeArea()

            VStack(spacing: 0) {
                // Handle bar
                Capsule()
                    .fill(Color.white.opacity(0.2))
                    .frame(width: 40, height: 4)
                    .padding(.top, 12)
                    .padding(.bottom, 20)

                // Header
                VStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color(hex: "6366F1"), Color(hex: "8B5CF6")],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 80, height: 80)
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 42))
                            .foregroundColor(.white)
                    }

                    Text("ÜRÜN BULUNDU")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(Color(hex: "6366F1"))

                    Text(product.name)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(DS.textPrimary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                .padding(.bottom, 28)

                // Info cards
                VStack(spacing: 12) {
                    infoRow(
                        icon: "turkishlirasign.circle.fill",
                        iconColor: Color(hex: "22C55E"),
                        label: "Satış Fiyatı",
                        value: String(format: "%.2f ₺", product.sale_price)
                    )

                    infoRow(
                        icon: "archivebox.fill",
                        iconColor: stockColor,
                        label: "Stok Durumu",
                        value: stockLabel,
                        valueColor: stockColor
                    )

                    if let barcode = product.barcode {
                        infoRow(
                            icon: "barcode",
                            iconColor: Color(hex: "6366F1"),
                            label: "Barkod",
                            value: barcode
                        )
                    }

                    if let code = product.code {
                        infoRow(
                            icon: "number",
                            iconColor: Color(hex: "F59E0B"),
                            label: "Ürün Kodu",
                            value: code
                        )
                    }
                }
                .padding(.horizontal, 20)

                Spacer()

                // Close button
                Button {
                    dismiss()
                } label: {
                    Text("Kapat")
                        .font(.system(size: 16, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.white.opacity(0.09))
                        .foregroundColor(.white)
                        .cornerRadius(16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 36)
            }
        }
    }

    private func infoRow(icon: String, iconColor: Color, label: String, value: String, valueColor: Color = .white) -> some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(iconColor.opacity(0.15))
                    .frame(width: 42, height: 42)
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(iconColor)
            }
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(Color.white.opacity(0.5))
            Spacer()
            Text(value)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(valueColor)
        }
        .padding(14)
        .background(Color.white.opacity(0.06))
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
        )
    }
}


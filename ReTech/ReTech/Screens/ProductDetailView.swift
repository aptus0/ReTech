//
//  ProductDetailView.swift
//  ReTech
//

import SwiftUI

struct ProductDetailView: View {
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
        return URL(string: "\(baseURL)/storage\(path)") // Typically images are in /storage in Laravel
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Product Image Section
                ZStack {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(DS.surface2)
                        .frame(height: 240)
                        .shadow(color: Color.black.opacity(0.04), radius: 10, x: 0, y: 5)

                    if let url = imageURL {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .empty:
                                ProgressView()
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFit()
                                    .frame(height: 220)
                                    .cornerRadius(16)
                            case .failure:
                                placeholderImage
                            @unknown default:
                                placeholderImage
                            }
                        }
                    } else {
                        placeholderImage
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

                // Main Info
                VStack(spacing: 8) {
                    Text(product.name)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(DS.textPrimary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 16)

                    if let barcode = product.barcode {
                        HStack(spacing: 6) {
                            Image(systemName: "barcode")
                            Text(barcode)
                        }
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(DS.textSecondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(DS.surface2)
                        .cornerRadius(8)
                    }
                }

                // Stats Grid
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                    statCard(
                        title: "Stok Miktarı",
                        value: "\(stockCount) Adet",
                        icon: "shippingbox.fill",
                        color: stockCount > 0 ? DS.success : DS.error
                    )
                    
                    statCard(
                        title: "Satış Fiyatı",
                        value: String(format: "%.2f TL", product.sale_price),
                        icon: "tag.fill",
                        color: DS.primary
                    )

                    if let purchasePrice = product.purchase_price, purchasePrice > 0 {
                        statCard(
                            title: "Geliş Fiyatı",
                            value: String(format: "%.2f TL", purchasePrice),
                            icon: "arrow.down.left.circle.fill",
                            color: DS.textSecondary
                        )
                    }
                    
                    if let code = product.code {
                        statCard(
                            title: "Ürün Kodu",
                            value: code,
                            icon: "number",
                            color: DS.textTertiary
                        )
                    }
                }
                .padding(.horizontal, 20)

                Spacer(minLength: 40)
            }
        }
        .rtBg()
        .navigationTitle("Ürün Detayı")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var placeholderImage: some View {
        VStack(spacing: 12) {
            Image(systemName: "photo.fill")
                .font(.system(size: 40))
                .foregroundColor(DS.textTertiary.opacity(0.5))
            Text("Görsel Yok")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(DS.textTertiary)
        }
    }

    private func statCard(title: String, value: String, icon: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.15))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .foregroundColor(color)
                }
                Spacer()
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(DS.textSecondary)
                Text(value)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(DS.textPrimary)
                    .minimumScaleFactor(0.8)
                    .lineLimit(1)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassCard(cornerRadius: 16)
    }
}

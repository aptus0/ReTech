//
//  HomeView.swift
//  ReTech
//

import SwiftUI

struct HomeView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    private struct MenuItem {
        let title: String
        let icon: String
        let color: Color
    }

    private let menuItems: [MenuItem] = [
        MenuItem(title: "Ürün Sorgula",     icon: "magnifyingglass.circle.fill", color: Color(hex: "F97316")),
        MenuItem(title: "Hızlı Etiket",     icon: "barcode.viewfinder",           color: Color(hex: "EA580C")),
        MenuItem(title: "Barkod Çıkart",    icon: "printer.fill",                 color: Color(hex: "0891B2")),
        MenuItem(title: "Stok Sayım",       icon: "list.clipboard.fill",          color: Color(hex: "059669")),
        MenuItem(title: "Fiyat Güncelle",   icon: "tag.fill",                     color: Color(hex: "F59E0B")),
        MenuItem(title: "Ürün Ekle",        icon: "plus.circle.fill",             color: Color(hex: "FB923C")),
        MenuItem(title: "İşlem Geçmişi",    icon: "clock.arrow.circlepath",       color: Color(hex: "F97316")),
        MenuItem(title: "Destek Log",       icon: "terminal.fill",                color: Color(hex: "475569"))
    ]

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    private var isMissingInfo: Bool { serverURL.isEmpty || authToken.isEmpty }

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 22) {
                    headerSection
                    if isMissingInfo { warningBanner }
                    heroCard
                    quickActionsGrid
                    Spacer(minLength: 90)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
            }
        }
        .navigationBarHidden(true)
    }

    // MARK: - Header
    private var headerSection: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 3) {
                Text("Merhaba 👋")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(DS.textSecondary)
                Text("Öz Turuncu")
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .foregroundColor(DS.textPrimary)
            }
            Spacer()
            if !authToken.isEmpty {
                Button {
                    withAnimation { authToken = "" }
                } label: {
                    ZStack {
                        Circle()
                            .fill(DS.error.opacity(0.14))
                            .frame(width: 44, height: 44)
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(DS.error)
                    }
                }
            }
        }
    }

    // MARK: - Warning Banner
    private var warningBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(DS.warning)
                .font(.system(size: 18))
            VStack(alignment: .leading, spacing: 2) {
                Text("Bağlantı Gerekli")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(DS.textPrimary)
                Text("Ayarlar bölümünden sunucu bağlantısı kurun.")
                    .font(.system(size: 12))
                    .foregroundColor(DS.textSecondary)
            }
            Spacer()
        }
        .padding(16)
        .background(DS.warning.opacity(0.10))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(DS.warning.opacity(0.25), lineWidth: 1))
        .cornerRadius(14)
    }

    // MARK: - Hero Card
    private var heroCard: some View {
        ZStack(alignment: .topLeading) {
            // Gradient background
            RoundedRectangle(cornerRadius: 24)
                .fill(DS.heroGradient)
                .frame(height: 164)
                .shadow(color: DS.primary.opacity(0.45), radius: 22, x: 0, y: 12)

            // Decorative circles
            GeometryReader { geo in
                Circle()
                    .fill(Color.white.opacity(0.07))
                    .frame(width: 180, height: 180)
                    .offset(x: geo.size.width - 70, y: -50)
                Circle()
                    .fill(Color.white.opacity(0.05))
                    .frame(width: 110, height: 110)
                    .offset(x: geo.size.width - 20, y: 50)
                Circle()
                    .fill(Color.white.opacity(0.04))
                    .frame(width: 60, height: 60)
                    .offset(x: geo.size.width + 10, y: 110)
            }
            .clipped()
            .cornerRadius(24)

            // Content
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.shield.fill")
                        .font(.system(size: 12))
                        .foregroundColor(Color.white.opacity(0.65))
                    Text("Aktif Sistem")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(Color.white.opacity(0.65))
                }

                Text("Stok & Ürün\nYönetimi")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
                    .lineSpacing(2)

                HStack(spacing: 24) {
                    statusPill(label: "Sunucu", value: serverURL.isEmpty ? "Bağlı Değil" : "Bağlı ✓",
                               ok: !serverURL.isEmpty)
                    statusPill(label: "Oturum", value: authToken.isEmpty ? "Giriş Yok" : "Aktif ✓",
                               ok: !authToken.isEmpty)
                }
            }
            .padding(22)
        }
        .frame(height: 164)
    }

    private func statusPill(label: String, value: String, ok: Bool) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(Color.white.opacity(0.55))
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(ok ? Color(hex: "34D399") : Color(hex: "F87171"))
        }
    }

    // MARK: - Grid
    private var quickActionsGrid: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Hızlı Erişim")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(DS.textSecondary)

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(menuItems, id: \.title) { item in
                    NavigationLink(destination: destinationView(for: item.title)) {
                        MenuActionCard(title: item.title, icon: item.icon, accentColor: item.color)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
        }
    }

    // MARK: - Navigation
    @ViewBuilder
    private func destinationView(for title: String) -> some View {
        switch title {
        case "Ürün Sorgula", "Hızlı Etiket":
            ProductInquiryView()
        case "Barkod Çıkart":
            PrintQueueScannerView()
        case "Ürün Ekle":
            ProductAddView()
        case "Fiyat Güncelle":
            PriceUpdateView()
        case "Stok Sayım":
            InventoryCountView()
        case "İşlem Geçmişi":
            TransactionHistoryView()
        case "Destek Log":
            SupportLogView()
        default:
            EmptyView()
        }
    }
}

// MARK: - Menu Action Card
struct MenuActionCard: View {
    let title: String
    let icon: String
    let accentColor: Color

    var body: some View {
        VStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(accentColor.opacity(0.15))
                    .frame(width: 52, height: 52)
                Image(systemName: icon)
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(accentColor)
            }
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(DS.textPrimary)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, minHeight: 112)
        .padding(.vertical, 16)
        .glassCard(cornerRadius: 18)
    }
}

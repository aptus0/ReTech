//
//  HomeView.swift
//  ReTech
//

import SwiftUI

struct HomeView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""
    @AppStorage("userName") private var userName: String = ""

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
        MenuItem(title: "Stok Listesi",     icon: "shippingbox.fill",             color: Color(hex: "10B981")),
        MenuItem(title: "Raporlar",         icon: "chart.pie.fill",               color: Color(hex: "8B5CF6")),
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
                Text("Hoş Geldiniz 👋")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(DS.textSecondary)
                Text(userName.isEmpty ? "ReTech Kullanıcısı" : userName)
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .foregroundColor(DS.textPrimary)
            }
            Spacer()
            if !authToken.isEmpty {
                Button {
                    withAnimation { 
                        authToken = "" 
                        userName = ""
                    }
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

    // MARK: - Hero Card (Glassmorphism & Gradients)
    private var heroCard: some View {
        ZStack(alignment: .topLeading) {
            // Gradient background
            LinearGradient(
                colors: [Color(hex: "FF8C00"), Color(hex: "E65100")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 164)
            .cornerRadius(24)
            .shadow(color: Color(hex: "FF8C00").opacity(0.45), radius: 15, x: 0, y: 8)

            // Decorative shapes for premium feel
            GeometryReader { geo in
                Circle()
                    .fill(Color.white.opacity(0.15))
                    .frame(width: 150, height: 150)
                    .blur(radius: 8)
                    .offset(x: geo.size.width - 60, y: -40)
                Circle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 90, height: 90)
                    .blur(radius: 6)
                    .offset(x: geo.size.width - 150, y: 80)
            }
            .clipped()
            .cornerRadius(24)

            // Content
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 6) {
                    Image(systemName: "bolt.shield.fill")
                        .font(.system(size: 14))
                        .foregroundColor(Color.white)
                    Text("ReTech Yönetim Sistemi")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(Color.white)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.white.opacity(0.2))
                .cornerRadius(12)

                Spacer()
                
                HStack(spacing: 24) {
                    statusPill(label: "Sunucu", value: serverURL.isEmpty ? "Bağlı Değil" : "Aktif", ok: !serverURL.isEmpty)
                    statusPill(label: "Oturum", value: authToken.isEmpty ? "Giriş Yok" : "Bağlı", ok: !authToken.isEmpty)
                }
            }
            .padding(20)
        }
    }

    private func statusPill(label: String, value: String, ok: Bool) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(Color.white.opacity(0.7))
            Text(value)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
        }
    }

    // MARK: - Modern Grid Actions
    private var quickActionsGrid: some View {
        LazyVGrid(columns: columns, spacing: 16) {
            ForEach(menuItems, id: \.title) { item in
                NavigationLink(destination: destination(for: item.title)) {
                    ZStack {
                        // Glassy card background
                        RoundedRectangle(cornerRadius: 20)
                            .fill(DS.surface)
                            .shadow(color: Color.black.opacity(0.04), radius: 8, y: 4)

                        VStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(item.color.opacity(0.12))
                                    .frame(width: 54, height: 54)
                                Image(systemName: item.icon)
                                    .font(.system(size: 24))
                                    .foregroundColor(item.color)
                            }
                            
                            Text(item.title)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(DS.textPrimary)
                        }
                        .padding(.vertical, 20)
                    }
                }
                .disabled(isMissingInfo && item.title != "Destek Log")
                .opacity((isMissingInfo && item.title != "Destek Log") ? 0.4 : 1.0)
            }
        }
    }

    @ViewBuilder
    private func destination(for title: String) -> some View {
        switch title {
        case "Ürün Sorgula": ProductInquiryView()
        case "Hızlı Etiket": ProductInquiryView()
        case "Barkod Çıkart": PrintQueueScannerView()
        case "Stok Sayım": InventoryCountView()
        case "Stok Listesi": InventoryListView()
        case "Raporlar": ReportsView()
        case "Fiyat Güncelle": PriceUpdateView()
        case "Ürün Ekle": ProductAddView()
        case "İşlem Geçmişi": TransactionHistoryView()
        case "Destek Log": SupportLogView()
        default: Text("Yapım Aşamasında")
        }
    }
}

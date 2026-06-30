import SwiftUI

struct HomeView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""
    
    let menuItems = [
        ("Ürün Sorgula", "magnifyingglass"),
        ("Barkod Okut", "barcode.viewfinder"),
        ("Barkod Çıkart", "printer"),
        ("Stok / Depo Kontrol", "shippingbox"),
        ("Sayım Yap", "list.clipboard"),
        ("Fiyat Güncelle", "dollarsign.circle"),
        ("Ürün Ekle", "plus.circle"),
        ("İşlem Geçmişi", "clock.arrow.circlepath")
    ]
    
    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var isMissingInfo: Bool {
        return serverURL.isEmpty || authToken.isEmpty
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                if isMissingInfo {
                    VStack(spacing: 12) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.orange)
                        Text("Bağlantı Kurulamadı")
                            .font(.headline)
                        Text("Şu anlık veri çekemiyoruz. Sunucu kapalı sanırım veya eşleştirme yapılmadı. Lütfen Ayarlar kısmından QR kod okutun.")
                            .font(.subheadline)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(12)
                    .padding()
                }

                LazyVGrid(columns: columns, spacing: 20) {
                    ForEach(menuItems, id: \.0) { item in
                        if item.0 == "Barkod Çıkart" {
                            NavigationLink(destination: PrintQueueScannerView()) {
                                MenuCard(item: item)
                            }
                        } else if item.0 == "Ürün Sorgula" || item.0 == "Barkod Okut" {
                            NavigationLink(destination: ProductInquiryView()) {
                                MenuCard(item: item)
                            }
                        } else if item.0 == "Ürün Ekle" {
                            NavigationLink(destination: ProductAddView()) {
                                MenuCard(item: item)
                            }
                        } else if item.0 == "Fiyat Güncelle" {
                            NavigationLink(destination: PriceUpdateView()) {
                                MenuCard(item: item)
                            }
                        } else if item.0 == "Stok / Depo Kontrol" || item.0 == "Sayım Yap" {
                            NavigationLink(destination: InventoryCountView()) {
                                MenuCard(item: item)
                            }
                        } else if item.0 == "İşlem Geçmişi" {
                            NavigationLink(destination: TransactionHistoryView()) {
                                MenuCard(item: item)
                            }
                        } else {
                            MenuCard(item: item)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Re Tech Terminal")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if !isMissingInfo {
                        Button(action: {
                            authToken = ""
                        }) {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                                .foregroundColor(.red)
                        }
                    }
                }
            }
        }
    }
}

struct MenuCard: View {
    let item: (String, String)
    var body: some View {
        VStack {
            Image(systemName: item.1)
                .font(.system(size: 30))
                .foregroundColor(.blue)
                .padding(.bottom, 5)
            Text(item.0)
                .font(.caption)
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)
                .foregroundColor(.primary)
        }
        .frame(maxWidth: .infinity, minHeight: 100)
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(15)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

#Preview {
    HomeView()
}

//
//  TransactionHistoryView.swift
//  Envanzo
//

import SwiftUI

struct TransactionItem: Codable, Identifiable {
    let id: Int
    let type: String
    let quantity: Int
    let notes: String?
    let date: String
    let product_name: String
    let barcode: String
}

struct TransactionsResponse: Codable {
    let success: Bool
    let transactions: [TransactionItem]
}

struct TransactionHistoryView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""

    @State private var transactions: [TransactionItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            if isLoading && transactions.isEmpty {
                rtLoadingView(message: "İşlemler Yükleniyor...")
            } else if let err = errorMessage {
                errorView(err)
            } else if transactions.isEmpty {
                emptyView
            } else {
                transactionList
            }
        }
        .navigationTitle("İşlem Geçmişi")
        .darkNavBar()
        .onAppear { fetchTransactions() }
    }

    // MARK: Error
    private func errorView(_ msg: String) -> some View {
        VStack(spacing: 18) {
            ZStack {
                Circle().fill(DS.error.opacity(0.14)).frame(width: 80, height: 80)
                Image(systemName: "wifi.exclamationmark").font(.system(size: 36)).foregroundColor(DS.error)
            }
            Text(msg).font(.system(size: 14)).foregroundColor(DS.textSecondary)
                .multilineTextAlignment(.center).padding(.horizontal, 40)
            Button("Tekrar Dene") { fetchTransactions() }
                .buttonStyle(PrimaryButtonStyle()).padding(.horizontal, 60)
        }
    }

    // MARK: Empty
    private var emptyView: some View {
        VStack(spacing: 14) {
            Image(systemName: "clock").font(.system(size: 48)).foregroundColor(DS.textTertiary)
            Text("Henüz İşlem Yok").font(.system(size: 18, weight: .semibold)).foregroundColor(DS.textPrimary)
            Text("Yapılan tüm stok işlemleri burada görünür.")
                .font(.system(size: 14)).foregroundColor(DS.textSecondary)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: List
    private var transactionList: some View {
        ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 10) {
                HStack {
                    Text("\(transactions.count) işlem")
                        .font(.system(size: 13)).foregroundColor(DS.textSecondary)
                    Spacer()
                    Button {
                        fetchTransactions()
                    } label: {
                        HStack(spacing: 5) {
                            Image(systemName: "arrow.clockwise").font(.system(size: 12))
                            Text("Yenile").font(.system(size: 12))
                        }
                        .foregroundColor(DS.primary)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)

                ForEach(transactions) { t in
                    TransactionRow(item: t)
                        .padding(.horizontal, 20)
                }

                Spacer(minLength: 90)
            }
        }
    }

    // MARK: Network
    private func fetchTransactions() {
        isLoading = true; errorMessage = nil
        var base = serverURL
        if !base.hasPrefix("http") { base = "http://" + base }
        guard let url = URL(string: "\(base)/api/mobile/transactions") else {
            errorMessage = "Geçersiz sunucu adresi."; isLoading = false; return
        }
        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty { req.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization") }
        NetworkManager.shared.session.dataTask(with: req) { data, resp, error in
            DispatchQueue.main.async {
                self.isLoading = false
                if let e = error { self.errorMessage = "Bağlantı hatası: \(e.localizedDescription)"; return }
                guard let http = resp as? HTTPURLResponse, let data = data else { self.errorMessage = "Geçersiz yanıt."; return }
                if http.statusCode == 200 {
                    if let r = try? JSONDecoder().decode(TransactionsResponse.self, from: data) {
                        self.transactions = r.transactions
                    } else { self.errorMessage = "Veri okunamadı." }
                } else { self.errorMessage = "Sunucu hatası (\(http.statusCode))." }
            }
        }.resume()
    }
}

// MARK: - Transaction Row Card
struct TransactionRow: View {
    let item: TransactionItem
    private var isIn: Bool { item.type == "in" }

    var body: some View {
        HStack(spacing: 14) {
            // Icon
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill((isIn ? DS.success : DS.error).opacity(0.14))
                    .frame(width: 46, height: 46)
                Image(systemName: isIn ? "arrow.down.left.circle.fill" : "arrow.up.right.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(isIn ? DS.success : DS.error)
            }

            // Info
            VStack(alignment: .leading, spacing: 3) {
                Text(item.product_name)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(DS.textPrimary)
                    .lineLimit(1)
                Text(item.barcode)
                    .font(.system(size: 11))
                    .foregroundColor(DS.textTertiary)
                Text(item.date)
                    .font(.system(size: 11))
                    .foregroundColor(DS.accent.opacity(0.75))
            }

            Spacer()

            // Amount
            VStack(alignment: .trailing, spacing: 3) {
                Text("\(isIn ? "+" : "-")\(item.quantity)")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(isIn ? DS.success : DS.error)
                if let notes = item.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.system(size: 10))
                        .foregroundColor(DS.textTertiary)
                        .lineLimit(1)
                }
            }
        }
        .padding(14)
        .glassCard(cornerRadius: 16)
    }
}

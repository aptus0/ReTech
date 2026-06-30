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
        VStack {
            if isLoading && transactions.isEmpty {
                ProgressView("İşlemler Yükleniyor...")
                    .padding()
            } else if let error = errorMessage {
                VStack {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.red)
                    Text(error)
                        .multilineTextAlignment(.center)
                        .padding()
                    Button("Tekrar Dene") { fetchTransactions() }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            } else if transactions.isEmpty {
                VStack {
                    Image(systemName: "clock")
                        .font(.largeTitle)
                        .foregroundColor(.gray)
                    Text("Henüz bir işlem bulunmuyor.")
                        .foregroundColor(.gray)
                        .padding()
                }
            } else {
                List(transactions) { t in
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(t.product_name)
                                .font(.headline)
                            Text(t.barcode)
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text(t.date)
                                .font(.caption2)
                                .foregroundColor(.blue)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            HStack {
                                Image(systemName: t.type == "in" ? "arrow.down.left.circle.fill" : "arrow.up.right.circle.fill")
                                    .foregroundColor(t.type == "in" ? .green : .red)
                                Text("\(t.type == "in" ? "+" : "-")\(t.quantity)")
                                    .font(.subheadline)
                                    .bold()
                                    .foregroundColor(t.type == "in" ? .green : .red)
                            }
                            if let notes = t.notes, !notes.isEmpty {
                                Text(notes)
                                    .font(.caption2)
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                .refreshable {
                    fetchTransactions()
                }
            }
        }
        .navigationTitle("İşlem Geçmişi")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            fetchTransactions()
        }
    }
    
    private func fetchTransactions() {
        isLoading = true
        errorMessage = nil
        
        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        
        guard let url = URL(string: "\(baseURL)/api/mobile/transactions") else {
            errorMessage = "Geçersiz sunucu adresi."
            isLoading = false
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
                        let result = try JSONDecoder().decode(TransactionsResponse.self, from: data)
                        self.transactions = result.transactions
                    } catch {
                        self.errorMessage = "Veri okunamadı."
                    }
                } else {
                    self.errorMessage = "Sunucu hatası (\(httpResponse.statusCode))."
                }
            }
        }.resume()
    }
}

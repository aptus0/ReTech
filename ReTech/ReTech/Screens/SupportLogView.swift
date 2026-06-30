import SwiftUI

struct SupportLogView: View {
    @ObservedObject var logService = SupportLogService.shared
    
    var body: some View {
        List {
            if logService.logs.isEmpty {
                Text("Henüz bir kayıt yok.")
                    .foregroundColor(.gray)
                    .italic()
            } else {
                ForEach(logService.logs) { log in
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text(log.type.rawValue)
                                .font(.caption)
                                .fontWeight(.bold)
                                .padding(4)
                                .background(colorForType(log.type).opacity(0.2))
                                .foregroundColor(colorForType(log.type))
                                .cornerRadius(4)
                            
                            Spacer()
                            
                            Text(log.timestamp, style: .time)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        
                        Text(log.message)
                            .font(.subheadline)
                            .foregroundColor(.primary)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .navigationTitle("Destek & Log")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Temizle") {
                    logService.clearLogs()
                }
                .foregroundColor(.red)
            }
        }
    }
    
    private func colorForType(_ type: LogType) -> Color {
        switch type {
        case .error: return .red
        case .network: return .blue
        case .info: return .gray
        case .success: return .green
        }
    }
}

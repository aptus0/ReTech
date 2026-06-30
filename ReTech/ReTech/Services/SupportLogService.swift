import Foundation
import Combine
import SwiftUI

struct LogEntry: Identifiable {
    let id = UUID()
    let timestamp: Date
    let type: LogType
    let message: String
}

enum LogType: String {
    case error = "Hata"
    case network = "Ağ"
    case info = "Bilgi"
    case success = "Başarılı"
}

class SupportLogService: ObservableObject {
    static let shared = SupportLogService()
    
    @Published var logs: [LogEntry] = []
    
    private init() {}
    
    func addLog(type: LogType, message: String) {
        DispatchQueue.main.async {
            let entry = LogEntry(timestamp: Date(), type: type, message: message)
            self.logs.insert(entry, at: 0) // En yeni log en üstte
            
            // Performans için 100 logdan sonrasını silebiliriz
            if self.logs.count > 100 {
                self.logs.removeLast()
            }
        }
    }
    
    func clearLogs() {
        DispatchQueue.main.async {
            self.logs.removeAll()
        }
    }
}

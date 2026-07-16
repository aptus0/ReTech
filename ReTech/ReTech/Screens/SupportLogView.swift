//
//  SupportLogView.swift
//  Envanzo
//

import SwiftUI

struct SupportLogView: View {
    @ObservedObject var logService = SupportLogService.shared

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            if logService.logs.isEmpty {
                emptyView
            } else {
                logList
            }
        }
        .navigationTitle("Destek & Log")
        .darkNavBar()
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    withAnimation { logService.clearLogs() }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "trash")
                        Text("Temizle")
                    }
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(DS.error)
                }
            }
        }
    }

    // MARK: Empty
    private var emptyView: some View {
        VStack(spacing: 14) {
            Image(systemName: "terminal").font(.system(size: 48)).foregroundColor(DS.textTertiary)
            Text("Kayıt Yok").font(.system(size: 18, weight: .semibold)).foregroundColor(DS.textPrimary)
            Text("Uygulama kayıtları burada görünür.")
                .font(.system(size: 13)).foregroundColor(DS.textSecondary)
        }
    }

    // MARK: Log List
    private var logList: some View {
        ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 8) {
                ForEach(logService.logs) { log in
                    LogRow(log: log)
                        .padding(.horizontal, 20)
                }
                Spacer(minLength: 90)
            }
            .padding(.top, 12)
        }
    }
}

// MARK: - Log Row
struct LogRow: View {
    let log: LogEntry

    private var typeColor: Color {
        switch log.type {
        case .error:   return DS.error
        case .network: return DS.accent
        case .success: return DS.success
        case .info:    return DS.textSecondary
        }
    }

    private var typeIcon: String {
        switch log.type {
        case .error:   return "xmark.circle.fill"
        case .network: return "wifi"
        case .success: return "checkmark.circle.fill"
        case .info:    return "info.circle.fill"
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Type badge
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(typeColor.opacity(0.14))
                    .frame(width: 34, height: 34)
                Image(systemName: typeIcon)
                    .font(.system(size: 15))
                    .foregroundColor(typeColor)
            }

            // Message
            VStack(alignment: .leading, spacing: 4) {
                HStack(alignment: .center) {
                    Text(log.type.rawValue.uppercased())
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(typeColor)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(typeColor.opacity(0.12))
                        .cornerRadius(4)
                    Spacer()
                    Text(log.timestamp, style: .time)
                        .font(.system(size: 11))
                        .foregroundColor(DS.textTertiary)
                }
                Text(log.message)
                    .font(.system(size: 13))
                    .foregroundColor(DS.textPrimary)
                    .lineLimit(4)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(12)
        .glassCard(cornerRadius: 14)
    }
}

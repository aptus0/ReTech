//
//  DesignSystem.swift
//  ReTech — Merkezi tasarım sistemi / design tokens
//

import SwiftUI

// MARK: - Design System Tokens
enum DS {
    // Old dark theme base removed
    // MARK: Brand
    static let primary     = Color(hex: "F97316")  // orange-500
    static let secondary   = Color(hex: "EA580C")  // orange-600
    static let accent      = Color(hex: "FCD34D")  // amber-300

    // MARK: Base
    static let bg          = Color(hex: "F8FAFC") // slate-50
    static let surface     = Color(hex: "FFFFFF") // white
    static let surface2    = Color(hex: "F1F5F9") // slate-100

    // MARK: Text
    static let textPrimary   = Color(hex: "0F172A") // slate-900
    static let textSecondary = Color(hex: "475569") // slate-600
    static let textTertiary  = Color(hex: "94A3B8") // slate-400

    // MARK: Border
    static let border      = Color(hex: "E2E8F0") // slate-200

    // MARK: Semantics
    static let success     = Color(hex: "10B981")
    static let warning     = Color(hex: "F59E0B")
    static let error       = Color(hex: "EF4444")

    // MARK: Gradients
    static let primaryGradient = LinearGradient(
        colors: [Color(hex: "EA580C"), Color(hex: "F97316")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    static let heroGradient = LinearGradient(
        colors: [Color(hex: "C2410C"), Color(hex: "EA580C"), Color(hex: "F97316")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    static let successGradient = LinearGradient(
        colors: [Color(hex: "059669"), Color(hex: "10B981")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

// MARK: - Color Hex Init
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:  (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:  (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB,
                  red: Double(r) / 255,
                  green: Double(g) / 255,
                  blue: Double(b) / 255,
                  opacity: Double(a) / 255)
    }
}

// MARK: - GlassCard ViewModifier
struct GlassCardModifier: ViewModifier {
    let cornerRadius: CGFloat

    func body(content: Content) -> some View {
        content
            .background(DS.surface)
            .cornerRadius(cornerRadius)
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(DS.border, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 10, x: 0, y: 4)
    }
}

extension View {
    func glassCard(cornerRadius: CGFloat = 20) -> some View {
        modifier(GlassCardModifier(cornerRadius: cornerRadius))
    }
    func rtBg() -> some View {
        background(DS.bg.ignoresSafeArea())
    }
}

// MARK: - PrimaryButtonStyle
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(DS.primaryGradient.opacity(configuration.isPressed ? 0.75 : 1.0))
            .foregroundColor(.white)
            .cornerRadius(16)
            .shadow(color: DS.primary.opacity(0.35), radius: 12, x: 0, y: 6)
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - DarkTextField ViewModifier
struct DarkTextFieldStyle: ViewModifier {
    var focused: Bool = false
    func body(content: Content) -> some View {
        content
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(DS.surface)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(focused ? DS.primary.opacity(0.5) : DS.border, lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.02), radius: 4, x: 0, y: 2)
            .cornerRadius(14)
    }
}

extension View {
    func darkField(focused: Bool = false) -> some View {
        modifier(DarkTextFieldStyle(focused: focused))
    }
}

// MARK: - Shared Inline NavBar Modifier
struct DarkNavBar: ViewModifier {
    func body(content: Content) -> some View {
        content
            .navigationBarTitleDisplayMode(.inline)
    }
}

extension View {
    func darkNavBar() -> some View { modifier(DarkNavBar()) }
}

// MARK: - Status Banner
struct StatusBanner: View {
    let message: String
    let isSuccess: Bool
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: isSuccess ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                .foregroundColor(isSuccess ? DS.success : DS.error)
            Text(message)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(isSuccess ? DS.success : DS.error)
            Spacer()
        }
        .padding(14)
        .background((isSuccess ? DS.success : DS.error).opacity(0.12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke((isSuccess ? DS.success : DS.error).opacity(0.25), lineWidth: 1)
        )
        .cornerRadius(12)
    }
}

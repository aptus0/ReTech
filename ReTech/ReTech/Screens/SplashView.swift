//
//  SplashView.swift
//  ReTech
//

import SwiftUI

struct SplashView: View {
    @Binding var isShowingSplash: Bool

    @State private var logoScale: CGFloat = 0.4
    @State private var logoOpacity: Double = 0
    @State private var glowOpacity: Double = 0
    @State private var textOpacity: Double = 0
    @State private var taglineOpacity: Double = 0

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            // Radial glow — orange
            RadialGradient(
                colors: [DS.primary.opacity(0.40), DS.secondary.opacity(0.18), DS.bg],
                center: .center,
                startRadius: 5,
                endRadius: 380
            )
            .ignoresSafeArea()
            .opacity(glowOpacity)

            VStack(spacing: 24) {
                // Logo block
                ZStack {
                    // Outer halo
                    Circle()
                        .fill(DS.primary.opacity(0.22))
                        .frame(width: 150, height: 150)
                        .blur(radius: 28)

                    // Main icon card
                    RoundedRectangle(cornerRadius: 28)
                        .fill(DS.primaryGradient)
                        .frame(width: 96, height: 96)
                        .shadow(color: DS.primary.opacity(0.7), radius: 28, x: 0, y: 14)

                    // Flame / brand icon
                    Image(systemName: "flame.fill")
                        .font(.system(size: 46, weight: .bold))
                        .foregroundColor(.white)
                }
                .scaleEffect(logoScale)
                .opacity(logoOpacity)

                // App name
                VStack(spacing: 7) {
                    Text("Öz Turuncu")
                        .font(.system(size: 34, weight: .heavy, design: .rounded))
                        .foregroundColor(DS.textPrimary)
                        .opacity(textOpacity)

                    Text("STOK & YÖNETİM")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(DS.textSecondary)
                        .opacity(taglineOpacity)
                }

                // Loading dots
                HStack(spacing: 7) {
                    ForEach(0..<3, id: \.self) { i in
                        Circle()
                            .fill(DS.primary.opacity(0.5 + Double(i) * 0.17))
                            .frame(width: 6, height: 6)
                    }
                }
                .opacity(taglineOpacity)
            }
        }
        .onAppear {
            // Spring logo pop — fast
            withAnimation(.spring(response: 0.5, dampingFraction: 0.60)) {
                logoScale   = 1.0
                logoOpacity = 1.0
            }
            withAnimation(.easeIn(duration: 0.3).delay(0.15)) {
                glowOpacity = 1.0
            }
            withAnimation(.easeIn(duration: 0.3).delay(0.28)) {
                textOpacity = 1.0
            }
            withAnimation(.easeIn(duration: 0.25).delay(0.42)) {
                taglineOpacity = 1.0
            }
            // Total splash: ~1.4 s
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
                withAnimation(.easeInOut(duration: 0.35)) {
                    isShowingSplash = false
                }
            }
        }
    }
}

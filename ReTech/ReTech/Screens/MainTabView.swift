//
//  MainTabView.swift
//  Envanzo
//

import SwiftUI

struct MainTabView: View {
    @AppStorage("authToken") private var authToken: String = ""
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            DS.bg.ignoresSafeArea().frame(height: 0) // Keep background color if needed, but not necessary.


            // Tab Content
            Group {
                switch selectedTab {
                case 0:
                    NavigationView { HomeView() }
                        .navigationViewStyle(.stack)
                        .transition(.opacity)
                case 1:
                    NavigationView { ProductInquiryView() }
                        .navigationViewStyle(.stack)
                        .transition(.opacity)
                default:
                    NavigationView { ServerSettingsView() }
                        .navigationViewStyle(.stack)
                        .transition(.opacity)
                }
            }
            .animation(.easeInOut(duration: 0.2), value: selectedTab)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(DS.bg)

            // Custom Tab Bar
            RTTabBar(selectedTab: $selectedTab)
        }
        .ignoresSafeArea(.keyboard)
    }
}

// MARK: - Custom Tab Bar
struct RTTabBar: View {
    @Binding var selectedTab: Int

    private let tabs: [(icon: String, active: String, label: String)] = [
        ("house",           "house.fill",                  "Ana Sayfa"),
        ("magnifyingglass", "magnifyingglass.circle.fill",  "Sorgula"),
        ("gearshape",       "gearshape.fill",               "Ayarlar")
    ]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(tabs.indices, id: \.self) { i in
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.72)) {
                        selectedTab = i
                    }
                } label: {
                    VStack(spacing: 5) {
                        ZStack {
                            if selectedTab == i {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(DS.primary.opacity(0.18))
                                    .frame(width: 44, height: 30)
                                    .matchedGeometryEffect(id: "tabPill", in: tabNS)
                            }
                            Image(systemName: selectedTab == i ? tabs[i].active : tabs[i].icon)
                                .font(.system(size: 20, weight: selectedTab == i ? .semibold : .regular))
                                .foregroundColor(selectedTab == i ? DS.primary : DS.textTertiary)
                                .scaleEffect(selectedTab == i ? 1.05 : 1.0)
                        }
                        .frame(width: 44, height: 30)

                        Text(tabs[i].label)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(selectedTab == i ? DS.primary : DS.textTertiary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                }
            }
        }
        .padding(.horizontal, 12)
        .background(
            ZStack {
                DS.surface.ignoresSafeArea()
                VStack {
                    DS.border
                        .frame(height: 1)
                    Spacer()
                }
            }
        )
        .overlay(alignment: .top) {
            Rectangle()
                .frame(height: 1)
                .foregroundColor(DS.border)
        }
    }

    @Namespace private var tabNS
}

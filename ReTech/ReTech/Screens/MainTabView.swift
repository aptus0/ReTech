import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Ana Sayfa", systemImage: "house")
                }
            
            ServerSettingsView()
                .tabItem {
                    Label("Ayarlar", systemImage: "gearshape")
                }
        }
    }
}

#Preview {
    MainTabView()
}

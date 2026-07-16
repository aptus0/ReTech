//
//  ContentView.swift
//  Envanzo
//

import SwiftUI

struct ContentView: View {
    @AppStorage("authToken") private var authToken: String = ""

    var body: some View {
        Group {
            if authToken.isEmpty {
                LoginView()
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.2), value: authToken.isEmpty)
    }
}

#Preview {
    ContentView()
}

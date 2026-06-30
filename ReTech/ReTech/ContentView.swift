//
//  ContentView.swift
//  ReTech
//

import SwiftUI

struct ContentView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""
    
    @State private var isShowingSplash = true

    var body: some View {
        Group {
            if isShowingSplash {
                SplashView(isShowingSplash: $isShowingSplash)
            } else {
                MainTabView()
            }
        }
    }
}

#Preview {
    ContentView()
}

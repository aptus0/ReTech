//
//  ReTechApp.swift
//  ReTech
//

import SwiftUI

@main
struct ReTechApp: App {

    init() {
        configureNavigationBarAppearance()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }

    // MARK: - Dark Nav Bar (iOS 13+ compatible)
    private func configureNavigationBarAppearance() {
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1)
        appearance.titleTextAttributes = [.foregroundColor: UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1)]
        appearance.largeTitleTextAttributes = [.foregroundColor: UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1)]
        let backItem = UIBarButtonItemAppearance()
        backItem.normal.titleTextAttributes = [.foregroundColor: UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1)]
        appearance.backButtonAppearance = backItem

        UINavigationBar.appearance().standardAppearance   = appearance
        UINavigationBar.appearance().compactAppearance    = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        UINavigationBar.appearance().tintColor = UIColor(red: 249/255, green: 115/255, blue: 22/255, alpha: 1) // #F97316 orange
    }
}

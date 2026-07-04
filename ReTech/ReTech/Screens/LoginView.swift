//
//  LoginView.swift
//  ReTech
//

import SwiftUI

struct LoginView: View {
    @AppStorage("authToken") private var authToken: String = ""

    @State private var email    = ""
    @State private var password = ""
    @State private var isLoggingIn  = false
    @State private var errorMessage = ""
    @FocusState private var focus: Field?

    enum Field { case email, password }

    var body: some View {
        ZStack {
            DS.bg.ignoresSafeArea()

            // Ambient glow
            RadialGradient(
                colors: [DS.primary.opacity(0.22), DS.secondary.opacity(0.12), DS.bg],
                center: .init(x: 0.5, y: 0.18),
                startRadius: 0,
                endRadius: 420
            )
            .ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    Spacer(minLength: 56)

                    // Logo
                    VStack(spacing: 18) {
                        ZStack {
                            Circle()
                                .fill(DS.primary.opacity(0.18))
                                .frame(width: 110, height: 110)
                                .blur(radius: 24)
                            RoundedRectangle(cornerRadius: 24)
                                .fill(DS.primaryGradient)
                                .frame(width: 80, height: 80)
                                .shadow(color: DS.primary.opacity(0.5), radius: 20, x: 0, y: 10)
                            Text("R")
                                .font(.system(size: 44, weight: .black, design: .rounded))
                                .foregroundColor(.white)
                        }
                        VStack(spacing: 5) {
                            Text("Öz Turuncu")
                                .font(.system(size: 28, weight: .bold, design: .rounded))
                                .foregroundColor(DS.textPrimary)
                            Text("Hesabınıza giriş yapın")
                                .font(.system(size: 15))
                                .foregroundColor(DS.textSecondary)
                        }
                    }

                    Spacer(minLength: 40)

                    // Form card
                    VStack(spacing: 18) {
                        // Email field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("E-posta / Kullanıcı Adı")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(DS.textSecondary)
                            HStack(spacing: 12) {
                                Image(systemName: "person")
                                    .foregroundColor(focus == .email ? DS.primary : DS.textTertiary)
                                    .font(.system(size: 16))
                                    .frame(width: 20)
                                TextField("",
                                          text: $email,
                                          prompt: Text("ad@sirket.com")
                                    .foregroundColor(DS.textTertiary))
                                .foregroundColor(.white)
                                .autocorrectionDisabled()
                                .textInputAutocapitalization(.never)
                                .keyboardType(.emailAddress)
                                .focused($focus, equals: .email)
                            }
                            .darkField(focused: focus == .email)
                        }

                        // Password field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Şifre")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(DS.textSecondary)
                            HStack(spacing: 12) {
                                Image(systemName: "lock")
                                    .foregroundColor(focus == .password ? DS.primary : DS.textTertiary)
                                    .font(.system(size: 16))
                                    .frame(width: 20)
                                SecureField("",
                                            text: $password,
                                            prompt: Text("••••••••")
                                    .foregroundColor(DS.textTertiary))
                                .foregroundColor(.white)
                                .focused($focus, equals: .password)
                            }
                            .darkField(focused: focus == .password)
                        }

                        // Error
                        if !errorMessage.isEmpty {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.circle.fill")
                                    .font(.system(size: 14))
                                    .foregroundColor(DS.error)
                                Text(errorMessage)
                                    .font(.system(size: 13))
                                    .foregroundColor(DS.error)
                                Spacer()
                            }
                            .padding(.horizontal, 4)
                        }

                        // Login button
                        Button(action: login) {
                            if isLoggingIn {
                                HStack(spacing: 10) {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.9)
                                    Text("Giriş Yapılıyor...")
                                }
                            } else {
                                Text("Giriş Yap")
                            }
                        }
                        .buttonStyle(PrimaryButtonStyle())
                        .disabled(isLoggingIn || email.isEmpty || password.isEmpty)
                        .opacity((isLoggingIn || email.isEmpty || password.isEmpty) ? 0.55 : 1)
                        .padding(.top, 4)
                    }
                    .padding(22)
                    .glassCard(cornerRadius: 22)

                    Spacer(minLength: 28)

                    // Server reset
                    Button {
                        UserDefaults.standard.set("", forKey: "serverURL")
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "arrow.backward.circle")
                                .font(.system(size: 14))
                            Text("Sunucu Ayarlarını Değiştir")
                                .font(.system(size: 14))
                        }
                        .foregroundColor(DS.textSecondary)
                    }

                    Spacer(minLength: 48)
                }
                .padding(.horizontal, 24)
            }
        }
    }

    private func login() {
        isLoggingIn = true
        errorMessage = ""
        focus = nil

        AuthService.shared.login(email: email, password: password) { result in
            isLoggingIn = false
            switch result {
            case .success(let response):
                if response.success, let token = response.token {
                    authToken = token
                } else {
                    errorMessage = response.message ?? "Giriş başarısız."
                }
            case .failure(let error):
                errorMessage = "Bağlantı hatası: \(error.localizedDescription)"
            }
        }
    }
}

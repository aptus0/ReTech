import SwiftUI

struct LoginView: View {
    @AppStorage("authToken") private var authToken: String = ""
    
    @State private var email = ""
    @State private var password = ""
    @State private var isLoggingIn = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Giriş Yap")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                TextField("E-posta / Kullanıcı Adı", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .autocapitalization(.none)
                    .keyboardType(.emailAddress)
                
                SecureField("Şifre", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                if !errorMessage.isEmpty {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.footnote)
                }
                
                Button(action: login) {
                    if isLoggingIn {
                        ProgressView()
                    } else {
                        Text("Giriş Yap")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }
                }
                .disabled(isLoggingIn || email.isEmpty || password.isEmpty)
                
                Spacer()
                
                Button(action: {
                    UserDefaults.standard.set("", forKey: "serverURL")
                }) {
                    Text("Server Ayarlarını Değiştir")
                        .foregroundColor(.gray)
                }
            }
            .padding()
            .navigationBarHidden(true)
        }
    }
    
    private func login() {
        isLoggingIn = true
        errorMessage = ""
        
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
                errorMessage = "Giriş yapılamadı: \(error.localizedDescription)"
            }
        }
    }
}

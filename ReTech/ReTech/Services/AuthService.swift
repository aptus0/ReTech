import Foundation

struct LoginResponse: Codable {
    let success: Bool
    let token: String?
    let user: User?
    let message: String?
}

class AuthService {
    static let shared = AuthService()
    
    func login(email: String, password: String, completion: @escaping (Result<LoginResponse, Error>) -> Void) {
        let parameters = ["email": email, "password": password]
        guard let postData = try? JSONSerialization.data(withJSONObject: parameters) else {
            completion(.failure(NSError(domain: "AuthService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid parameters"])))
            return
        }
        
        APIClient.shared.request(endpoint: "/login", method: "POST", body: postData) { (result: Result<LoginResponse, Error>) in
            completion(result)
        }
    }
}

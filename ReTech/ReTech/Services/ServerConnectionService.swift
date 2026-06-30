import Foundation

class ServerConnectionService {
    static let shared = ServerConnectionService()
    
    func testConnection(url: String, completion: @escaping (Result<PingResponse, Error>) -> Void) {
        let cleanURL = url.hasSuffix("/") ? String(url.dropLast()) : url
        guard let requestURL = URL(string: "\(cleanURL)/api/mobile/ping") else {
            completion(.failure(NSError(domain: "ServerConnection", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
            return
        }
        
        var request = URLRequest(url: requestURL)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 15.0
        
        NetworkManager.shared.session.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async { completion(.failure(error)) }
                return
            }
            
            guard let data = data else {
                DispatchQueue.main.async { completion(.failure(NSError(domain: "ServerConnection", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data received"]))) }
                return
            }
            
            DispatchQueue.main.async {
                do {
                    let decoded = try JSONDecoder().decode(PingResponse.self, from: data)
                    completion(.success(decoded))
                } catch {
                    completion(.failure(error))
                }
            }
        }.resume()
    }
}

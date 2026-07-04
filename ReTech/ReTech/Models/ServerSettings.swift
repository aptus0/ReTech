import Foundation

enum ServerSettings {
    static func normalizedBaseURL(_ rawURL: String, port: String? = nil) -> String {
        let trimmedURL = rawURL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedURL.isEmpty else { return "" }
        
        let lowercasedURL = trimmedURL.lowercased()
        let urlWithScheme = lowercasedURL.hasPrefix("http://") || lowercasedURL.hasPrefix("https://")
            ? trimmedURL
            : "http://\(trimmedURL)"
        
        guard var components = URLComponents(string: urlWithScheme) else {
            var finalStr = urlWithScheme
            if finalStr.hasSuffix("/") { finalStr.removeLast() }
            if finalStr.hasSuffix("/api") { finalStr = String(finalStr.dropLast(4)) }
            return finalStr
        }
        
        if components.port == nil,
           let port,
           let portNumber = Int(port),
           portNumber > 0 {
            let scheme = components.scheme?.lowercased()
            let isDefaultPort = (scheme == "http" && portNumber == 80) || (scheme == "https" && portNumber == 443)
            if !isDefaultPort {
                components.port = portNumber
            }
        }
        
        var normalizedURL = components.url?.absoluteString ?? urlWithScheme
        if normalizedURL.hasSuffix("/") { normalizedURL.removeLast() }
        if normalizedURL.hasSuffix("/api") { normalizedURL = String(normalizedURL.dropLast(4)) }
        return normalizedURL
    }
}

struct PingResponse: Codable {
    let success: Bool
    let app: String?
    let server: String?
    let version: String?
    let time: String?
    let uptime: String?
    let message: String?
    let error: String?
    let status: String?
}

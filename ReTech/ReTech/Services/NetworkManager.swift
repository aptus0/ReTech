import Foundation

class NetworkManager {
    static let shared = NetworkManager()
    
    let session: URLSession
    
    private init() {
        let configuration = URLSessionConfiguration.default
        // Disable proxy completely to fix NSURLErrorDomain: -1003 delays
        configuration.connectionProxyDictionary = [:]
        configuration.timeoutIntervalForRequest = 10.0
        configuration.timeoutIntervalForResource = 30.0
        
        self.session = URLSession(configuration: configuration)
    }
}

import Foundation

struct PingResponse: Codable {
    let success: Bool
    let app: String?
    let server: String?
    let version: String?
    let time: String?
}

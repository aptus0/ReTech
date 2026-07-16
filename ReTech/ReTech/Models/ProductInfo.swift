//
//  ProductInfo.swift
//  Envanzo
//

import Foundation

struct ProductInfo: Codable, Identifiable {
    let id: Int
    let name: String
    let barcode: String?
    let code: String?
    let sale_price: Double
    let current_stock: Int?
    let stock_quantity: Int?
    let image: String?
    let purchase_price: Double?

    enum CodingKeys: String, CodingKey {
        case id, name, barcode, code, sale_price, current_stock, stock_quantity, image, purchase_price
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        barcode = try container.decodeIfPresent(String.self, forKey: .barcode)
        code = try container.decodeIfPresent(String.self, forKey: .code)
        current_stock = try container.decodeIfPresent(Int.self, forKey: .current_stock)
        stock_quantity = try container.decodeIfPresent(Int.self, forKey: .stock_quantity)
        image = try container.decodeIfPresent(String.self, forKey: .image)

        if let pPriceDouble = try? container.decode(Double.self, forKey: .purchase_price) {
            purchase_price = pPriceDouble
        } else if let pPriceString = try? container.decode(String.self, forKey: .purchase_price),
                  let pPriceDouble = Double(pPriceString) {
            purchase_price = pPriceDouble
        } else {
            purchase_price = nil
        }

        if let priceDouble = try? container.decode(Double.self, forKey: .sale_price) {
            sale_price = priceDouble
        } else if let priceString = try? container.decode(String.self, forKey: .sale_price),
                  let priceDouble = Double(priceString) {
            sale_price = priceDouble
        } else {
            sale_price = 0.0
        }
    }
}

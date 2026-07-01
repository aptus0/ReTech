import SwiftUI
import UIKit

struct CategoryModel: Codable, Hashable {
    let id: Int
    let name: String
}

struct BrandModel: Codable, Hashable {
    let id: Int
    let name: String
}

struct FormDataResponse: Codable {
    let success: Bool
    let categories: [CategoryModel]
    let brands: [BrandModel]
}

struct ProductAddView: View {
    @AppStorage("serverURL") private var serverURL: String = ""
    @AppStorage("authToken") private var authToken: String = ""
    
    @State private var isScanning = true
    @State private var barcode: String = ""
    
    @State private var name: String = ""
    @State private var salePrice: String = ""
    @State private var stockQuantity: String = "1"
    
    @State private var categories: [CategoryModel] = []
    @State private var brands: [BrandModel] = []
    @State private var selectedCategoryId: Int?
    @State private var selectedBrandId: Int?
    
    @State private var selectedImage: UIImage? = nil
    @State private var isShowingImagePicker = false
    
    @State private var isSaving = false
    @State private var isFetchingForm = false
    @State private var errorMessage: String?
    @State private var successMessage: String?
    
    var body: some View {
        ZStack {
            if isScanning {
                ScannerView { code in
                    barcode = code
                    isScanning = false
                    fetchFormData()
                }
                .edgesIgnoringSafeArea(.all)
                
                VStack {
                    Spacer()
                    Text("Önce Eklenecek Ürünün Barkodunu Okutun")
                        .font(.headline)
                        .padding()
                        .background(Color.black.opacity(0.7))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .padding(.bottom, 40)
                }
            } else {
                Form {
                    Section(header: Text("Barkod Bilgisi")) {
                        HStack {
                            Text(barcode)
                                .font(.headline)
                            Spacer()
                            Button("Yeniden Okut") {
                                barcode = ""
                                isScanning = true
                            }
                            .foregroundColor(.blue)
                        }
                    }
                    
                    Section(header: Text("Fotoğraf (Opsiyonel)")) {
                        HStack {
                            Spacer()
                            Button {
                                isShowingImagePicker = true
                            } label: {
                                if let image = selectedImage {
                                    Image(uiImage: image)
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 100, height: 100)
                                        .clipShape(RoundedRectangle(cornerRadius: 10))
                                } else {
                                    VStack {
                                        Image(systemName: "camera.fill")
                                            .font(.system(size: 30))
                                        Text("Fotoğraf Seç")
                                            .font(.caption)
                                    }
                                    .frame(width: 100, height: 100)
                                    .background(Color.gray.opacity(0.2))
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .foregroundColor(.blue)
                                }
                            }
                            .buttonStyle(.plain)
                            Spacer()
                        }
                    }
                    
                    Section(header: Text("Ürün Detayları")) {
                        TextField("Ürün Adı", text: $name)
                            .disableAutocorrection(true)
                        
                        TextField("Satış Fiyatı (TL)", text: $salePrice)
                            .keyboardType(.decimalPad)
                        
                        TextField("Başlangıç Stoğu", text: $stockQuantity)
                            .keyboardType(.numberPad)
                    }
                    
                    Section(header: Text("Kategori ve Marka")) {
                        if isFetchingForm {
                            ProgressView("Yükleniyor...")
                        } else {
                            Picker("Kategori", selection: $selectedCategoryId) {
                                Text("Seçiniz").tag(Int?.none)
                                ForEach(categories, id: \.id) { cat in
                                    Text(cat.name).tag(Int?(cat.id))
                                }
                            }
                            
                            Picker("Marka", selection: $selectedBrandId) {
                                Text("Seçiniz").tag(Int?.none)
                                ForEach(brands, id: \.id) { brand in
                                    Text(brand.name).tag(Int?(brand.id))
                                }
                            }
                        }
                    }
                    
                    Section {
                        Button(action: saveProduct) {
                            if isSaving {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                                    .frame(maxWidth: .infinity)
                            } else {
                                Text("Ürünü Kaydet")
                                    .frame(maxWidth: .infinity, alignment: .center)
                                    .foregroundColor(.white)
                                    .padding()
                                    .background(name.isEmpty || salePrice.isEmpty ? Color.gray : Color.blue)
                                    .cornerRadius(8)
                            }
                        }
                        .disabled(name.isEmpty || salePrice.isEmpty || isSaving)
                    }
                    .listRowBackground(Color.clear)
                    
                    if let error = errorMessage {
                        Section {
                            Text(error)
                                .foregroundColor(.red)
                                .font(.footnote)
                        }
                    }
                    
                    if let success = successMessage {
                        Section {
                            Text(success)
                                .foregroundColor(.green)
                                .font(.footnote)
                        }
                    }
                }
            }
        }
        .navigationTitle("Ürün Ekle")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $isShowingImagePicker) {
            ImagePicker(selectedImage: $selectedImage)
        }
    }
    
    private func fetchFormData() {
        isFetchingForm = true
        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        
        guard let url = URL(string: "\(baseURL)/api/mobile/products/form-data") else {
            isFetchingForm = false
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        if !authToken.isEmpty {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }
        
        NetworkManager.shared.session.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isFetchingForm = false
                guard let data = data, error == nil else { return }
                if let result = try? JSONDecoder().decode(FormDataResponse.self, from: data) {
                    self.categories = result.categories
                    self.brands = result.brands
                }
            }
        }.resume()
    }
    
    private func saveProduct() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        
        guard !name.isEmpty, let price = Double(salePrice.replacingOccurrences(of: ",", with: ".")), let stock = Int(stockQuantity) else {
            errorMessage = "Lütfen geçerli bir fiyat ve stok girin."
            return
        }
        
        isSaving = true
        errorMessage = nil
        successMessage = nil
        
        var baseURL = serverURL
        if !baseURL.hasPrefix("http") { baseURL = "http://" + baseURL }
        
        guard let url = URL(string: "\(baseURL)/api/mobile/products/add") else {
            errorMessage = "Geçersiz sunucu adresi."
            isSaving = false
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if !authToken.isEmpty {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }
        
        var parameters = [
            "name": name,
            "barcode": barcode,
            "sale_price": "\(price)",
            "stock_quantity": "\(stock)"
        ]
        
        if let catId = selectedCategoryId { parameters["category_id"] = "\(catId)" }
        if let brandId = selectedBrandId { parameters["brand_id"] = "\(brandId)" }
        
        var body = Data()
        for (key, value) in parameters {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(value)\r\n".data(using: .utf8)!)
        }
        
        if let image = selectedImage, let imageData = image.jpegData(compressionQuality: 0.7) {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"image\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(imageData)
            body.append("\r\n".data(using: .utf8)!)
        }
        
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body
        
        NetworkManager.shared.session.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                self.isSaving = false
                
                if let error = error {
                    self.errorMessage = "Bağlantı hatası: \(error.localizedDescription)"
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse, let data = data else {
                    self.errorMessage = "Geçersiz yanıt."
                    return
                }
                
                if httpResponse.statusCode == 200 {
                    self.successMessage = "Ürün başarıyla eklendi!"
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        self.barcode = ""
                        self.name = ""
                        self.salePrice = ""
                        self.stockQuantity = "1"
                        self.selectedImage = nil
                        self.selectedCategoryId = nil
                        self.selectedBrandId = nil
                        self.successMessage = nil
                        self.isScanning = true
                    }
                } else {
                    if let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                       let msg = errorJson["message"] as? String {
                        self.errorMessage = msg
                    } else {
                        self.errorMessage = "Sunucu hatası (\(httpResponse.statusCode))."
                    }
                }
            }
        }.resume()
    }
}

struct ImagePicker: UIViewControllerRepresentable {
    @Binding var selectedImage: UIImage?
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .photoLibrary
        picker.allowsEditing = true
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(selectedImage: $selectedImage, dismiss: dismiss)
    }

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        @Binding private var selectedImage: UIImage?
        private let dismiss: DismissAction

        init(selectedImage: Binding<UIImage?>, dismiss: DismissAction) {
            self._selectedImage = selectedImage
            self.dismiss = dismiss
        }

        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            selectedImage = (info[.editedImage] as? UIImage) ?? (info[.originalImage] as? UIImage)
            dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            dismiss()
        }
    }
}

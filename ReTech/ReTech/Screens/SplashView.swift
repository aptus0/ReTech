import SwiftUI

struct SplashView: View {
    @Binding var isShowingSplash: Bool
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Re.")
                .font(.system(size: 60, weight: .bold))
                .foregroundColor(.blue)
            
            Text("Re Tech Mobile")
                .font(.title)
                .fontWeight(.semibold)
            
            Text("Ön Kobi Muhasebe ve Dijital Çözüm Programı")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                withAnimation {
                    isShowingSplash = false
                }
            }
        }
    }
}

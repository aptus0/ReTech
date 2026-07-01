import SwiftUI

struct SplashView: View {
    @Binding var isShowingSplash: Bool
    
    @State private var size = 0.4
    @State private var opacity = 0.0
    
    var body: some View {
        ZStack {
            // Orange Background
            Color.orange
                .ignoresSafeArea()
            
            VStack(spacing: 25) {
                // Animated Icon matching the uploaded image
                ZStack {
                    RoundedRectangle(cornerRadius: 25)
                        .fill(Color.white)
                        .frame(width: 140, height: 140)
                        .shadow(color: Color.black.opacity(0.2), radius: 10, x: 0, y: 5)
                    
                    Text("ÖZ")
                        .font(.system(size: 70, weight: .black, design: .rounded))
                        .foregroundColor(.orange)
                }
                
                // App Name
                Text("Öz Turucnu")
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 2)
            }
            .scaleEffect(size)
            .opacity(opacity)
            .onAppear {
                withAnimation(.spring(response: 0.8, dampingFraction: 0.6, blendDuration: 0.5)) {
                    self.size = 1.0
                    self.opacity = 1.0
                }
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                withAnimation(.easeInOut(duration: 0.4)) {
                    isShowingSplash = false
                }
            }
        }
    }
}

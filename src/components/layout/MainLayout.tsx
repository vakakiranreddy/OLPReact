import React, { Suspense } from 'react'
import NavigationBar from './NavigationBar'
import Footer from './Footer'
import ToastNotification from '../ui/ToastNotification'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavigationBar />
      <main 
        className="flex-grow-1" 
        style={{ 
          paddingTop: '70px',
          backgroundImage: 'url(/images/Background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1
        }}></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
        <Suspense 
        fallback={
          <div className="d-flex justify-content-center align-items-center" style={{height: '50vh'}}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
      >
          {children}
        </Suspense>
        </div>
      </main>
      <Footer />
      <ToastNotification />
    </div>
  )
}

export default MainLayout
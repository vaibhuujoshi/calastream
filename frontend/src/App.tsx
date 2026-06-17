import { useState } from 'react'
import './App.css'
import AuthModal from './components/AuthModal'
import AuthCard from './components/AuthCard'

function App() {
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(false);

  return (
    // This is your "Initial Page" underneath the modal
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background decoration for the initial page */}
      <div className="absolute top-0 w-full h-125 bg-purple-900/20 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />

      {/* Trigger Button on the main page */}
      <button
        onClick={() => setIsPortalOpen(true)}
        className="relative z-10 bg-white text-black px-8 py-4 rounded-full font-semibold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-300"
      >
        Sign In / Sign Up
      </button>

      {/* The Modal component. 
        It receives the `isOpen` state to know when to show up.
        It receives `setIsPortalOpen(false)` so clicking the backdrop closes it.
      */}
      <AuthModal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)}>
        <AuthCard onSuccess={() => setIsPortalOpen(false)} />
      </AuthModal>

    </div>
  );
}

export default App

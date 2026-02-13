// src/components/NavbarStyles.js

export const navStyles = {
  // Main Nav Bar - Glass effect with subtle border
  nav: "w-full bg-[#0b0c0e]/80 backdrop-blur-xl border-b border-white/[0.08] text-white font-sans select-none sticky top-0 z-[100] transition-all duration-300",
  container: "max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative",
  
  // Left Section
  leftSection: "flex items-center gap-8 h-full",
  logoSwitcherGroup: "flex items-center gap-4 shrink-0",
  logoLink: "flex items-center gap-2 relative z-[110]", // High Z-index to stay above mobile menu
  logoImg: "h-8 w-auto object-contain",
  
  // Switcher (Desktop)
  switcherContainer: "hidden md:flex items-center bg-white/[0.05] rounded-lg p-1 border border-white/[0.05]",
  switcherActive: "px-3 py-1 text-[11px] font-bold rounded-md bg-[#181a20] text-white shadow-sm transition-all cursor-default",
  switcherInactive: "px-3 py-1 text-[11px] font-semibold rounded-md text-gray-400 hover:text-white transition-all",

  // Desktop Navigation
  mainNav: "hidden xl:flex items-center gap-8 h-full ml-4",
  navMenuItem: "text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 hover:text-[#00D68F]",

  // Right Section (Desktop)
  rightSection: "hidden md:flex items-center gap-6",
  authGroup: "flex items-center gap-4",
  loginBtn: "px-2 text-sm font-bold text-gray-300 hover:text-white transition-colors",
  signUpBtn: "bg-[#00D68F] text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-[#00bd7e] transition-all transform hover:scale-105 shadow-[0_0_20px_-5px_rgba(0,214,143,0.3)]",
  iconBtn: "text-gray-400 hover:text-white transition-colors p-1",

  // Mobile Toggle Button
  mobileToggle: "xl:hidden p-2 text-2xl text-white hover:text-[#00D68F] transition-colors cursor-pointer relative z-[110]", 

  // --- NEW MOBILE MENU STYLES ---
  
  // Full screen glass overlay
  mobileMenuOverlay: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]",
  
  // The drawer itself - Deep dark gradient
  mobileMenuContainer: "fixed top-0 right-0 w-full sm:w-[380px] h-[100dvh] bg-gradient-to-b from-[#181a20] to-[#0b0c0e] border-l border-white/[0.08] z-[100] shadow-2xl flex flex-col justify-between",
  
  // Content area inside the drawer
  mobileContent: "flex flex-col h-full pt-24 px-8 pb-10 overflow-y-auto",
  
  // Links
  mobileLink: "flex items-center justify-between text-2xl font-bold text-white py-5 border-b border-white/[0.03] group active:scale-[0.98] transition-all",
  mobileLinkText: "group-hover:text-[#00D68F] transition-colors",
  mobileLinkIcon: "text-gray-600 group-hover:text-[#00D68F] transition-colors text-xl",

  // Bottom Auth Section
  mobileAuthSection: "mt-auto pt-8 flex flex-col gap-4",
  mobileLoginBtn: "w-full py-4 text-center text-white font-bold text-lg border border-white/10 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all",
  mobileSignUpBtn: "w-full py-4 text-center bg-[#00D68F] text-black font-bold text-lg rounded-xl hover:bg-[#00bd7e] active:scale-[0.98] transition-all shadow-lg shadow-[#00D68F]/20",
  
  // User Profile in Mobile
  mobileProfile: "flex items-center gap-4 mb-8 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05]",
  mobileProfileText: "flex flex-col",
  mobileEmail: "text-white font-bold text-sm",
  mobileStatus: "text-[#00D68F] text-xs font-medium",
};

// --- HERO STYLES (Kept for compatibility) ---
export const heroStyles = {
  section: "relative w-full h-screen flex items-center justify-center overflow-hidden bg-black",
  video: "absolute inset-0 w-full h-full object-cover z-0 opacity-70",
  overlay: "absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-black/50 to-black/30 z-10",
  content: "relative z-20 text-center px-6 max-w-6xl",
  title: "text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-[-0.02em] leading-[1.1] drop-shadow-2xl",
  subtitle: "text-base md:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-normal tracking-wide",
  cta: "inline-block bg-gradient-to-r from-[#00D68F] to-[#00bd7e] text-black px-8 py-4 rounded-xl font-bold text-base md:text-lg hover:shadow-2xl hover:shadow-[#00D68F]/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
};


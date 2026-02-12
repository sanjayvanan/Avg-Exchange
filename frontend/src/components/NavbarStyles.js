// temp/frontend/src/components/NavbarStyles.js
export const navStyles = {
  // Cleaner gradient with better backdrop blur for a glass morphism effect
  nav: "w-full bg-gradient-to-b from-[#0a0b0d] to-[#0a0b0d]/98 backdrop-blur-xl border-b border-white/[0.08] text-white font-sans select-none sticky top-0 z-[100] antialiased shadow-sm",
  // Better horizontal spacing and refined height
  container: "max-w-[1920px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between",
  
  leftSection: "flex items-center gap-10 h-full",
  logoSwitcherGroup: "flex items-center gap-5 shrink-0 h-full",
  logoImg: "h-7 w-auto object-contain shrink-0 hover:opacity-90 transition-opacity duration-200", 
  
  // More refined switcher with better contrast
  switcherContainer: "flex items-center bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06] shrink-0 shadow-inner",
  switcherActive: "px-3.5 py-1.5 text-[10px] uppercase tracking-wide font-bold rounded-md text-white bg-white/[0.1] shadow-sm transition-all duration-200",
  switcherInactive: "px-3.5 py-1.5 text-[10px] uppercase tracking-wide font-semibold rounded-md text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200",
  
  // Improved spacing and typography for nav items
  mainNav: "hidden xl:flex items-center h-full gap-2", 
  navMenuItem: "group h-full px-4 flex items-center gap-1.5 text-[13px] font-semibold text-gray-200 hover:text-[#00D68F] transition-all duration-200 whitespace-nowrap relative",
  navMenuArrow: "text-gray-500 group-hover:text-[#00D68F] transition-colors duration-200 text-xs",
  navMenuIndicator: "absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#00D68F] to-[#00bd7e] scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300 rounded-full",
  
  // Better spacing and visual hierarchy
  rightSection: "flex items-center gap-5 shrink-0 h-full",
  authGroup: "flex items-center gap-5",
  loginBtn: "text-[13px] font-semibold text-gray-200 hover:text-white transition-colors duration-200",
  signUpBtn: "bg-gradient-to-r from-[#00D68F] to-[#00bd7e] text-black text-[13px] font-bold px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-[#00D68F]/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
  
  divider: "w-px h-5 bg-white/[0.08] hidden md:block",
  iconBtn: "w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all duration-200",
};

export const heroStyles = {
  // Full viewport with better overlay
  section: "relative w-full h-screen flex items-center justify-center overflow-hidden bg-black",
  video: "absolute inset-0 w-full h-full object-cover z-0 opacity-70",
  overlay: "absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-black/50 to-black/30 z-10",
  content: "relative z-20 text-center px-6 max-w-6xl",
  // More refined typography scale
  title: "text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-[-0.02em] leading-[1.1] drop-shadow-2xl",
  subtitle: "text-base md:text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-normal tracking-wide",
  cta: "inline-block bg-gradient-to-r from-[#00D68F] to-[#00bd7e] text-black px-8 py-4 rounded-xl font-bold text-base md:text-lg hover:shadow-2xl hover:shadow-[#00D68F]/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
};
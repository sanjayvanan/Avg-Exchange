// NavbarStyles.js
export const navStyles = {
  // Main Bar - Fixed 72px height prevents any vertical movement
  nav: "w-full bg-[#0b0c0e] border-b border-[#1E2026] text-white font-sans select-none sticky top-0 z-[100] antialiased",
  container: "max-w-[1920px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between",
  
  // Left Section
  leftSection: "flex items-center gap-6 h-full",
  logoSwitcherGroup: "flex items-center gap-4 shrink-0 h-full",
  logoImg: "h-[32px] w-auto object-contain shrink-0", 
  
  // Switcher - Stays visible in mobile view
  switcherContainer: "flex items-center bg-[#181a20] rounded-[6px] p-[2px] border border-[#2b2f36] shrink-0",
  switcherActive: "px-3 py-[4px] text-[12px] font-bold rounded-[4px] text-white bg-[#2b2f36] border border-[#484c56] shadow-md transition-all",
  switcherInactive: "px-3 py-[4px] text-[12px] font-bold rounded-[4px] text-gray-500 hover:text-white transition-all",
  
  // Navigation Links - Enforced equal spacing
  mainNav: "hidden xl:flex items-center h-full gap-4 ml-4", 
  navMenuItem: "group h-full px-6 flex items-center gap-1.5 text-[15px] font-semibold text-[#cfd3dc] hover:text-[#00D68F] transition-colors whitespace-nowrap relative",
  navMenuArrow: "text-[#5e6673] group-hover:text-[#00D68F] transition-colors mt-[1px]",
  navMenuIndicator: "absolute bottom-0 left-0 w-full h-[3px] bg-[#00D68F] scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300",
  
  // Right Section
  rightSection: "flex items-center gap-4 shrink-0 h-full",
  authGroup: "hidden md:flex items-center gap-6 mr-2",
  loginBtn: "text-[15px] font-bold text-white hover:text-[#00D68F] transition-colors",
  signUpBtn: "bg-white text-black text-[15px] font-bold px-6 py-[10px] rounded-full hover:bg-[#f0f0f0] shadow-xl whitespace-nowrap transition-all",
  
  // Utility
  iconBtn: "w-10 h-10 flex items-center justify-center text-[#76808f] hover:text-white hover:bg-[#1E2026] rounded-full transition-all",
  mobileToggle: "xl:hidden text-white ml-2 p-2 hover:bg-[#1E2026] rounded-lg",
  mobileMenu: "xl:hidden absolute top-[72px] left-0 w-full bg-[#0b0c0e] border-t border-[#1E2026] p-6 flex flex-col gap-6 shadow-2xl z-50"
};
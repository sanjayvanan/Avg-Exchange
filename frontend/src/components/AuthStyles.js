// AuthStyles.js
export const authStyles = {
  // Main background container that centers the form
  wrapper: "flex items-center justify-center min-h-[calc(100vh-72px)] px-4 bg-[#0b0c0e]",
  
  // The card containing the form
  formCard: "bg-[#181a20] p-8 rounded-2xl border border-[#2b2f36] w-full max-w-md shadow-2xl transition-all",
  
  // Typography
  title: "text-white text-2xl font-bold mb-6 text-center tracking-tight",
  label: "block text-[#76808f] text-sm font-medium mb-2 ml-1",
  
  // Input fields
  input: "w-full bg-[#0b0c0e] border border-[#2b2f36] rounded-lg p-3 text-white focus:border-[#00D68F] focus:ring-1 focus:ring-[#00D68F] outline-none transition-all placeholder:text-[#3d434d]",
  
  // Submit button
  submitBtn: "w-full bg-[#00D68F] text-black font-bold py-3 rounded-full hover:bg-[#00ba7c] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4",
  
  // Error messages
  errorBox: "mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm text-center font-medium animate-pulse"
};
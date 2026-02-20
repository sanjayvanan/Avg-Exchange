// src/pages/Account.jsx
import React, { useState } from 'react';
import { 
  IoShieldCheckmarkOutline, 
  IoDocumentTextOutline, 
  IoPersonOutline,
  IoTimeOutline 
} from 'react-icons/io5';

const Account = () => {
  // State to track if the KYC form has been submitted
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send data to the backend here.
    // For now, we just show the "Under Review" screen.
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white pt-4 px-4 pb-20 flex flex-col items-center">
      
      {/* Header section */}
      <div className="w-full max-w-3xl mt-10 mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00D68F]/10 mb-4">
          <IoShieldCheckmarkOutline className="text-[#00D68F]" size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Account Verification</h1>
        <p className="text-gray-400">Complete your KYC verification to increase your withdrawal limits and unlock all platform features.</p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-3xl bg-[#181a20] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
        
        <div className="p-6 md:p-8">
          
          {isSubmitted ? (
            /* --- UNDER REVIEW STATE --- */
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
                <IoTimeOutline className="text-yellow-500" size={48} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Verification Under Review</h2>
              <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                Your identity documents have been successfully submitted and are currently being reviewed by our compliance team. 
                <br/><br/>
                This process usually takes <strong className="text-white">1 to 3 business days</strong>. We will notify you via email once the review is complete.
              </p>
            </div>
          ) : (
            /* --- KYC FORM --- */
            <>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <IoPersonOutline className="text-[#00D68F]" />
                Personal Details
              </h2>

              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                
                {/* Grid for Name and DOB */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Full Legal Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., John Doe" 
                      className="bg-[#0b0c0e] border border-white/[0.1] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D68F] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Date of Birth</label>
                    <input 
                      type="date" 
                      required
                      className="bg-[#0b0c0e] border border-white/[0.1] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D68F] transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-white/[0.05] my-2"></div>

                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <IoDocumentTextOutline className="text-[#00D68F]" />
                  Identity Verification
                </h2>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Document Type</label>
                  <select className="bg-[#0b0c0e] border border-white/[0.1] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D68F] transition-colors appearance-none cursor-pointer">
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID Card</option>
                    <option value="driver_license">Driver's License</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Document Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter ID Number" 
                    className="bg-[#0b0c0e] border border-white/[0.1] rounded-lg p-3 text-white focus:outline-none focus:border-[#00D68F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-300">Upload Document Proof</label>
                  <div className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center hover:border-[#00D68F]/50 transition-colors bg-[#0b0c0e]/50 cursor-pointer relative">
                    <input 
                      type="file" 
                      required
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#00D68F]/10 file:text-[#00D68F]
                        hover:file:bg-[#00D68F]/20 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-3">PNG, JPG, or PDF (Max. 5MB)</p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="mt-6 bg-[#00D68F] text-black font-bold text-lg py-4 rounded-xl hover:bg-[#00bd7e] transition-all transform hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(0,214,143,0.3)] active:scale-[0.98]"
                >
                  Submit for Verification
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Account;
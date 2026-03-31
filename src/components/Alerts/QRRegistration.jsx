import React from 'react';
import { QrCode, MessageSquare, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const GOOGLE_FORM_URL = 'https://forms.gle/GAZjQs2jCN8zafsWA';

const QRRegistration = () => {
  return (
    <div className="academic-panel p-6 relative overflow-hidden group h-full flex flex-col justify-center">
      <div className="absolute -right-12 -top-12 opacity-5 transition-opacity duration-500 text-academic-blue">
        <MessageSquare className="w-48 h-48" />
      </div>

      <h3 className="text-xl font-bold font-serif text-academic-blue uppercase tracking-tight flex items-center gap-2 mb-2">
        <QrCode className="w-6 h-6" /> SMS ALERT REGISTRATION
      </h3>
      <p className="text-[11px] text-slate-600 font-medium mb-4 leading-relaxed line-clamp-2">
        Scan or click below to register for localized flood warnings directly on your mobile device.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/40 p-4 rounded-2xl border border-white/60">
        <div className="md:col-span-3 flex justify-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <QRCodeSVG value={GOOGLE_FORM_URL} size={100} bgColor="#ffffff" fgColor="#1e293b" level="H" />
            </div>
        </div>

        <div className="md:col-span-5 space-y-3">
            <h4 className="text-[10px] font-bold text-academic-blue uppercase tracking-widest border-b border-academic-blue/10 pb-1">Registration Steps</h4>
            <div className="text-[10px] text-slate-700 space-y-2 font-medium">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-academic-blue" />
                    <p>1. Scan or Click Registration</p>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-academic-blue" />
                    <p>2. Provide Name & Village</p>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-academic-blue" />
                    <p>3. Activate Mobile Alerts</p>
                </div>
            </div>
        </div>
        
        <div className="md:col-span-4 flex flex-col justify-center gap-3">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter text-center">Join 2000+ local Residents</p>
            <button 
                onClick={() => window.open(GOOGLE_FORM_URL, '_blank')}
                className="w-full py-3 bg-academic-blue hover:bg-blue-900 text-white rounded-xl font-bold tracking-widest text-[10px] uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
                <MessageSquare className="w-4 h-4" /> Open Form
            </button>
        </div>
      </div>
    </div>
  );
};

export default QRRegistration;

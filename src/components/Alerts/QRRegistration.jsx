import React from 'react';
import { QrCode, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ALERT_CONFIG } from '../../config/alerts';

const QRRegistration = () => {
  const formUrl = ALERT_CONFIG.registrationFormUrl;
  const isConfigured = !formUrl.includes('YOUR_GOOGLE_FORM_ID');

  return (
    <div className="academic-panel p-4 relative overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="w-4 h-4 text-academic-blue flex-shrink-0" />
        <div>
          <h3 className="text-xs font-bold font-serif text-academic-blue uppercase tracking-widest leading-none">
            SMS Alert Registration
          </h3>
          <p className="text-[9px] text-slate-500 mt-0.5">Register for localised flood warnings</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        {/* QR Code */}
        <div className="flex-shrink-0">
          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            {isConfigured ? (
              <QRCodeSVG
                value={formUrl}
                size={80}
                bgColor="#ffffff"
                fgColor="#1e293b"
                level="H"
              />
            ) : (
              <div className="w-20 h-20 bg-slate-100 flex flex-col items-center justify-center rounded gap-1">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="text-[7px] font-bold text-slate-400 uppercase text-center leading-tight">Form URL<br/>Pending</span>
              </div>
            )}
          </div>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">Scan QR</p>
        </div>

        {/* Steps + button */}
        <div className="flex-1 min-w-0">
          <div className="space-y-1.5 mb-3">
            {[
              'Scan QR or click Open Form',
              'Enter Name, Mobile & Village',
              'Receive flood SMS alerts',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle className="w-3 h-3 text-academic-blue flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-600 font-medium leading-tight">{step}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => isConfigured && window.open(formUrl, '_blank')}
            disabled={!isConfigured}
            className={`w-full py-2 rounded-lg font-bold tracking-widest text-[9px] uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm
              ${isConfigured
                ? 'bg-academic-blue hover:bg-blue-900 text-white active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <MessageSquare className="w-3 h-3" />
            {isConfigured ? 'Open Registration Form' : 'Form URL Not Configured'}
          </button>

          <p className="text-[8px] text-slate-400 text-center mt-1.5 font-medium">
            Join 2000+ registered residents
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRRegistration;

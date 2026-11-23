import React, { useState } from 'react';
import { FAQ_DATA } from '../data/competitions';
import { ChevronDown, MessageSquare } from 'lucide-react';

interface FAQProps {
  onOpenWhatsAppHelp: () => void;
}

export const FAQSection: React.FC<FAQProps> = ({ onOpenWhatsAppHelp }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      className="relative w-full py-16 sm:py-20 px-6 sm:px-10 lg:px-16 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #f7efe0 0%, #faf4e8 50%, #fdf8ef 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto relative z-10">

        {/* Section Header (Clean, elegant, strictly official palette) */}
        <div className="text-center mb-12">
          <p className="font-cinzel text-xs text-[#7a5530] font-medium tracking-widest mb-2">
            Pusat Informasi & Tanya Jawab
          </p>
          <h2 className="font-cormorant font-normal text-3xl sm:text-4xl lg:text-[2.65rem] text-[#2f1e10] tracking-tight leading-snug">
            Pertanyaan yang <span className="shimmer-text">Sering Diajukan</span>
          </h2>
          <div className="flex items-center justify-center gap-3 my-4 text-[#caa152] opacity-75">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#caa152]" />
            <span className="text-[9px]">✦</span>
            <span className="text-xs">✦</span>
            <span className="text-[9px]">✦</span>
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#caa152]" />
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#7a5530] max-w-lg mx-auto leading-relaxed font-normal">
            Informasi lengkap seputar mekanisme pendaftaran, pembayaran QRIS, dan ketentuan perlombaan resmi Digiconomic Fest 2027.
          </p>
        </div>

        {/* Clean Vintage Accordion (Strictly Official Palette) */}
        <div className="space-y-3.5">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-[#ebdcc8] overflow-hidden transition-all duration-300 relative"
                style={{
                  background: 'rgba(255, 253, 248, 0.96)',
                }}
              >
                <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#caa152]/20 pointer-events-none" />

                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left p-5 sm:p-5.5 flex items-center justify-between gap-4 font-sans text-xs sm:text-sm text-[#2f1e10] hover:text-[#7a5530] transition-colors relative z-10"
                >
                  <span className="flex items-center gap-3.5 font-normal">
                    <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-cinzel text-[10px] text-white bg-gradient-to-r from-[#ba883a] to-[#7a5530] shadow-2xs">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-medium text-[#2f1e10] leading-snug">
                      {item.q}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7a5530] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#caa152]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-[13px] text-[#5c3820] leading-relaxed border-t border-[#ebdcc8]/70 font-normal relative z-10">
                    <p className="pt-2">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Harmonious Contact Card (Pure Palette: Dark Brown & Gold) */}
        <div
          className="mt-12 p-6 sm:p-8 rounded-3xl border border-[#ebdcc8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 50% 25%, #ffffff 0%, #faf4e8 70%, #f4e8d2 100%)',
          }}
        >
          <div className="absolute inset-1.5 rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

          <div className="space-y-1.5 text-center sm:text-left relative z-10">
            <h4 className="font-cormorant font-normal text-xl sm:text-2xl text-[#2f1e10]">
              Punya pertanyaan yang belum terjawab?
            </h4>
            <p className="font-sans text-xs text-[#7a5530] font-normal">
              Narahubung panitia siap membantu setiap pertanyaanmu secara langsung via WhatsApp.
            </p>
          </div>

          <button
            onClick={onOpenWhatsAppHelp}
            className="px-6 py-3 rounded-full text-[#f5eee2] font-cinzel text-xs font-semibold tracking-wider flex items-center gap-2 shadow-xs hover:shadow transition-all shrink-0 active:scale-95 bg-[#2f1e10] hover:bg-[#7a5530] border border-[#caa152]/40 relative z-10"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#caa152]" />
            <span>HUBUNGI PANITIA (WA)</span>
          </button>
        </div>

      </div>
    </section>
  );
};

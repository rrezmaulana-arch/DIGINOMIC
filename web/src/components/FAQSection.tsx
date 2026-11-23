import React, { useState } from 'react';
import { FAQ_DATA } from '../data/competitions';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { SectionDivider, BatikKawungPattern, MegaMendungClouds } from './Ornaments';

interface FAQProps {
  onOpenWhatsAppHelp: () => void;
}

export const FAQSection: React.FC<FAQProps> = ({ onOpenWhatsAppHelp }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      className="relative w-full py-10 sm:py-16 md:py-20 px-3.5 sm:px-8 lg:px-16 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #efe3d0 0%, #eadbc4 60%, #e4d2b7 100%)',
      }}
    >
      <BatikKawungPattern color="#7a5530" opacity={0.045} id="kawung-faq" />
      <MegaMendungClouds color="#8c6239" className="absolute top-6 -right-14 w-64 sm:w-80 opacity-50" />
      <MegaMendungClouds color="#8c6239" flip className="absolute bottom-6 -left-14 w-64 sm:w-80 opacity-45" />
      <div className="max-w-4xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-12">
          <p className="font-cinzel text-[10px] sm:text-xs text-[#7a5530] font-medium tracking-widest mb-1 sm:mb-2">
            Pusat Informasi & Tanya Jawab
          </p>
          <h2 className="font-cormorant font-normal text-2xl sm:text-4xl lg:text-[2.65rem] text-[#2f1e10] tracking-tight leading-snug">
            Pertanyaan yang <span className="shimmer-text">Sering Diajukan</span>
          </h2>
          <div className="flex items-center justify-center gap-3 my-2 sm:my-4 text-[#caa152] opacity-75">
            <span className="w-8 sm:w-10 h-px bg-gradient-to-r from-transparent to-[#caa152]" />
            <span className="text-[8px] sm:text-[9px]">✦</span>
            <span className="text-xs">✦</span>
            <span className="text-[8px] sm:text-[9px]">✦</span>
            <span className="w-8 sm:w-10 h-px bg-gradient-to-l from-transparent to-[#caa152]" />
          </div>
          <p className="font-sans text-[11px] sm:text-sm text-[#7a5530] max-w-lg mx-auto leading-relaxed font-normal">
            Informasi lengkap seputar mekanisme pendaftaran, pembayaran QRIS, dan ketentuan perlombaan resmi Digiconomic Fest 2027.
          </p>
        </div>

        {/* Clean Vintage Accordion */}
        <div className="space-y-2 sm:space-y-3.5">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-300 ease-out relative ${
                  isOpen
                    ? 'border-[#caa152] bg-[#fffdf9] shadow-[0_10px_28px_-12px_rgba(47,30,16,0.18)]'
                    : 'border-[#dfd0ba] bg-[#fffdf9]/92 hover:border-[#caa152]/70 hover:bg-[#fffdf9] hover:-translate-y-0.5 hover:shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 font-sans text-xs sm:text-sm text-[#2f1e10] hover:text-[#7a5530] transition-colors relative z-10"
                >
                  <span className="flex items-center gap-3 font-normal">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-poppins text-[10px] font-semibold transition-colors duration-300 ${
                      isOpen
                        ? 'bg-[#3b2412] text-[#f3d48c]'
                        : 'bg-[#efe1cb] text-[#6b4725]'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-poppins font-medium text-[#2f1e10] leading-snug text-xs sm:text-sm">
                      {item.q}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7a5530] transition-transform duration-300 ease-out shrink-0 ${
                      isOpen ? 'rotate-180 text-[#a87226]' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-2 text-xs sm:text-[13px] text-[#5c3820] leading-relaxed border-t border-[#ebdcc8]/70 font-sans">
                      {item.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Harmonious Contact Card */}
        <div
          className="mt-6 sm:mt-12 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#ebdcc8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-5 relative overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 50% 25%, #ffffff 0%, #faf4e8 70%, #f4e8d2 100%)',
          }}
        >
          <div className="absolute inset-1 sm:inset-1.5 rounded-xl sm:rounded-2xl border border-dashed border-[#caa152]/30 pointer-events-none" />

          <div className="space-y-1 text-center sm:text-left relative z-10">
            <h4 className="font-poppins font-semibold text-base sm:text-lg text-[#2f1e10]">
              Punya pertanyaan yang belum terjawab?
            </h4>
            <p className="font-sans text-[11px] sm:text-xs text-[#7a5530] font-normal">
              Narahubung panitia siap membantu setiap pertanyaanmu secara langsung via WhatsApp.
            </p>
          </div>

          <button
            onClick={onOpenWhatsAppHelp}
            className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-[#f5eee2] font-cinzel text-[10px] sm:text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow transition-all shrink-0 active:scale-95 bg-[#2f1e10] hover:bg-[#7a5530] border border-[#caa152]/40 relative z-10"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#caa152]" />
            <span>HUBUNGI PANITIA (WA)</span>
          </button>
        </div>

      </div>
    </section>
  );
};

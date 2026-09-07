import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingCart, Trash2, Printer } from 'lucide-react';

export default function HaftalikPlan({ haftalikPlan, tarifler, planSil }) {
  const [aktifPazartesi, setAktifPazartesi] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const getHaftaninGunleri = (pazartesiTarih) => {
    const gunler = [];
    for (let i = 0; i < 7; i++) {
      const g = new Date(pazartesiTarih);
      g.setDate(pazartesiTarih.getDate() + i);
      
      const yyyy = g.getFullYear();
      const mm = String(g.getMonth() + 1).padStart(2, '0');
      const dd = String(g.getDate()).padStart(2, '0');
      const isoStr = `${yyyy}-${mm}-${dd}`; 

      const gosterimStr = g.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
      gunler.push({ isoStr, gosterimStr });
    }
    return gunler;
  };

  const haftaninGunleri = getHaftaninGunleri(aktifPazartesi);
  const haftaAraligiMetni = `${haftaninGunleri[0].gosterimStr.split(',')[1]} - ${haftaninGunleri[6].gosterimStr.split(',')[1]}`;

  const haftaDegistir = (yon) => {
    const yeniPazartesi = new Date(aktifPazartesi);
    yeniPazartesi.setDate(aktifPazartesi.getDate() + (yon * 7));
    setAktifPazartesi(yeniPazartesi);
  };

  const getHaftalikTopluMalzemeler = () => {
    const liste = {};
    haftaninGunleri.forEach(gun => {
      const planItem = haftalikPlan[gun.isoStr];
      if (!planItem) return;
      
      const tarifIDleri = planItem.tarifler || [];
      tarifIDleri.forEach(tId => {
        const tarif = tarifler.find(t => t.id === tId);
        if (!tarif || !tarif.malzemeler) return;
        
        tarif.malzemeler.forEach(m => {
          if (!m.isim) return;
          const key = `${m.isim.toLowerCase().trim()}_${m.birim}`;
          if (!liste[key]) {
            liste[key] = { isim: m.isim.charAt(0).toUpperCase() + m.isim.slice(1), birim: m.birim, miktar: 0 };
          }
          liste[key].miktar += Number(m.miktar) || 0;
        });
      });
    });
    return Object.values(liste).sort((a,b) => a.isim.localeCompare(b.isim));
  };

  const haftalikAlisveris = getHaftalikTopluMalzemeler();

  return (
    <div>
      <div className="animate-in fade-in duration-300 mb-12 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
          <h2 className="text-xl font-bold text-orange-800 flex items-center">
            <CalendarDays className="mr-2" size={24} /> Haftalık Menü Planı
          </h2>
          
          <div className="flex items-center gap-3">
            <button onClick={() => haftaDegistir(-1)} className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg border border-orange-200 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-sm sm:text-base text-slate-700 min-w-[200px] text-center">
              {haftaAraligiMetni}
            </span>
            <button onClick={() => haftaDegistir(1)} className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg border border-orange-200 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {haftaninGunleri.map(gun => {
            const planKaydi = haftalikPlan[gun.isoStr];
            const planlananTarifler = planKaydi ? (planKaydi.tarifler || []).map(id => tarifler.find(t => t.id === id)).filter(Boolean) : [];
            
            // Eski kayıtlara uyum sağlamak için köprü yapısı
            let mAdlari = planKaydi?.menuAdlari || [];
            if (planKaydi?.menuAdi && mAdlari.length === 0) {
              mAdlari = [planKaydi.menuAdi];
            }

            return (
              <div key={gun.isoStr} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
                <div>
                  <div className="border-b pb-2 mb-3">
                    <span className="block font-bold text-slate-800 text-base">{gun.gosterimStr.split(',')[0]}</span>
                    <span className="text-xs text-slate-400 font-medium">{gun.gosterimStr.split(',')[1]}</span>
                  </div>

                  {planKaydi ? (
                    <div className="mb-3">
                      {mAdlari.map((mAd, idx) => (
                        <span key={idx} className="inline-block bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded mb-2 mr-1">
                          📦 {mAd}
                        </span>
                      ))}
                      {mAdlari.length === 0 && planlananTarifler.length > 0 && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded mb-2">
                          🍽️ Serbest Seçim
                        </span>
                      )}
                      <div className="space-y-2">
                        {planlananTarifler.map((t, idx) => (
                          <div key={idx} className="bg-orange-50 p-2 rounded-lg border border-orange-100 text-xs flex justify-between items-center">
                            <span className="font-bold text-slate-800 block truncate pr-2">{t.ad}</span>
                            <span className="text-[9px] text-slate-500 uppercase shrink-0">({t.kategori})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-300 text-xs italic">Plan yok</div>
                  )}
                </div>

                {planKaydi && (
                  <button 
                    onClick={() => planSil(gun.isoStr)} 
                    className="w-full mt-3 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={14} className="mr-1" /> Planı Kaldır
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-orange-200 pb-4 gap-4">
            <h3 className="text-xl font-bold text-orange-900 flex items-center">
              <ShoppingCart className="mr-2 text-orange-600" size={24} /> Toplu Alışveriş Listesi
            </h3>
            
            {haftalikAlisveris.length > 0 && (
              <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md transition-colors w-full sm:w-auto justify-center">
                <Printer size={18} className="mr-2" /> PDF / Çıktı Al
              </button>
            )}
          </div>

          {haftalikAlisveris.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Bu hafta için henüz planlanmış bir menü bulunmuyor. Menülerim sekmesinden planlama yapabilirsiniz.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {haftalikAlisveris.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex justify-between items-center">
                  <span className="text-slate-700 font-medium text-sm">{item.isim}</span>
                  <span className="font-bold text-slate-900 bg-orange-50 px-2.5 py-1 rounded-lg text-xs border border-orange-200">
                    {item.miktar > 0 ? item.miktar : ''} {item.birim}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hidden print:block print:w-full print:bg-white print:text-black print:p-4">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-extrabold uppercase tracking-wider mb-2">Haftalık Alışveriş Listesi</h1>
          <p className="text-lg font-medium text-gray-700">Tarih Aralığı: {haftaAraligiMetni}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-3">
          {haftalikAlisveris.map((item, idx) => (
            <div key={idx} className="flex items-end border-b border-dashed border-gray-400 pb-2">
              <div className="w-6 h-6 border-2 border-gray-600 rounded-sm mr-3 shrink-0"></div>
              <span className="flex-1 font-semibold text-lg">{item.isim}</span>
              <span className="font-bold text-base bg-gray-100 px-2 py-1 rounded">{item.miktar > 0 ? item.miktar : ''} {item.birim}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center text-sm text-gray-500 italic border-t border-gray-300 pt-4">
          Bu liste "Bizim Mutfak" uygulaması üzerinden otomatik olarak oluşturulmuştur.
        </div>
      </div>
    </div>
  );
}

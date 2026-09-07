import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingCart, Trash2, Printer, X } from 'lucide-react';

export default function HaftalikPlan({ haftalikPlan, tarifler, menuler, planTemizle, plandanOgeSil }) {
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

      const gunFormat = g.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      const gunIsim = g.toLocaleDateString('tr-TR', { weekday: 'long' });

      gunler.push({ isoStr, gunFormat, gunIsim, dateObj: g });
    }
    return gunler;
  };

  const haftaninGunleri = getHaftaninGunleri(aktifPazartesi);
  const haftaAraligiMetni = `${haftaninGunleri[0].gunFormat} - ${haftaninGunleri[6].gunFormat}`;

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
            
            let mAdlari = [...(planKaydi?.menuAdlari || [])];
            if (planKaydi?.menuAdi && !mAdlari.includes(planKaydi.menuAdi)) mAdlari.push(planKaydi.menuAdi);
            
            const gununMenuleri = mAdlari.map(mAd => menuler.find(m => m.ad === mAd)).filter(Boolean);
            const menuTarifIDleri = new Set();
            gununMenuleri.forEach(m => m.tarifler.forEach(tId => menuTarifIDleri.add(tId)));

            const ekstraTarifIDleri = (planKaydi?.tarifler || []).filter(tId => !menuTarifIDleri.has(tId));
            const ekstraTarifler = ekstraTarifIDleri.map(id => tarifler.find(t => t.id === id)).filter(Boolean);

            return (
              <div key={gun.isoStr} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
                <div>
                  <div className="border-b pb-2 mb-3 flex justify-between items-start">
                    <div>
                      <span className="block font-bold text-slate-800 text-sm xl:text-base">{gun.gunFormat}</span>
                      <span className="text-xs text-slate-500 font-medium">{gun.gunIsim}</span>
                    </div>
                    {planKaydi && (
                      <button onClick={() => planTemizle(gun.isoStr)} className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Tüm Günü Temizle">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {planKaydi ? (
                    <div className="mb-2">
                      {/* PLANLANAN MENÜLER KISMI */}
                      {gununMenuleri.map((menu, idx) => (
                        <div key={`menu-${idx}`} className="mb-3 bg-orange-50/70 p-2 rounded-xl border border-orange-100 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center">
                              📦 {menu.ad}
                            </span>
                            <button onClick={() => plandanOgeSil(gun.isoStr, 'menu', menu)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Menüyü Sil">
                              <X size={14}/>
                            </button>
                          </div>
                          <div className="space-y-1 pl-1">
                            {menu.tarifler.map(tId => {
                              const t = tarifler.find(x => x.id === tId);
                              return t ? (
                                <div key={tId} className="text-[10px] font-medium text-slate-600 border-l-2 border-orange-300 pl-1.5 py-0.5">
                                  {t.ad}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      ))}

                      {/* SERBEST SEÇİM (EKSTRA YEMEKLER) KISMI */}
                      {ekstraTarifler.length > 0 && (
                        <div className="mb-3 bg-blue-50/70 p-2 rounded-xl border border-blue-100 shadow-sm">
                          <div className="mb-2">
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded flex w-fit">
                              🍽️ Ekstra / Serbest Seçim
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {ekstraTarifler.map(t => (
                              <div key={t.id} className="bg-white p-1.5 rounded-lg border border-blue-50 flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="flex flex-col truncate pr-2">
                                  <span className="font-bold text-slate-700 text-[10px] truncate">{t.ad}</span>
                                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">{t.kategori}</span>
                                </div>
                                <button onClick={() => plandanOgeSil(gun.isoStr, 'tarif', t)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors shrink-0" title="Yemeği Sil">
                                  <X size={14}/>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-300 text-xs italic">Plan yok</div>
                  )}
                </div>
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

      {/* YAZDIRMA BÖLÜMÜ - Tek Sütun (Her satıra bir ürün) */}
      <div className="hidden print:block print:w-full print:bg-white print:text-black print:p-4">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-extrabold uppercase tracking-wider mb-2">Haftalık Alışveriş Listesi</h1>
          <p className="text-lg font-medium text-gray-700">Tarih Aralığı: {haftaAraligiMetni}</p>
        </div>

        <div className="flex flex-col space-y-4">
          {haftalikAlisveris.map((item, idx) => (
            <div key={idx} className="flex items-center border-b border-dashed border-gray-400 pb-2">
              <div className="w-6 h-6 border-2 border-gray-600 rounded-sm mr-4 shrink-0"></div>
              <span className="flex-1 font-semibold text-lg">{item.isim}</span>
              <span className="font-bold text-base bg-gray-100 px-3 py-1 rounded">{item.miktar > 0 ? item.miktar : ''} {item.birim}</span>
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

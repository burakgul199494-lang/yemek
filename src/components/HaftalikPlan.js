import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingCart, Trash2 } from 'lucide-react';

export default function HaftalikPlan({ haftalikPlan, tarifler, planSil }) {
  // Seçili haftanın pazartesi gününü tutuyoruz
  const [aktifPazartesi, setAktifPazartesi] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  // Pazartesi'den başlayarak 7 günü oluşturan yardımcı fonksiyon
  const getHaftaninGunleri = (pazartesiTarih) => {
    const gunler = [];
    for (let i = 0; i < 7; i++) {
      const g = new Date(pazartesiTarih);
      g.setDate(pazartesiTarih.getDate() + i);
      
      // SAAT DİLİMİ (TIMEZONE) KAYMASINI ÖNLEYEN YENİ KOD
      // Artık evrensel saate çevirmek yerine doğrudan yerel YYYY-MM-DD formatını üretiyoruz.
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

  const haftaDegistir = (yon) => {
    const yeniPazartesi = new Date(aktifPazartesi);
    yeniPazartesi.setDate(aktifPazartesi.getDate() + (yon * 7));
    setAktifPazartesi(yeniPazartesi);
  };

  // Bu hafta içinde planlanmış tüm tarifleri toplayıp konsolide market listesi çıkaran fonksiyon
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
    <div className="animate-in fade-in duration-300 mb-12">
      {/* Üst Hafta Navigasyonu */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <h2 className="text-xl font-bold text-orange-800 flex items-center">
          <CalendarDays className="mr-2" size={24} /> Haftalık Menü Planı
        </h2>
        
        <div className="flex items-center gap-3">
          <button onClick={() => haftaDegistir(-1)} className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg border border-orange-200 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-sm sm:text-base text-slate-700 min-w-[200px] text-center">
            {haftaninGunleri[0].gosterimStr.split(',')[1]} - {haftaninGunleri[6].gosterimStr.split(',')[1]}
          </span>
          <button onClick={() => haftaDegistir(1)} className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg border border-orange-200 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Günlük Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {haftaninGunleri.map(gun => {
          const planKaydi = haftalikPlan[gun.isoStr];
          const planlananTarifler = planKaydi ? planKaydi.tarifler.map(id => tarifler.find(t => t.id === id)).filter(Boolean) : [];

          return (
            <div key={gun.isoStr} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
              <div>
                <div className="border-b pb-2 mb-3">
                  <span className="block font-bold text-slate-800 text-base">{gun.gosterimStr.split(',')[0]}</span>
                  <span className="text-xs text-slate-400 font-medium">{gun.gosterimStr.split(',')[1]}</span>
                </div>

                {planKaydi ? (
                  <div className="mb-3">
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded mb-2">
                      📦 {planKaydi.menuAdi}
                    </span>
                    <div className="space-y-2">
                      {planlananTarifler.map((t, idx) => (
                        <div key={idx} className="bg-orange-50 p-2 rounded-lg border border-orange-100 text-xs">
                          <span className="font-bold text-slate-800 block truncate">{t.ad}</span>
                          <span className="text-[10px] text-slate-500 uppercase">({t.kategori})</span>
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

      {/* Haftalık Alışveriş Listesi Bölümü */}
      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
        <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center border-b border-orange-200 pb-3">
          <ShoppingCart className="mr-2 text-orange-600" size={24} /> Bu Haftanın Toplu Alışveriş Listesi
        </h3>

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
  );
}

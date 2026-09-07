import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingCart, Trash2, Printer, X, ArrowLeft, ChefHat, Image as ImageIcon } from 'lucide-react';

export default function HaftalikPlan({ haftalikPlan, tarifler, menuler, planTemizle, plandanOgeSil, getGunlukTopluMalzemeler, setAktifSekme, setDetayGosterilenTarif, setNeredenGeldi, setAcikResim }) {
  const [aktifPazartesi, setAktifPazartesi] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const [detayGosterilenGun, setDetayGosterilenGun] = useState(null);

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
          if (!liste[key]) { liste[key] = { isim: m.isim.charAt(0).toUpperCase() + m.isim.slice(1), birim: m.birim, miktar: 0 }; }
          liste[key].miktar += Number(m.miktar) || 0;
        });
      });
    });
    return Object.values(liste).sort((a,b) => a.isim.localeCompare(b.isim));
  };

  const haftalikAlisveris = getHaftalikTopluMalzemeler();

  if (detayGosterilenGun) {
    const gunObj = haftaninGunleri.find(g => g.isoStr === detayGosterilenGun) || { gunFormat: detayGosterilenGun, gunIsim: '' };
    const planKaydi = haftalikPlan[detayGosterilenGun];
    const gununTarifleri = planKaydi ? (planKaydi.tarifler || []).map(id => tarifler.find(t => t.id === id)).filter(Boolean) : [];
    const alisverisListesi = getGunlukTopluMalzemeler(gununTarifleri);

    return (
      <div className="animate-in fade-in duration-300">
        <div className="print:hidden">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setDetayGosterilenGun(null)} className="flex items-center text-orange-800 md:hover:text-orange-600 font-bold">
              <ArrowLeft size={20} className="mr-2"/> Haftalık Plana Dön
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 md:hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center shadow-sm text-sm">
              <Printer size={18} className="mr-2" /> PDF / Çıktı Al
            </button>
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 border-b-2 border-orange-200 pb-2 text-center sm:text-left">
            {gunObj.gunFormat} {gunObj.gunIsim} Programı
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center border-b border-orange-200 pb-2">
                <ShoppingCart className="mr-2" size={20}/> Günlük İhtiyaçlar
              </h3>
              <ul className="space-y-3">
                {alisverisListesi.map((m, i) => (
                  <li key={i} className="flex justify-between items-center text-slate-700 text-sm border-b border-orange-100 pb-1">
                    <span className="font-medium">{m.isim}</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm">{m.miktar} {m.birim}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              {gununTarifleri.map(tarif => (
                <div key={tarif.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 flex items-center">
                        <ChefHat className="mr-2 text-orange-500" size={22}/> {tarif.ad}
                      </h3>
                      <span className="text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-medium inline-block mt-2">
                        {tarif.kategori}
                      </span>
                    </div>
                    <button 
                      onClick={() => { setDetayGosterilenTarif(tarif); setNeredenGeldi('plan'); setAktifSekme('tarifler'); }}
                      className="text-xs text-blue-600 font-bold bg-blue-50 md:hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors shrink-0 shadow-sm"
                    >
                      Tam Detayı Gör →
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h4 className="font-bold text-slate-700 text-sm mb-3 border-b border-slate-200 pb-1">Hazırlanışı:</h4>
                    {Array.isArray(tarif.hazirlanis) ? (
                      <ul className="space-y-4">
                        {tarif.hazirlanis.map((adim, i) => {
                          const metin = typeof adim === 'string' ? adim : adim.metin;
                          const resim = typeof adim === 'object' ? adim.resim : null;
                          if (!metin || !metin.trim()) return null;
                          return (
                            <li key={i} className="flex gap-3 items-start border-b border-slate-50 pb-2 last:border-0">
                              <span className="font-extrabold text-orange-600 bg-orange-100 w-6 h-6 flex items-center justify-center rounded-full shrink-0">{i+1}</span>
                              <div className="flex-1">
                                <p className="mt-0.5">{metin}</p>
                                {resim && (
                                  <button onClick={() => setAcikResim(resim)} className="mt-2 flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg md:hover:bg-blue-100 border border-blue-100 font-bold transition-colors shadow-sm w-fit">
                                    <ImageIcon size={14} /> Fotoğrafı Aç
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">{tarif.hazirlanis}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden print:block print:w-full print:bg-white print:text-black print:p-4">
          <div className="text-center border-b-4 border-black pb-4 mb-6">
            <h1 className="text-3xl font-extrabold uppercase tracking-wider mb-2">Günlük Mutfak Programı</h1>
            <p className="text-xl font-bold text-gray-700">{gunObj.gunFormat} {gunObj.gunIsim}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold border-b-2 border-gray-400 mb-4 pb-1">Günlük İhtiyaç Listesi</h2>
            <div className="flex flex-col space-y-4">
              {alisverisListesi.map((item, idx) => (
                <div key={idx} className="flex items-center border-b border-dashed border-gray-400 pb-2">
                  <div className="w-6 h-6 border-2 border-gray-600 rounded-sm mr-4 shrink-0"></div>
                  <span className="flex-1 font-semibold text-lg">{item.isim}</span>
                  <span className="font-bold text-base bg-gray-100 px-3 py-1 rounded">{item.miktar > 0 ? item.miktar : ''} {item.birim}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="break-before-page">
            <div className="text-center border-b-2 border-black pb-4 mb-6 pt-4">
              <h1 className="text-3xl font-extrabold uppercase tracking-wider mb-2">Tarifler ve Yapılışları</h1>
              <p className="text-lg font-medium text-gray-700">{gunObj.gunFormat} {gunObj.gunIsim}</p>
            </div>
            
            {gununTarifleri.map(t => (
              <div key={t.id} className="mb-8 break-inside-avoid border border-gray-300 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-3 flex items-center bg-gray-100 p-2 rounded">{t.ad}</h3>
                <div className="mb-3 text-sm">
                  <strong>Malzemeler: </strong> 
                  {t.malzemeler.map((m,i) => <span key={i}>{m.miktar} {m.birim} {m.isim}{i < t.malzemeler.length-1 ? ', ' : ''}</span>)}
                </div>
                <div>
                  <strong className="block mb-2">Hazırlanışı:</strong>
                  {Array.isArray(t.hazirlanis) ? (
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      {t.hazirlanis.map((adim, i) => {
                        const metin = typeof adim === 'string' ? adim : adim.metin;
                        return metin && metin.trim() ? <li key={i}>{metin}</li> : null;
                      })}
                    </ol>
                  ) : <p className="text-sm">{t.hazirlanis}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="animate-in fade-in duration-300 mb-12 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
          <h2 className="text-xl font-bold text-orange-800 flex items-center w-full justify-center sm:w-auto sm:justify-start">
            <CalendarDays className="mr-2" size={24} /> Haftalık Menü Planı
          </h2>
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 bg-slate-50 sm:bg-transparent p-1.5 sm:p-0 rounded-xl">
            <button onClick={() => haftaDegistir(-1)} className="p-2 bg-white sm:bg-orange-50 md:hover:bg-orange-100 text-orange-800 rounded-lg border border-orange-200 transition-colors shrink-0 shadow-sm sm:shadow-none"><ChevronLeft size={20} /></button>
            <span className="font-bold text-[11px] sm:text-base text-slate-700 text-center flex-1 whitespace-nowrap px-1">{haftaAraligiMetni}</span>
            <button onClick={() => haftaDegistir(1)} className="p-2 bg-white sm:bg-orange-50 md:hover:bg-orange-100 text-orange-800 rounded-lg border border-orange-200 transition-colors shrink-0 shadow-sm sm:shadow-none"><ChevronRight size={20} /></button>
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
                  <div className="border-b pb-2 mb-3 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 text-center sm:text-left">
                    <div>
                      <span className="block font-bold text-slate-800 text-sm xl:text-base">{gun.gunFormat}</span>
                      <span className="text-xs text-slate-500 font-medium">{gun.gunIsim}</span>
                    </div>
                    {planKaydi && (
                      <button onClick={() => planTemizle(gun.isoStr)} className="text-slate-400 md:hover:text-red-600 bg-slate-50 md:hover:bg-red-50 p-1.5 rounded-lg transition-colors mt-1 sm:mt-0 w-full sm:w-auto flex justify-center" title="Tüm Günü Temizle"><Trash2 size={16} /></button>
                    )}
                  </div>

                  {planKaydi ? (
                    <div className="mb-2">
                      {gununMenuleri.map((menu, idx) => (
                        <div key={`menu-${idx}`} className="mb-3 bg-orange-50/70 p-2 rounded-xl border border-orange-100 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center">📦 {menu.ad}</span>
                            <button onClick={() => plandanOgeSil(gun.isoStr, 'menu', menu)} className="text-red-400 md:hover:text-red-600 md:hover:bg-red-50 p-1 rounded transition-colors"><X size={14}/></button>
                          </div>
                          <div className="space-y-1 pl-1">
                            {menu.tarifler.map(tId => {
                              const t = tarifler.find(x => x.id === tId);
                              return t ? <div key={tId} className="text-[10px] font-medium text-slate-600 border-l-2 border-orange-300 pl-1.5 py-0.5">{t.ad}</div> : null;
                            })}
                          </div>
                        </div>
                      ))}

                      {ekstraTarifler.length > 0 && (
                        <div className="mb-3 bg-blue-50/70 p-2 rounded-xl border border-blue-100 shadow-sm">
                          <div className="mb-2"><span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded flex w-fit mx-auto sm:mx-0">🍽️ Ekstra Seçimler</span></div>
                          <div className="space-y-1.5">
                            {ekstraTarifler.map(t => (
                              <div key={t.id} className="bg-white p-1.5 rounded-lg border border-blue-50 flex justify-between items-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="flex flex-col truncate pr-2"><span className="font-bold text-slate-700 text-[10px] truncate">{t.ad}</span></div>
                                <button onClick={() => plandanOgeSil(gun.isoStr, 'tarif', t)} className="text-red-400 md:hover:text-red-600 md:hover:bg-red-50 p-1 rounded transition-colors shrink-0"><X size={14}/></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : <div className="text-center py-8 text-slate-300 text-xs italic">Plan yok</div>}
                </div>

                {planKaydi && (
                  <button onClick={() => setDetayGosterilenGun(gun.isoStr)} className="w-full mt-3 bg-blue-50 md:hover:bg-blue-100 text-blue-700 p-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors border border-blue-100">
                    Günün Detayını Gör →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-orange-200 pb-4 gap-4">
            <h3 className="text-xl font-bold text-orange-900 flex items-center"><ShoppingCart className="mr-2 text-orange-600" size={24} /> Toplu Alışveriş Listesi</h3>
            {haftalikAlisveris.length > 0 && <button onClick={() => window.print()} className="bg-blue-600 md:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md transition-colors w-full sm:w-auto justify-center"><Printer size={18} className="mr-2" /> PDF / Çıktı Al</button>}
          </div>
          {haftalikAlisveris.length === 0 ? <p className="text-sm text-slate-500 italic text-center sm:text-left">Bu hafta için henüz planlanmış bir menü bulunmuyor.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {haftalikAlisveris.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex justify-between items-center">
                  <span className="text-slate-700 font-medium text-sm">{item.isim}</span>
                  <span className="font-bold text-slate-900 bg-orange-50 px-2.5 py-1 rounded-lg text-xs border border-orange-200">{item.miktar > 0 ? item.miktar : ''} {item.birim}</span>
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
        <div className="flex flex-col space-y-4">
          {haftalikAlisveris.map((item, idx) => (
            <div key={idx} className="flex items-center border-b border-dashed border-gray-400 pb-2">
              <div className="w-6 h-6 border-2 border-gray-600 rounded-sm mr-4 shrink-0"></div>
              <span className="flex-1 font-semibold text-lg">{item.isim}</span>
              <span className="font-bold text-base bg-gray-100 px-3 py-1 rounded">{item.miktar > 0 ? item.miktar : ''} {item.birim}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

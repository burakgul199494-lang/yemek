import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, ChefHat, Check, Calendar } from 'lucide-react';

export default function Menulerim({ 
  menuler, tarifler, getGunlukTopluMalzemeler, 
  setAktifSekme, setDetayGosterilenTarif,
  detayMenu, setDetayMenu, setNeredenGeldi,
  tariheMenuEkle 
}) {
  const [planTarihSecildi, setPlanTarihSecildi] = useState('');
  const [planModalAcik, setPlanModalAcik] = useState(false);

  if (detayMenu) {
    const menuTarifleri = detayMenu.tarifler.map(id => tarifler.find(t => t.id === id)).filter(Boolean);
    const alisverisListesi = getGunlukTopluMalzemeler(menuTarifleri);

    const takvimeIsle = (e) => {
      e.preventDefault();
      if (!planTarihSecildi) return;
      tariheMenuEkle(planTarihSecildi, detayMenu);
      setPlanModalAcik(false);
      setPlanTarihSecildi('');
      alert(`"${detayMenu.ad}" menüsü ${planTarihSecildi} tarihine başarıyla planlandı!`);
    };

    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <button onClick={() => setDetayMenu(null)} className="flex items-center text-orange-800 hover:text-orange-600 font-bold">
            <ArrowLeft size={20} className="mr-2"/> Menülere Dön
          </button>
          
          {/* Takvime Planla Butonu */}
          <button 
            onClick={() => setPlanModalAcik(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold flex items-center shadow-sm text-sm"
          >
            <Calendar size={18} className="mr-2" /> Takvime Planla
          </button>
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6 border-b-2 border-orange-200 pb-2">{detayMenu.ad}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center border-b border-orange-200 pb-2">
              <ShoppingCart className="mr-2" size={20}/> Toplu İhtiyaç Listesi
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
            {menuTarifleri.map(tarif => (
              <div key={tarif.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                
                {/* Yemek Başlığı ve Detaya Git Butonu */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                      <ChefHat className="mr-2 text-orange-500" size={22}/> {tarif.ad}
                    </h3>
                    <span className="text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-medium inline-block mt-2">
                      {tarif.kategori}
                    </span>
                  </div>
                  <button 
                    onClick={() => { 
                      setDetayGosterilenTarif(tarif); 
                      setNeredenGeldi('menuler'); 
                      setAktifSekme('tarifler'); 
                    }}
                    className="text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors shrink-0 ml-2 shadow-sm"
                  >
                    Tam Detayı Gör →
                  </button>
                </div>

                {/* Yemek Yapılışı (Ana Ekranda Doğrudan Görünür) */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-slate-700 text-sm mb-3 border-b border-slate-200 pb-1">Hazırlanışı:</h4>
                  {Array.isArray(tarif.hazirlanis) ? (
                    <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
                      {tarif.hazirlanis.map((adim, i) => adim.trim() && (
                        <li key={i} className="flex gap-2">
                          <span className="font-bold text-orange-600 shrink-0">{i+1}.</span>
                          <span>{adim}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">{tarif.hazirlanis || "Hazırlanış bilgisi girilmemiş."}</p>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Planlama Tarih Seçim Modalı */}
        {planModalAcik && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Hangi Güne Planlansın?</h3>
              <p className="text-xs text-slate-500 mb-4">İstediğin ileri bir tarihi veya haftayı seçebilirsin.</p>
              <form onSubmit={takvimeIsle} className="space-y-4">
                <input 
                  type="date" 
                  required 
                  value={planTarihSecildi} 
                  onChange={(e) => setPlanTarihSecildi(e.target.value)} 
                  className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setPlanModalAcik(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 text-sm">İptal</button>
                  <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-sm">Planı Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-orange-800 border-b-2 border-orange-200 pb-2">Menülerim</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuler.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500">Henüz menü oluşturmadınız.</div>
        ) : (
          menuler.map(menu => (
            <div key={menu.id} onClick={() => setDetayMenu(menu)} className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 cursor-pointer hover:shadow-md transition-shadow group relative">
              <h4 className="text-lg font-bold text-slate-800 mb-3">{menu.ad}</h4>
              <div className="space-y-1">
                {menu.tarifler.map((tId, idx) => {
                  const t = tarifler.find(x => x.id === tId);
                  return t ? (
                    <div key={idx} className="text-sm text-slate-600 flex items-center justify-between border-b border-slate-50 pb-1">
                      <span className="flex items-center"><Check size={14} className="mr-1 text-green-500"/> {t.ad}</span>
                      <span className="text-[10px] text-orange-800 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-medium">({t.kategori})</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

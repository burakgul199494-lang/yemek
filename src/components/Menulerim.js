import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, ChefHat, Check } from 'lucide-react';

export default function Menulerim({ menuler, tarifler, getGunlukTopluMalzemeler }) {
  const [detayMenu, setDetayMenu] = useState(null);

  if (detayMenu) {
    const menuTarifleri = detayMenu.tarifler.map(id => tarifler.find(t => t.id === id)).filter(Boolean);
    const alisverisListesi = getGunlukTopluMalzemeler(menuTarifleri);

    return (
      <div className="animate-in fade-in duration-300">
        <button onClick={() => setDetayMenu(null)} className="flex items-center text-orange-800 hover:text-orange-600 font-bold mb-4">
          <ArrowLeft size={20} className="mr-2"/> Menülere Dön
        </button>
        
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
                <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center">
                  <ChefHat className="mr-2 text-orange-500" size={22}/> {tarif.ad}
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg text-slate-700 whitespace-pre-wrap text-sm leading-relaxed border border-slate-100">
                  {tarif.hazirlanis || "Hazırlanış bilgisi girilmemiş."}
                </div>
              </div>
            ))}
          </div>
        </div>
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
                    <div key={idx} className="text-sm text-slate-600 flex items-center">
                      <Check size={14} className="mr-2 text-green-500"/> {t.ad}
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

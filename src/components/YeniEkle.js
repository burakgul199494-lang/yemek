import React, { useState } from 'react';
import { Plus, X, Layers, ChefHat, Trash2 } from 'lucide-react';

export default function YeniEkle({ 
  yeniTarif, setYeniTarif, yeniMenu, setYeniMenu, tarifler, menuler,
  tarifKaydet, menuKaydet, KATEGORILER, BIRIMLER, malzemeIslem, 
  resimYukle, menuTarifToggle, tarifSil, menuSil 
}) {
  const [islemTipi, setIslemTipi] = useState('tarif');

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 mb-8">
      {/* Üst Geçiş Butonları */}
      <div className="flex bg-orange-100 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setIslemTipi('tarif')}
          className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center transition-all ${islemTipi === 'tarif' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/60 hover:text-orange-800'}`}
        >
          <ChefHat size={20} className="mr-2" /> Yemek Yönetimi
        </button>
        <button 
          onClick={() => setIslemTipi('menu')}
          className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center transition-all ${islemTipi === 'menu' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/60 hover:text-orange-800'}`}
        >
          <Layers size={20} className="mr-2" /> Menü Yönetimi
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-orange-100 mb-6">
        {islemTipi === 'tarif' ? (
          // TARİF EKLEME FORMU
          <form onSubmit={tarifKaydet} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Yemek Adı</label>
                  <input type="text" required value={yeniTarif.ad} onChange={(e) => setYeniTarif({...yeniTarif, ad: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50" placeholder="Örn: Mantı" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select value={yeniTarif.kategori} onChange={(e) => setYeniTarif({...yeniTarif, kategori: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50">
                    {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>

              {/* Malzemeler */}
              <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100">
                <div className="flex justify-between items-center mb-3 border-b border-orange-200 pb-2">
                  <h3 className="font-semibold text-slate-800">Malzemeler</h3>
                  <button type="button" onClick={malzemeIslem.ekle} className="text-white bg-orange-500 px-3 py-1 rounded-lg flex items-center text-xs font-medium">
                    <Plus size={14} className="mr-1" /> Ekle
                  </button>
                </div>
                <div className="space-y-3">
                  {yeniTarif.malzemeler.map((malzeme, index) => (
                    <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-orange-100">
                      <input type="number" placeholder="Miktar" value={malzeme.miktar} onChange={(e) => malzemeIslem.guncelle(index, 'miktar', e.target.value)} className="w-20 p-2 border rounded-lg text-sm bg-slate-50" />
                      <select value={malzeme.birim} onChange={(e) => malzemeIslem.guncelle(index, 'birim', e.target.value)} className="w-28 p-2 border rounded-lg text-sm bg-slate-50">
                        {BIRIMLER.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <input type="text" placeholder="Malzeme (Örn: Havuç)" required value={malzeme.isim} onChange={(e) => malzemeIslem.guncelle(index, 'isim', e.target.value)} className="flex-1 p-2 border rounded-lg text-sm bg-slate-50" />
                      {yeniTarif.malzemeler.length > 1 && (
                        <button type="button" onClick={() => malzemeIslem.sil(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hazırlanışı */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hazırlanışı</label>
                <textarea rows="4" value={yeniTarif.hazirlanis} onChange={(e) => setYeniTarif({...yeniTarif, hazirlanis: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50" placeholder="1. Adım..."></textarea>
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md">
                Tarifi Kaydet
              </button>
          </form>
        ) : (
          // MENÜ OLUŞTURMA FORMU
          <form onSubmit={menuKaydet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Menü Adı</label>
              <input type="text" required value={yeniMenu.ad} onChange={e => setYeniMenu({...yeniMenu, ad: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50" placeholder="Örn: Akşam Menüsü" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Yemek Seçimi</label>
              <div className="max-h-72 overflow-y-auto border rounded-lg bg-white shadow-inner">
                {KATEGORILER.map(kategori => {
                  const kategoriTarifleri = tarifler.filter(t => t.kategori === kategori);
                  if (kategoriTarifleri.length === 0) return null;
                  return (
                    <div key={kategori}>
                      <div className="sticky top-0 bg-slate-100 text-slate-600 font-bold text-xs px-3 py-2 uppercase z-10 border-b">{kategori}</div>
                      <div className="p-1">
                        {kategoriTarifleri.map(tarif => (
                          <label key={tarif.id} className="flex items-center p-3 hover:bg-orange-50 rounded cursor-pointer border-b border-slate-50">
                            <input type="checkbox" checked={yeniMenu.tarifler.includes(tarif.id)} onChange={() => menuTarifToggle(tarif.id)} className="w-5 h-5 text-orange-600 rounded mr-3" />
                            <span className="text-sm font-medium text-slate-800">{tarif.ad}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md">Menüyü Kaydet</button>
          </form>
        )}
      </div>

      {/* SİLME VE YÖNETİM BÖLÜMÜ */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-red-100">
        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">
          Mevcut {islemTipi === 'tarif' ? 'Yemekleri' : 'Menüleri'} Sil
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {islemTipi === 'tarif' && tarifler.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg">
              <span className="font-medium text-slate-700">{t.ad}</span>
              <button onClick={() => tarifSil(t.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors">
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
          {islemTipi === 'menu' && menuler.map(m => (
            <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg">
              <span className="font-medium text-slate-700">{m.ad}</span>
              <button onClick={() => menuSil(m.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors">
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

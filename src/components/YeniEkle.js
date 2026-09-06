import React, { useState } from 'react';
import { Plus, X, Layers, ChefHat, Trash2, Edit, Search } from 'lucide-react';

export default function YeniEkle({ 
  yeniTarif, setYeniTarif, yeniMenu, setYeniMenu, tarifler, menuler,
  tarifKaydet, menuKaydet, KATEGORILER, BIRIMLER, malzemeIslem, hazirlanisIslem,
  resimYukle, menuTarifToggle, tarifSil, menuSil 
}) {
  const [islemTipi, setIslemTipi] = useState('tarif');
  
  // Menü oluştururken yemekleri kolayca bulabilmek için arama/filtre stateleri
  const [menuArananYemek, setMenuArananYemek] = useState('');
  const [menuSeciliKategori, setMenuSeciliKategori] = useState('Tümü');

  // Aşağıdaki listeden düzenle butonuna tıklandığında çalışacak fonksiyonlar
  const handleTarifDuzenle = (t) => {
    // Eski kaydedilmiş string ise diziye çeviriyoruz ki formda satır satır gözüksün
    const hazirlanisDizisi = Array.isArray(t.hazirlanis) ? t.hazirlanis : (t.hazirlanis ? t.hazirlanis.split('\n') : ['']);
    setYeniTarif({ ...t, hazirlanis: hazirlanisDizisi });
    setIslemTipi('tarif');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuDuzenle = (m) => {
    setYeniMenu(m);
    setIslemTipi('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          
          <form onSubmit={tarifKaydet} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Yemek Adı</label>
                  <input type="text" required value={yeniTarif.ad} onChange={(e) => setYeniTarif({...yeniTarif, ad: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Örn: Mantı" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select value={yeniTarif.kategori} onChange={(e) => setYeniTarif({...yeniTarif, kategori: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50 outline-none">
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
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white p-3 rounded-lg border border-orange-100 shadow-sm sm:border-none sm:p-0 sm:shadow-none sm:bg-transparent">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input type="number" placeholder="Miktar" value={malzeme.miktar} onChange={(e) => malzemeIslem.guncelle(index, 'miktar', e.target.value)} className="w-1/3 sm:w-20 p-2.5 border rounded-lg text-sm bg-slate-50 outline-none" />
                        <select value={malzeme.birim} onChange={(e) => malzemeIslem.guncelle(index, 'birim', e.target.value)} className="w-2/3 sm:w-28 p-2.5 border rounded-lg text-sm bg-slate-50 outline-none">
                          {BIRIMLER.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 w-full sm:flex-1">
                        <input type="text" placeholder="Malzeme (Örn: Havuç)" required value={malzeme.isim} onChange={(e) => malzemeIslem.guncelle(index, 'isim', e.target.value)} className="flex-1 p-2.5 border rounded-lg text-sm bg-slate-50 outline-none" />
                        {yeniTarif.malzemeler.length > 1 && (
                          <button type="button" onClick={() => malzemeIslem.sil(index)} className="p-2.5 text-red-500 bg-red-50 rounded-lg sm:bg-transparent hover:text-red-700">
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dinamik Hazırlanışı Bölümü */}
              <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100">
                <div className="flex justify-between items-center mb-3 border-b border-orange-200 pb-2">
                  <h3 className="font-semibold text-slate-800">Hazırlanışı (Adım Adım)</h3>
                  <button type="button" onClick={hazirlanisIslem.ekle} className="text-white bg-orange-500 px-3 py-1 rounded-lg flex items-center text-xs font-medium">
                    <Plus size={14} className="mr-1" /> Adım Ekle
                  </button>
                </div>
                <div className="space-y-3">
                  {(Array.isArray(yeniTarif.hazirlanis) ? yeniTarif.hazirlanis : ['']).map((adim, index) => (
                    <div key={index} className="flex gap-2 items-start bg-white p-2 rounded-lg border border-orange-100 shadow-sm">
                      <span className="font-bold text-orange-600 mt-2 ml-1">{index + 1}.</span>
                      <textarea rows="2" placeholder="Örn: Soğanları ince ince doğrayın..." required value={adim} onChange={(e) => hazirlanisIslem.guncelle(index, e.target.value)} className="flex-1 p-2 border rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-orange-300"></textarea>
                      {(Array.isArray(yeniTarif.hazirlanis) ? yeniTarif.hazirlanis : []).length > 1 && (
                        <button type="button" onClick={() => hazirlanisIslem.sil(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md text-lg">
                {yeniTarif.id ? 'Tarifi Güncelle' : 'Tarifi Kaydet'}
              </button>
          </form>

        ) : (
          
          <form onSubmit={menuKaydet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Menü Adı</label>
              <input type="text" required value={yeniMenu.ad} onChange={e => setYeniMenu({...yeniMenu, ad: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Örn: Akşam Menüsü" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Yemek Seçimi</label>
              
              {/* Menü için yemek arama & filtre */}
              <div className="flex gap-2 mb-3 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" placeholder="Hızlıca yemek ara..." value={menuArananYemek} onChange={(e) => setMenuArananYemek(e.target.value)} className="w-full pl-9 p-2.5 border rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <select value={menuSeciliKategori} onChange={(e) => setMenuSeciliKategori(e.target.value)} className="w-full sm:w-32 p-2.5 border rounded-lg bg-slate-50 text-sm outline-none">
                  <option value="Tümü">Tümü</option>
                  {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div className="max-h-72 overflow-y-auto border rounded-lg bg-white shadow-inner">
                {(() => {
                  const gosterilecekKategoriler = menuSeciliKategori === 'Tümü' ? KATEGORILER : [menuSeciliKategori];
                  return gosterilecekKategoriler.map(kategori => {
                    const kategoriTarifleri = tarifler.filter(t => t.kategori === kategori && t.ad.toLowerCase().includes(menuArananYemek.toLowerCase()));
                    if (kategoriTarifleri.length === 0) return null;
                    return (
                      <div key={kategori}>
                        <div className="sticky top-0 bg-slate-100 text-slate-600 font-bold text-xs px-3 py-2 uppercase z-10 border-b">{kategori}</div>
                        <div className="p-1">
                          {kategoriTarifleri.map(tarif => (
                            <label key={tarif.id} className="flex items-center p-3 hover:bg-orange-50 rounded cursor-pointer border-b border-slate-50 transition-colors">
                              <input type="checkbox" checked={yeniMenu.tarifler.includes(tarif.id)} onChange={() => menuTarifToggle(tarif.id)} className="w-5 h-5 text-orange-600 rounded mr-3 accent-orange-600" />
                              <span className="text-sm font-medium text-slate-800">{tarif.ad}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
                {tarifler.length === 0 && <div className="p-4 text-center text-sm text-slate-500">Kayıtlı tarif bulunamadı.</div>}
              </div>
            </div>

            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md text-lg">
              {yeniMenu.id ? 'Menüyü Güncelle' : 'Menüyü Kaydet'}
            </button>
          </form>
        )}
      </div>

      {/* SİLME VE YÖNETİM BÖLÜMÜ */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">
          Mevcut {islemTipi === 'tarif' ? 'Yemekleri' : 'Menüleri'} Yönet
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {islemTipi === 'tarif' && tarifler.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg hover:border-orange-200 transition-colors">
              <span className="font-medium text-slate-700">{t.ad}</span>
              <div className="flex gap-1">
                <button onClick={() => handleTarifDuzenle(t)} className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Düzenle">
                  <Edit size={18}/>
                </button>
                <button onClick={() => tarifSil(t.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Sil">
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
          {islemTipi === 'menu' && menuler.map(m => (
            <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg hover:border-orange-200 transition-colors">
              <span className="font-medium text-slate-700">{m.ad}</span>
              <div className="flex gap-1">
                <button onClick={() => handleMenuDuzenle(m)} className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Düzenle">
                  <Edit size={18}/>
                </button>
                <button onClick={() => menuSil(m.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Sil">
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

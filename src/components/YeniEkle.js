import React, { useState } from 'react';
import { Plus, X, Layers, ChefHat, Trash2, Edit, Search, FolderPlus, ChevronUp, ChevronDown, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function YeniEkle({ 
  yeniTarif, setYeniTarif, yeniMenu, setYeniMenu, tarifler, menuler,
  tarifKaydet, menuKaydet, yemekKategorileri, menuKategorileri, BIRIMLER, 
  malzemeIslem, hazirlanisIslem, resimYukle, resimYukleniyor,
  menuTarifToggle, tarifSil, menuSil, kategoriEkle, kategoriSil, kategoriTasi, hizliKategoriGuncelle
}) {
  const [islemTipi, setIslemTipi] = useState('tarif');
  const [menuArananYemek, setMenuArananYemek] = useState('');
  const [menuSeciliKategori, setMenuSeciliKategori] = useState('Tümü');
  const [yeniKatAd, setYeniKatAd] = useState('');

  const handleTarifDuzenle = (t) => {
    let hazirlanisDizisi = [];
    if (Array.isArray(t.hazirlanis)) {
      hazirlanisDizisi = t.hazirlanis.map(a => typeof a === 'string' ? {metin: a, resim: ''} : a);
    } else if (t.hazirlanis) {
      hazirlanisDizisi = t.hazirlanis.split('\n').map(a => ({metin: a, resim: ''}));
    } else {
      hazirlanisDizisi = [{metin: '', resim: ''}];
    }
    setYeniTarif({ ...t, hazirlanis: hazirlanisDizisi });
    setIslemTipi('tarif');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuDuzenle = (m) => { setYeniMenu(m); setIslemTipi('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleKatEkle = (e) => { e.preventDefault(); kategoriEkle(islemTipi, yeniKatAd); setYeniKatAd(''); };
  const aktifKategoriler = islemTipi === 'tarif' ? yemekKategorileri : menuKategorileri;
  const gosterilenKategoriler = aktifKategoriler.filter(k => k !== 'Kategorisiz');

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 mb-8">
      {resimYukleniyor && (
        <div className="fixed inset-0 bg-white/80 z-[150] flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 size={48} className="text-orange-500 animate-spin mb-4" />
          <p className="text-orange-800 font-bold text-lg">Fotoğraf Buluta Yükleniyor...</p>
        </div>
      )}

      <div className="flex bg-orange-100 p-1 rounded-xl mb-6">
        <button onClick={() => setIslemTipi('tarif')} className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center transition-all ${islemTipi === 'tarif' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/60 hover:text-orange-800'}`}><ChefHat size={20} className="mr-2" /> Yemek Yönetimi</button>
        <button onClick={() => setIslemTipi('menu')} className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center transition-all ${islemTipi === 'menu' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/60 hover:text-orange-800'}`}><Layers size={20} className="mr-2" /> Menü Yönetimi</button>
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
                    {yemekKategorileri.filter(k => k !== 'Kategorisiz').map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ana Yemek Fotoğrafı</label>
                <div className="flex items-center gap-4">
                  <div className="relative overflow-hidden w-24 h-24 bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl flex items-center justify-center text-orange-400 hover:bg-orange-100 transition-colors">
                    {yeniTarif.resim ? (
                      <img src={yeniTarif.resim} alt="Tarif" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center"><ImageIcon size={24} /><span className="text-[10px] mt-1 font-bold">Resim Seç</span></div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => resimYukle(e, 'tarif', null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  {yeniTarif.resim && (
                    <button type="button" onClick={() => setYeniTarif({...yeniTarif, resim: ''})} className="text-red-500 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Fotoğrafı Kaldır</button>
                  )}
                </div>
              </div>

              <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100">
                <div className="flex justify-between items-center mb-3 border-b border-orange-200 pb-2">
                  <h3 className="font-semibold text-slate-800">Malzemeler</h3>
                  <button type="button" onClick={malzemeIslem.ekle} className="text-white bg-orange-500 px-3 py-1 rounded-lg flex items-center text-xs font-medium"><Plus size={14} className="mr-1" /> Ekle</button>
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
                        {yeniTarif.malzemeler.length > 1 && <button type="button" onClick={() => malzemeIslem.sil(index)} className="p-2.5 text-red-500 bg-red-50 rounded-lg sm:bg-transparent hover:text-red-700"><X size={18} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100">
                <div className="flex justify-between items-center mb-3 border-b border-orange-200 pb-2">
                  <h3 className="font-semibold text-slate-800">Hazırlanışı (Adım Adım)</h3>
                  <button type="button" onClick={hazirlanisIslem.ekle} className="text-white bg-orange-500 px-3 py-1 rounded-lg flex items-center text-xs font-medium"><Plus size={14} className="mr-1" /> Adım Ekle</button>
                </div>
                <div className="space-y-3">
                  {(Array.isArray(yeniTarif.hazirlanis) ? yeniTarif.hazirlanis : [{metin:'', resim:''}]).map((adim, index) => {
                    const metin = typeof adim === 'string' ? adim : adim.metin;
                    const resim = typeof adim === 'object' ? adim.resim : null;
                    return (
                      <div key={index} className="flex gap-2 items-start bg-white p-2 rounded-lg border border-orange-100 shadow-sm">
                        <span className="font-bold text-orange-600 mt-2 ml-1">{index + 1}.</span>
                        
                        <div className="flex-1 flex flex-col gap-2">
                          <textarea rows="2" placeholder="Örn: Soğanları ince ince doğrayın..." required value={metin} onChange={(e) => hazirlanisIslem.guncelle(index, e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-orange-300"></textarea>
                          
                          <div className="flex items-center gap-2">
                            {resim ? (
                              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-1 pl-2 rounded-lg pr-1 w-fit">
                                <ImageIcon size={14} className="text-blue-500"/>
                                <span className="text-[10px] text-blue-700 font-bold">Resim Eklendi</span>
                                <button type="button" onClick={() => hazirlanisIslem.resimSil(index)} className="bg-white p-1 rounded-md text-red-500 hover:bg-red-50 ml-2 shadow-sm border border-slate-100"><X size={12}/></button>
                              </div>
                            ) : (
                              <div className="relative cursor-pointer bg-slate-50 border border-dashed border-slate-300 text-slate-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 transition-colors px-3 py-1.5 rounded-lg flex items-center w-fit">
                                <ImageIcon size={14} className="mr-1.5"/> <span className="text-[10px] font-bold">Adıma Fotoğraf Ekle (Opsiyonel)</span>
                                <input type="file" accept="image/*" onChange={(e) => resimYukle(e, 'tarif', index)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                              </div>
                            )}
                          </div>
                        </div>

                        {(Array.isArray(yeniTarif.hazirlanis) ? yeniTarif.hazirlanis : []).length > 1 && <button type="button" onClick={() => hazirlanisIslem.sil(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><X size={18} /></button>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md text-lg">
                {yeniTarif.id ? 'Tarifi Güncelle' : 'Tarifi Kaydet'}
              </button>
          </form>
        ) : (
          <form onSubmit={menuKaydet} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Menü Adı</label><input type="text" required value={yeniMenu.ad} onChange={e => setYeniMenu({...yeniMenu, ad: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Örn: Akşam Menüsü" /></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Menü Kategorisi</label>
                <select value={yeniMenu.kategori} onChange={(e) => setYeniMenu({...yeniMenu, kategori: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50 outline-none">{menuKategorileri.filter(k => k !== 'Kategorisiz').map(k => <option key={k} value={k}>{k}</option>)}</select>
              </div>
            </div>

            {/* YENİ: MENÜ FOTOĞRAFI YÜKLEME KISMI */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Menü Kapak Fotoğrafı (Opsiyonel)</label>
              <div className="flex items-center gap-4">
                <div className="relative overflow-hidden w-24 h-24 bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl flex items-center justify-center text-orange-400 hover:bg-orange-100 transition-colors">
                  {yeniMenu.resim ? (
                    <img src={yeniMenu.resim} alt="Menü" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center"><ImageIcon size={24} /><span className="text-[10px] mt-1 font-bold">Resim Seç</span></div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => resimYukle(e, 'menu', null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                {yeniMenu.resim && (
                  <button type="button" onClick={() => setYeniMenu({...yeniMenu, resim: ''})} className="text-red-500 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Fotoğrafı Kaldır</button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Yemek Seçimi</label>
              <div className="flex gap-2 mb-3 flex-col sm:flex-row">
                <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input type="text" placeholder="Hızlıca yemek ara..." value={menuArananYemek} onChange={(e) => setMenuArananYemek(e.target.value)} className="w-full pl-9 p-2.5 border rounded-lg bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <select value={menuSeciliKategori} onChange={(e) => setMenuSeciliKategori(e.target.value)} className="w-full sm:w-32 p-2.5 border rounded-lg bg-slate-50 text-sm outline-none"><option value="Tümü">Tümü</option>{yemekKategorileri.map(k => <option key={k} value={k}>{k}</option>)}</select>
              </div>
              <div className="max-h-72 overflow-y-auto border rounded-lg bg-white shadow-inner">
                {(() => {
                  const filtreliKatlar = menuSeciliKategori === 'Tümü' ? yemekKategorileri : [menuSeciliKategori];
                  return filtreliKatlar.map(kategori => {
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
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-md text-lg">{yeniMenu.id ? 'Menüyü Güncelle' : 'Menüyü Kaydet'}</button>
          </form>
        )}
      </div>

      <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm mb-6 text-white">
        <h3 className="font-bold text-lg mb-4 border-b border-slate-700 pb-2 flex items-center"><FolderPlus className="mr-2 text-orange-400" size={20}/> {islemTipi === 'tarif' ? 'Yemek Kategorilerini' : 'Menü Kategorilerini'} Yönet</h3>
        <form onSubmit={handleKatEkle} className="flex gap-2 mb-4">
          <input type="text" placeholder="Yeni Kategori Adı" required value={yeniKatAd} onChange={e => setYeniKatAd(e.target.value)} className="flex-1 p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm outline-none focus:border-orange-400" />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-4 rounded-lg font-bold text-sm transition-colors">Ekle</button>
        </form>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
          {gosterilenKategoriler.map((k, index) => (
            <div key={k} className="flex justify-between items-center bg-slate-700 px-3 py-2 rounded-lg text-sm border border-slate-600 hover:border-orange-500 transition-colors">
              <span className="font-medium text-base">{k}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => kategoriTasi(islemTipi, k, -1)} disabled={index === 0} className={`p-1.5 rounded-md transition-colors ${index === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-600'}`}><ChevronUp size={18}/></button>
                <button type="button" onClick={() => kategoriTasi(islemTipi, k, 1)} disabled={index === gosterilenKategoriler.length - 1} className={`p-1.5 rounded-md transition-colors ${index === gosterilenKategoriler.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-600'}`}><ChevronDown size={18}/></button>
                <button type="button" onClick={() => kategoriSil(islemTipi, k)} className="ml-2 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-md transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Mevcut {islemTipi === 'tarif' ? 'Yemekleri' : 'Menüleri'} Yönet</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {islemTipi === 'tarif' && tarifler.map(t => (
            <div key={t.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 border rounded-lg hover:border-orange-300 transition-colors gap-3">
              <span className="font-bold text-slate-700 flex-1">{t.ad}</span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select value={t.kategori} onChange={(e) => hizliKategoriGuncelle('tarif', t.id, e.target.value)} className="p-1.5 text-xs sm:text-sm font-medium border border-orange-200 rounded-lg bg-white text-orange-800 outline-none focus:ring-2 focus:ring-orange-500 flex-1 sm:w-36 shadow-sm">
                  {yemekKategorileri.filter(k => k !== 'Kategorisiz').map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleTarifDuzenle(t)} className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg transition-colors"><Edit size={18}/></button>
                  <button onClick={() => tarifSil(t.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
          {islemTipi === 'menu' && menuler.map(m => (
            <div key={m.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 border rounded-lg hover:border-orange-300 transition-colors gap-3">
              <span className="font-bold text-slate-700 flex-1">{m.ad}</span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select value={m.kategori} onChange={(e) => hizliKategoriGuncelle('menu', m.id, e.target.value)} className="p-1.5 text-xs sm:text-sm font-medium border border-orange-200 rounded-lg bg-white text-orange-800 outline-none focus:ring-2 focus:ring-orange-500 flex-1 sm:w-36 shadow-sm">
                  {menuKategorileri.filter(k => k !== 'Kategorisiz').map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleMenuDuzenle(m)} className="text-blue-500 hover:bg-blue-100 p-2 rounded-lg transition-colors"><Edit size={18}/></button>
                  <button onClick={() => menuSil(m.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

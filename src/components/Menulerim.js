import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, ChefHat, Calendar, Folder, Search, Layers, Printer, Image as ImageIcon } from 'lucide-react';

export default function Menulerim({ 
  menuler, tarifler, getGunlukTopluMalzemeler, 
  setAktifSekme, setDetayGosterilenTarif,
  detayMenu, setDetayMenu, setNeredenGeldi,
  tariheEkle, menuKategorileri = [], sonTarihMenu, setAcikResim
}) {
  const [planTarihSecildi, setPlanTarihSecildi] = useState('');
  const [planModalAcik, setPlanModalAcik] = useState(false);
  const [menuKlasoru, setMenuKlasoru] = useState(null);
  const [menuArama, setMenuArama] = useState('');
  const [genelMenuArama, setGenelMenuArama] = useState('');

  if (detayMenu) {
    const menuTarifleri = detayMenu.tarifler.map(id => tarifler.find(t => t.id === id)).filter(Boolean);
    const alisverisListesi = getGunlukTopluMalzemeler(menuTarifleri);

    const takvimeIsle = (e) => {
      e.preventDefault();
      if (!planTarihSecildi) return;
      tariheEkle(planTarihSecildi, 'menu', detayMenu);
      setPlanModalAcik(false);
      setPlanTarihSecildi('');
      alert(`"${detayMenu.ad}" menüsü ${planTarihSecildi} tarihine başarıyla eklendi!`);
    };

    return (
      <div className="animate-in fade-in duration-300">
        <div className="print:hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <button onClick={() => setDetayMenu(null)} className="flex items-center text-orange-800 hover:text-orange-600 font-bold">
              <ArrowLeft size={20} className="mr-2"/> {genelMenuArama ? 'Aramaya Dön' : 'Geri Dön'}
            </button>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center shadow-sm text-sm"><Printer size={18} className="mr-2" /> PDF / Çıktı Al</button>
              <button onClick={() => setPlanModalAcik(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold flex items-center shadow-sm text-sm"><Calendar size={18} className="mr-2" /> Takvime Planla</button>
            </div>
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 border-b-2 border-orange-200 pb-2">{detayMenu.ad}</h2>
          
          {/* YENİ: MENÜ DETAY EKRANINDA KAPAK FOTOĞRAFI */}
          {detayMenu.resim && (
            <div className="w-full h-48 sm:h-64 bg-slate-200 mb-6 rounded-xl overflow-hidden shadow-sm print:hidden">
              <img src={detayMenu.resim} alt={detayMenu.ad} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center border-b border-orange-200 pb-2"><ShoppingCart className="mr-2" size={20}/> Toplu İhtiyaç Listesi</h3>
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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 flex items-center"><ChefHat className="mr-2 text-orange-500" size={22}/> {tarif.ad}</h3>
                      <span className="text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-medium inline-block mt-2">{tarif.kategori}</span>
                    </div>
                    <button onClick={() => { setDetayGosterilenTarif(tarif); setNeredenGeldi('menuler'); setAktifSekme('tarifler'); }} className="text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors shrink-0 ml-2 shadow-sm">
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
                                  <button onClick={() => setAcikResim(resim)} className="mt-2 flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 border border-blue-100 font-bold transition-colors shadow-sm w-fit">
                                    <ImageIcon size={14} /> Fotoğrafı Aç
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : <p className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">{tarif.hazirlanis}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {planModalAcik && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-bold text-slate-800 mb-3">Bu Menü Hangi Güne Eklensin?</h3>
                <form onSubmit={takvimeIsle} className="space-y-4">
                  <input type="date" required value={planTarihSecildi} onChange={(e) => setPlanTarihSecildi(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 font-medium" />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setPlanModalAcik(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 text-sm">İptal</button>
                    <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-sm">Plana Ekle</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="hidden print:block print:w-full print:bg-white print:text-black print:p-4">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-extrabold uppercase tracking-wider mb-2">Menü Programı</h1>
            <p className="text-lg font-medium text-gray-700">Menü: {detayMenu.ad}</p>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold border-b-2 border-gray-400 mb-4 pb-1">Toplu İhtiyaç Listesi</h2>
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
              <p className="text-lg font-medium text-gray-700">Menü: {detayMenu.ad}</p>
            </div>
            {menuTarifleri.map(t => (
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

  if (menuKlasoru) {
    const q = menuArama.toLowerCase();
    const filtrelenmisMenuler = menuler.filter(m => {
      if (m.kategori !== menuKlasoru) return false;
      const menuAdiUyuyor = m.ad.toLowerCase().includes(q);
      const icindekiYemekUyuyor = m.tarifler.some(tId => { const t = tarifler.find(x => x.id === tId); return t && t.ad.toLowerCase().includes(q); });
      return menuAdiUyuyor || icindekiYemekUyuyor;
    });

    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <button onClick={() => setMenuKlasoru(null)} className="flex items-center text-orange-800 hover:text-orange-600 font-bold"><ArrowLeft size={20} className="mr-2"/> Kategorilere Dön</button>
          <span className="font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg flex items-center"><Folder size={18} className="mr-2 text-orange-500"/> {menuKlasoru} Kategorisi</span>
        </div>
        <div className="relative mb-6">
          <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
          <input type="text" placeholder={`"${menuKlasoru}" içinde menü veya yemek ara...`} value={menuArama} onChange={(e) => setMenuArama(e.target.value)} className="w-full pl-12 p-3 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-base" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          {filtrelenmisMenuler.length === 0 ? <div className="text-center py-12 text-slate-500">Aramanızla eşleşen menü bulunamadı.</div> : (
            <div className="divide-y divide-slate-100">
              {filtrelenmisMenuler.map(menu => {
                const icerik = menu.tarifler.map(tId => tarifler.find(x => x.id === tId)?.ad).filter(Boolean).join(', ');
                return (
                  <div key={menu.id} onClick={() => setDetayMenu(menu)} className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                    {/* YENİ: Listede Menü Kapak Fotoğrafı */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-orange-500 transition-colors">
                      {menu.resim ? <img src={menu.resim} alt={menu.ad} className="w-full h-full object-cover" /> : <Layers size={24} className="text-orange-500 group-hover:text-white transition-colors" />}
                    </div>
                    <div className="flex-1 min-w-0 pr-2 flex flex-col items-start">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{menu.ad}</h3>
                        <span className="text-[10px] sm:text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-medium w-max">{menu.kategori}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center w-max"><Calendar size={12} className="mr-1"/> Son: {sonTarihMenu(menu.ad) || 'Yok'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 truncate w-full mt-1">{icerik || "Menü boş"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const gQ = genelMenuArama.toLowerCase();
  const genelFiltrelenmisMenuler = menuler.filter(m => {
    const menuAdiUyuyor = m.ad.toLowerCase().includes(gQ);
    const icindekiYemekUyuyor = m.tarifler.some(tId => { const t = tarifler.find(x => x.id === tId); return t && t.ad.toLowerCase().includes(gQ); });
    return menuAdiUyuyor || icindekiYemekUyuyor;
  });

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-orange-800 border-b-2 border-orange-200 pb-2 flex items-center"><Folder className="mr-2" size={24}/> Menü Kategorileri</h2>
      <div className="relative mb-6">
        <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
        <input type="text" placeholder="Tüm menülerde menü ismi veya yemek ara..." value={genelMenuArama} onChange={(e) => setGenelMenuArama(e.target.value)} className="w-full pl-12 p-3 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-base bg-white" />
      </div>
      {genelMenuArama.trim() !== '' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="divide-y divide-slate-100">
            {genelFiltrelenmisMenuler.length === 0 ? <div className="text-center py-12 text-slate-500">Aramanızla eşleşen menü veya yemek bulunamadı.</div> : (
              genelFiltrelenmisMenuler.map(menu => {
                const icerik = menu.tarifler.map(tId => tarifler.find(x => x.id === tId)?.ad).filter(Boolean).join(', ');
                return (
                  <div key={menu.id} onClick={() => setDetayMenu(menu)} className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                    {/* YENİ: Listede Menü Kapak Fotoğrafı */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-orange-500 transition-colors">
                      {menu.resim ? <img src={menu.resim} alt={menu.ad} className="w-full h-full object-cover" /> : <Layers size={24} className="text-orange-500 group-hover:text-white transition-colors" />}
                    </div>
                    <div className="flex-1 min-w-0 pr-2 flex flex-col items-start">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{menu.ad}</h3>
                        <span className="text-[10px] sm:text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-medium w-max">{menu.kategori}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center w-max"><Calendar size={12} className="mr-1"/> Son: {sonTarihMenu(menu.ad) || 'Yok'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 truncate w-full mt-1">{icerik || "Menü boş"}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {menuKategorileri.map(kategori => {
            const adet = menuler.filter(m => m.kategori === kategori).length;
            if (kategori === 'Kategorisiz' && adet === 0) return null;
            return (
              <div key={kategori} onClick={() => {setMenuKlasoru(kategori); setMenuArama('');}} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between group">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-orange-500 transition-colors"><Folder size={24} className="text-orange-500 group-hover:text-white transition-colors" /></div>
                  <h4 className="font-bold text-slate-800 text-base sm:text-lg">{kategori}</h4>
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{adet} Menü</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

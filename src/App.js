import React, { useState, useEffect } from 'react';
import { 
  ChefHat, PlusCircle, CalendarDays, Printer, 
  Trash2, Image as ImageIcon, Plus, X,
  List, Layers, ShoppingCart, Check, Edit, ArrowLeft
} from 'lucide-react';

const KATEGORILER = ['Çorba', 'Ana Yemek', 'Zeytinyağlı', 'Ara Sıcak', 'Salata/Meze', 'Tatlı', 'Kahvaltılık'];
const BIRIMLER = ['gr', 'kg', 'ml', 'Litre', 'adet', 'yemek kaşığı', 'tatlı kaşığı', 'çay kaşığı', 'su bardağı', 'çay bardağı', 'tutam', 'paket'];
const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const getHaftaTarihleri = () => {
  const bugun = new Date();
  bugun.setHours(0,0,0,0);
  const gunDegeri = bugun.getDay(); 
  const pazartesiyeUzaklik = gunDegeri === 0 ? 6 : gunDegeri - 1;
  
  const pazartesi = new Date(bugun);
  pazartesi.setDate(bugun.getDate() - pazartesiyeUzaklik);

  const tarihler = {};
  GUNLER.forEach((gunAdi, index) => {
    const tarih = new Date(pazartesi);
    tarih.setDate(pazartesi.getDate() + index);
    const dd = String(tarih.getDate()).padStart(2, '0');
    const mm = String(tarih.getMonth() + 1).padStart(2, '0');
    const yyyy = tarih.getFullYear();
    tarihler[gunAdi] = `${dd}.${mm}.${yyyy}`;
  });
  return { pazartesiStr: tarihler['Pazartesi'], tarihler };
};

const ornekTarifler = [
  {
    id: '1', ad: 'Tavuklu Bezelye', kategori: 'Ana Yemek', resim: '', 
    malzemeler: [
      { miktar: '500', birim: 'gr', isim: 'Kuşbaşı Tavuk Göğsü' },
      { miktar: '2', birim: 'su bardağı', isim: 'Bezelye' },
      { miktar: '1', birim: 'adet', isim: 'Havuç' },
      { miktar: '1', birim: 'yemek kaşığı', isim: 'Domates Salçası' }
    ],
    hazirlanis: "1. Tencereye sıvı yağı ve tavukları alın, kavurun.\n2. Salçayı ekleyip kokusu çıkana kadar kavurun.\n3. Havuç ve bezelyeleri ekleyin.\n4. Sıcak su ekleyip pişirin."
  }
];

export default function App() {
  const [aktifSekme, setAktifSekme] = useState('tarifler'); 
  
  const haftaBilgisi = getHaftaTarihleri();
  const gunTarihleri = haftaBilgisi.tarihler;

  const [tarifler, setTarifler] = useState(() => {
    const kayitli = localStorage.getItem('tarifler');
    return kayitli ? JSON.parse(kayitli) : ornekTarifler;
  });

  const [menuler, setMenuler] = useState(() => {
    const kayitli = localStorage.getItem('menuler');
    return kayitli ? JSON.parse(kayitli) : [];
  });

  const [haftalikPlan, setHaftalikPlan] = useState(() => {
    const kayitli = localStorage.getItem('haftalikPlan');
    const kayitliHafta = localStorage.getItem('kayitliHafta');
    
    if (kayitli && kayitliHafta === haftaBilgisi.pazartesiStr) {
      return JSON.parse(kayitli);
    }
    return { Pazartesi: [], Salı: [], Çarşamba: [], Perşembe: [], Cuma: [], Cumartesi: [], Pazar: [] };
  });

  const [yazdirilacakGun, setYazdirilacakGun] = useState(() => {
    const jsDay = new Date().getDay();
    const index = jsDay === 0 ? 6 : jsDay - 1; 
    return GUNLER[index];
  });

  const [seciliKategori, setSeciliKategori] = useState('Tümü');
  const [detayGosterilenTarif, setDetayGosterilenTarif] = useState(null);

  const [yeniMenu, setYeniMenu] = useState({ ad: '', tarifler: [] });
  const [modal, setModal] = useState({ acik: false, tip: '', mesaj: '', onOnay: null });

  const [yeniTarif, setYeniTarif] = useState({
    ad: '', kategori: 'Ana Yemek', resim: '',
    malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: ''
  });

  useEffect(() => localStorage.setItem('tarifler', JSON.stringify(tarifler)), [tarifler]);
  useEffect(() => {
    localStorage.setItem('haftalikPlan', JSON.stringify(haftalikPlan));
    localStorage.setItem('kayitliHafta', haftaBilgisi.pazartesiStr);
  }, [haftalikPlan, haftaBilgisi.pazartesiStr]);
  useEffect(() => localStorage.setItem('menuler', JSON.stringify(menuler)), [menuler]);

  const resimYukle = (e) => {
    const dosya = e.target.files[0];
    if (dosya) {
      const okuyucu = new FileReader();
      okuyucu.onloadend = () => setYeniTarif({ ...yeniTarif, resim: okuyucu.result });
      okuyucu.readAsDataURL(dosya);
    }
  };

  const malzemeIslem = {
    ekle: () => setYeniTarif({...yeniTarif, malzemeler: [...yeniTarif.malzemeler, { miktar: '', birim: 'gr', isim: '' }]}),
    guncelle: (index, alan, deger) => {
      const yeni = [...yeniTarif.malzemeler];
      yeni[index][alan] = deger;
      setYeniTarif({ ...yeniTarif, malzemeler: yeni });
    },
    sil: (index) => setYeniTarif({...yeniTarif, malzemeler: yeniTarif.malzemeler.filter((_, i) => i !== index)})
  };

  const tarifKaydet = (e) => {
    e.preventDefault();
    if (!yeniTarif.ad) return;

    if (yeniTarif.id) {
      setTarifler(tarifler.map(t => t.id === yeniTarif.id ? yeniTarif : t));
    } else {
      setTarifler([...tarifler, { ...yeniTarif, id: Date.now().toString() }]);
    }
    
    setYeniTarif({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: '' });
    setAktifSekme('tarifler');
    setDetayGosterilenTarif(null);
  };

  const tarifSil = (id, e) => {
    if(e) e.stopPropagation(); 
    setModal({
      acik: true, tip: 'onay', mesaj: 'Bu tarifi silmek istediğinize emin misiniz?',
      onOnay: () => {
        setTarifler(prev => prev.filter(t => t.id !== id));
        setHaftalikPlan(prevPlan => {
          const yeniPlan = {...prevPlan};
          for(let gun in yeniPlan) yeniPlan[gun] = yeniPlan[gun].filter(tId => tId !== id);
          return yeniPlan;
        });
        setMenuler(prevMenuler => prevMenuler.map(m => ({...m, tarifler: m.tarifler.filter(tId => tId !== id)})));
        if(detayGosterilenTarif?.id === id) setDetayGosterilenTarif(null);
      }
    });
  };

  const menuTarifToggle = (tarifId) => {
    if(yeniMenu.tarifler.includes(tarifId)) {
      setYeniMenu({...yeniMenu, tarifler: yeniMenu.tarifler.filter(id => id !== tarifId)});
    } else {
      setYeniMenu({...yeniMenu, tarifler: [...yeniMenu.tarifler, tarifId]});
    }
  };

  const menuKaydet = (e) => {
    e.preventDefault();
    if(!yeniMenu.ad || yeniMenu.tarifler.length === 0) {
      setModal({ acik: true, tip: 'uyari', mesaj: 'Lütfen menü adı girin ve en az 1 tarif seçin!' }); return;
    }
    if (yeniMenu.id) {
      setMenuler(menuler.map(m => m.id === yeniMenu.id ? yeniMenu : m));
    } else {
      setMenuler([...menuler, { ...yeniMenu, id: Date.now().toString() }]);
    }
    setYeniMenu({ ad: '', tarifler: [] });
  };

  const menuSil = (id) => {
    setModal({
      acik: true, tip: 'onay', mesaj: 'Bu menüyü silmek istediğinize emin misiniz?',
      onOnay: () => setMenuler(prev => prev.filter(m => m.id !== id))
    });
  };

  const planaEkle = (gun, secim) => {
    if(secim.startsWith('menu_')) {
      const menuId = secim.replace('menu_', '');
      const menu = menuler.find(m => m.id === menuId);
      if (menu) setHaftalikPlan({...haftalikPlan, [gun]: [...haftalikPlan[gun], ...menu.tarifler]});
    } else if (secim.startsWith('tarif_')) {
      const tarifId = secim.replace('tarif_', '');
      setHaftalikPlan({...haftalikPlan, [gun]: [...haftalikPlan[gun], tarifId]});
    }
  };

  const plandanCikar = (gun, index) => {
    const yeni = [...haftalikPlan[gun]];
    yeni.splice(index, 1);
    setHaftalikPlan({...haftalikPlan, [gun]: yeni });
  };

  const getGunlukTopluMalzemeler = (gununTarifleri) => {
    const liste = {};
    gununTarifleri.forEach(tarif => {
      if (!tarif) return;
      tarif.malzemeler.forEach(m => {
        if (!m.isim) return;
        const temizIsim = m.isim.toLowerCase().trim();
        const key = `${temizIsim}_${m.birim}`;
        if (!liste[key]) {
          const gorunenIsim = m.isim.charAt(0).toUpperCase() + m.isim.slice(1);
          liste[key] = { isim: gorunenIsim, birim: m.birim, miktar: 0 };
        }
        liste[key].miktar += Number(m.miktar) || 0;
      });
    });
    return Object.values(liste).sort((a,b) => a.isim.localeCompare(b.isim));
  };

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-20 md:pb-6 print:pb-0 print:bg-white">
      
      {/* Üst Header (Mobil'de sadece logo kalır, sekmeler gizlenir) */}
      <nav className="bg-orange-600 text-white shadow-md print:hidden sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-center md:justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-xl">
            <ChefHat size={28} />
            <span>Bizim Mutfak</span>
          </div>
          
          {/* Masaüstü Sekmeler */}
          <div className="hidden md:flex space-x-1">
            <button onClick={() => {setAktifSekme('tarifler'); setDetayGosterilenTarif(null);}} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'tarifler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <List size={18} /> <span>Tariflerim</span>
            </button>
            <button onClick={() => {setAktifSekme('ekle'); setYeniTarif({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: '' });}} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'ekle' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <PlusCircle size={18} /> <span>Yeni Ekle</span>
            </button>
            <button onClick={() => setAktifSekme('menuler')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'menuler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <Layers size={18} /> <span>Menülerim</span>
            </button>
            <button onClick={() => setAktifSekme('plan')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'plan' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <CalendarDays size={18} /> <span>Plan</span>
            </button>
            <button onClick={() => setAktifSekme('yazdir')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'yazdir' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <Printer size={18} /> <span>Yazdır</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBİL ALT NAVİGASYON (Sadece Mobilde Görünür) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] flex justify-between items-center px-1 py-2 z-50 pb-safe print:hidden">
        <button onClick={() => {setAktifSekme('tarifler'); setDetayGosterilenTarif(null);}} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'tarifler' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}>
          <List size={22} className="mb-1" /> Tariflerim
        </button>
        <button onClick={() => {setAktifSekme('ekle'); setYeniTarif({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: '' });}} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'ekle' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}>
          <PlusCircle size={22} className="mb-1" /> Ekle
        </button>
        <button onClick={() => setAktifSekme('menuler')} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'menuler' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}>
          <Layers size={22} className="mb-1" /> Menüler
        </button>
        <button onClick={() => setAktifSekme('plan')} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'plan' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}>
          <CalendarDays size={22} className="mb-1" /> Plan
        </button>
        <button onClick={() => setAktifSekme('yazdir')} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'yazdir' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}>
          <Printer size={22} className="mb-1" /> Yazdır
        </button>
      </div>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
        
        {/* === TARİFLER SEKME === */}
        {aktifSekme === 'tarifler' && (
          <div className="animate-in fade-in duration-300">
            {detayGosterilenTarif ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden pb-4">
                <div className="bg-orange-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <button onClick={() => setDetayGosterilenTarif(null)} className="flex items-center text-orange-800 hover:text-orange-600 font-medium">
                    <ArrowLeft size={20} className="mr-1"/> Listeye Dön
                  </button>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                    <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold truncate">
                      {detayGosterilenTarif.kategori}
                    </span>
                    <button onClick={() => {setYeniTarif(detayGosterilenTarif); setAktifSekme('ekle');}} className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                      <Edit size={16} className="mr-1"/> Düzenle
                    </button>
                  </div>
                </div>
                
                {detayGosterilenTarif.resim && (
                  <div className="w-full h-48 sm:h-64 bg-slate-200">
                    <img src={detayGosterilenTarif.resim} alt={detayGosterilenTarif.ad} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="p-4 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 border-b pb-4">{detayGosterilenTarif.ad}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                        <ShoppingCart className="mr-2" size={20}/> Malzemeler
                      </h3>
                      <ul className="space-y-3 text-sm sm:text-base">
                        {detayGosterilenTarif.malzemeler.map((m, i) => (
                          <li key={i} className="flex items-start text-slate-700">
                            <span className="text-orange-500 mr-2">•</span>
                            <span><b className="font-semibold">{m.miktar} {m.birim}</b> {m.isim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <ChefHat className="mr-2" size={20}/> Hazırlanışı
                      </h3>
                      <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        {detayGosterilenTarif.hazirlanis || "Hazırlanış bilgisi girilmemiş."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b-2 border-orange-200 pb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-orange-800">Tarif Defterim</h2>
                  <select value={seciliKategori} onChange={(e) => setSeciliKategori(e.target.value)} className="w-full sm:w-auto p-2 sm:p-2.5 border border-orange-300 rounded-lg text-slate-700 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none">
                    <option value="Tümü">Tüm Kategoriler</option>
                    {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                  {tarifler.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">Henüz hiç tarifiniz yok.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {tarifler.filter(t => seciliKategori === 'Tümü' || t.kategori === seciliKategori).sort((a, b) => a.ad.localeCompare(b.ad)).map(tarif => (
                        <div key={tarif.id} onClick={() => setDetayGosterilenTarif(tarif)} className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                          <div className="w-16 h-16 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden mr-3">
                            {tarif.resim ? <img src={tarif.resim} alt={tarif.ad} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-300"><ImageIcon size={20} /></div>}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{tarif.ad}</h3>
                            <p className="text-xs sm:text-sm text-slate-500">{tarif.kategori}</p>
                          </div>
                          <button onClick={(e) => tarifSil(tarif.id, e)} className="p-2 sm:p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* === MENÜLER SEKME === */}
        {aktifSekme === 'menuler' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-orange-800 border-b-2 border-orange-200 pb-2">Özel Menülerim</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-1 bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">
                  {yeniMenu.id ? 'Menüyü Düzenle' : 'Yeni Menü Oluştur'}
                </h3>
                <form onSubmit={menuKaydet} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Menü Adı</label>
                    <input type="text" required value={yeniMenu.ad} onChange={e => setYeniMenu({...yeniMenu, ad: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50" placeholder="Örn: Misafir Menüsü" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Yemek Seçimi</label>
                    <div className="max-h-60 sm:max-h-72 overflow-y-auto border rounded-lg bg-white relative shadow-inner">
                      {KATEGORILER.map(kategori => {
                        const kategoriTarifleri = tarifler.filter(t => t.kategori === kategori).sort((a,b) => a.ad.localeCompare(b.ad));
                        if (kategoriTarifleri.length === 0) return null;
                        return (
                          <div key={kategori}>
                            <div className="sticky top-0 bg-slate-100 text-slate-600 font-bold text-xs px-3 py-2 uppercase z-10 border-b border-y-slate-200">{kategori}</div>
                            <div className="p-1">
                              {kategoriTarifleri.map(tarif => (
                                <label key={tarif.id} className="flex items-center p-3 hover:bg-orange-50 rounded cursor-pointer border-b border-slate-50 last:border-0">
                                  <input type="checkbox" checked={yeniMenu.tarifler.includes(tarif.id)} onChange={() => menuTarifToggle(tarif.id)} className="w-5 h-5 text-orange-600 rounded mr-3 accent-orange-600" />
                                  <span className="text-sm font-medium text-slate-800">{tarif.ad}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {tarifler.length === 0 && <div className="p-4 text-center text-sm text-slate-500">Önce tarif eklemelisiniz.</div>}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700">
                    {yeniMenu.id ? 'Menüyü Güncelle' : 'Menüyü Kaydet'}
                  </button>
                  {yeniMenu.id && <button type="button" onClick={() => setYeniMenu({ ad: '', tarifler: [] })} className="w-full bg-slate-100 text-slate-600 py-3 rounded-lg font-bold">İptal Et</button>}
                </form>
              </div>

              <div className="lg:col-span-2 space-y-3">
                {menuler.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500">Henüz özel menü oluşturmadınız.</div>
                ) : (
                  menuler.map(menu => (
                    <div key={menu.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center mb-2"><Layers className="mr-2 text-orange-500" size={18}/> {menu.ad}</h4>
                        <div className="flex flex-wrap gap-2">
                          {menu.tarifler.map((tId, idx) => {
                            const t = tarifler.find(x => x.id === tId);
                            return t ? <span key={idx} className="bg-orange-50 text-orange-800 border border-orange-200 px-2 py-1 rounded text-[11px] sm:text-xs flex items-center"><Check size={12} className="mr-1 opacity-50"/> {t.ad}</span> : null;
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 self-end sm:self-center mt-2 sm:mt-0">
                        <button onClick={() => setYeniMenu(menu)} className="text-blue-600 p-2 sm:p-3 bg-blue-50 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => menuSil(menu.id)} className="text-red-600 p-2 sm:p-3 bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* === YENİ TARİF EKLE SEKME === */}
        {aktifSekme === 'ekle' && (
          <div className="max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-md animate-in fade-in duration-300 mb-8">
             <h2 className="text-xl sm:text-2xl font-bold mb-4 text-orange-800 border-b-2 border-orange-200 pb-2">
               {yeniTarif.id ? 'Tarifi Düzenle' : 'Yeni Yemek Tarifi'}
             </h2>
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yemek Fotoğrafı</label>
                <input type="file" accept="image/*" onChange={resimYukle} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700" />
                {yeniTarif.resim && <img src={yeniTarif.resim} alt="Önizleme" className="mt-2 h-32 w-full object-cover rounded-lg border" />}
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
                        <input type="number" placeholder="Miktar" value={malzeme.miktar} onChange={(e) => malzemeIslem.guncelle(index, 'miktar', e.target.value)} className="w-1/3 sm:w-20 p-2.5 border rounded-lg text-sm bg-slate-50" />
                        <select value={malzeme.birim} onChange={(e) => malzemeIslem.guncelle(index, 'birim', e.target.value)} className="w-2/3 sm:w-32 p-2.5 border rounded-lg text-sm bg-slate-50">
                          {BIRIMLER.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 w-full sm:flex-1">
                        <input type="text" placeholder="Malzeme adı (Örn: Havuç)" required value={malzeme.isim} onChange={(e) => malzemeIslem.guncelle(index, 'isim', e.target.value)} className="flex-1 p-2.5 border rounded-lg text-sm bg-slate-50" />
                        {yeniTarif.malzemeler.length > 1 && <button type="button" onClick={() => malzemeIslem.sil(index)} className="p-2.5 text-red-500 bg-red-50 rounded-lg sm:bg-transparent"><X size={18} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hazırlanışı</label>
                <textarea rows="4" value={yeniTarif.hazirlanis} onChange={(e) => setYeniTarif({...yeniTarif, hazirlanis: e.target.value})} className="w-full p-3 border rounded-lg bg-slate-50" placeholder="1. Adım..."></textarea>
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-md text-lg">
                {yeniTarif.id ? 'Değişiklikleri Kaydet' : 'Tarifi Kaydet'}
              </button>
            </form>
          </div>
        )}

        {/* === PLAN SEKME === */}
        {aktifSekme === 'plan' && (
          <div className="animate-in fade-in duration-300 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b-2 border-orange-200 pb-3 gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-orange-800">Haftalık Menü Planı</h2>
              <div className="text-xs sm:text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm border flex items-center w-full sm:w-auto">
                <CalendarDays size={16} className="mr-2 text-orange-500" /> 
                <span>Hafta: <b className="text-slate-800">{gunTarihleri['Pazartesi']} - {gunTarihleri['Pazar']}</b></span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {GUNLER.map(gun => (
                <div key={gun} className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 flex flex-col">
                  <h3 className="font-bold text-base sm:text-lg border-b pb-2 mb-2 sm:mb-3 text-slate-700 flex justify-between items-center">
                    <div>
                      <span className="block">{gun}</span>
                      <span className="text-[10px] sm:text-xs font-normal text-slate-400">{gunTarihleri[gun]}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">{haftalikPlan[gun].length} Çeşit</span>
                  </h3>
                  <div className="space-y-2 flex-1 min-h-[80px]">
                    {haftalikPlan[gun].map((tarifId, index) => {
                      const tarif = tarifler.find(t => t.id === tarifId);
                      if (!tarif) return null;
                      return (
                        <div key={index} className="flex justify-between items-center bg-orange-50 p-2 rounded-lg border border-orange-100">
                          <div className="truncate pr-2 w-full">
                            <span className="font-medium text-xs sm:text-sm text-slate-800 block truncate">{tarif.ad}</span>
                            <span className="text-[9px] sm:text-[10px] text-slate-500 block uppercase tracking-wider">{tarif.kategori}</span>
                          </div>
                          <button onClick={() => plandanCikar(gun, index)} className="text-slate-400 hover:text-red-500 bg-white rounded p-1.5 border shadow-sm"><X size={14} /></button>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-2 border-t">
                    <select className="w-full text-xs sm:text-sm p-2 sm:p-2.5 border rounded-lg bg-orange-50 text-orange-900 font-medium outline-none" onChange={(e) => { if(e.target.value) { planaEkle(gun, e.target.value); e.target.value = ""; } }} defaultValue="">
                      <option value="" disabled>+ Yemek Ekle</option>
                      {menuler.length > 0 && (
                        <optgroup label="🌟 Menülerim">
                          {menuler.map(m => <option key={`m_${m.id}`} value={`menu_${m.id}`}>📦 {m.ad}</option>)}
                        </optgroup>
                      )}
                      {KATEGORILER.map(kat => {
                        const katTarifleri = tarifler.filter(t => t.kategori === kat).sort((a,b)=> a.ad.localeCompare(b.ad));
                        if(katTarifleri.length === 0) return null;
                        return (
                          <optgroup label={`🍽 ${kat}`} key={kat}>
                            {katTarifleri.map(t => <option key={`t_${t.id}`} value={`tarif_${t.id}`}>{t.ad}</option>)}
                          </optgroup>
                        )
                      })}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === YAZDIR (TEK SAYFA DİZAYNI) === */}
        {aktifSekme === 'yazdir' && (
          <div className="animate-in fade-in duration-300 print:m-0 print:p-0">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 print:hidden flex flex-col items-center gap-4 border border-slate-200">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">Menüyü Yazdır (PDF)</h2>
                <p className="text-sm text-slate-500">Seçtiğiniz günü tek sayfalık A4 düzeninde oluşturun.</p>
              </div>
              <div className="w-full bg-slate-50 p-2 sm:p-3 rounded-lg border border-slate-100 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max px-2">
                  {GUNLER.map(g => (
                    <button key={g} onClick={() => setYazdirilacakGun(g)} className={`px-4 py-2 rounded-lg border transition-colors text-sm font-bold shadow-sm ${yazdirilacakGun === g ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => window.print()} className="bg-blue-600 w-full sm:w-auto hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center shadow-lg text-lg">
                <Printer size={22} className="mr-2" /> PDF Olarak Kaydet
              </button>
            </div>

            {/* A4 KAĞIT ALANI (Print Container) */}
            <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm print:shadow-none print:rounded-none print-a4-page">
              
              {/* Header */}
              <div className="text-center mb-6 print:mb-2 border-b-4 border-slate-800 print:border-b-2 pb-4 print:pb-1 shrink-0">
                <h1 className="text-3xl print:text-xl font-extrabold text-slate-900 mb-1 print:mb-0">Günün Menüsü</h1>
                <p className="text-lg print:text-[11px] text-slate-600 font-bold">{yazdirilacakGun} <span className="font-medium">({gunTarihleri[yazdirilacakGun]})</span></p>
              </div>

              {(() => {
                const gununTarifleri = haftalikPlan[yazdirilacakGun].map(id => tarifler.find(t => t.id === id)).filter(Boolean);
                
                if (gununTarifleri.length === 0) {
                  return (
                    <div className="text-center py-20 text-slate-500 print:text-black">
                      <p className="text-lg font-medium">{yazdirilacakGun} günü için plan yok.</p>
                    </div>
                  );
                }

                const topluMalzemeler = getGunlukTopluMalzemeler(gununTarifleri);
                // Çok tarif varsa yan yana (grid-cols-2) diz. Az ise alt alta (grid-cols-1).
                const gridClass = gununTarifleri.length > 2 ? 'print:grid-cols-2' : 'print:grid-cols-1';

                return (
                  <div className="print-recipes-container">
                    
                    {/* Yemekler Listesi */}
                    <div className={`grid grid-cols-1 ${gridClass} gap-6 print:gap-2 overflow-hidden`}>
                      {gununTarifleri.map((tarif, i) => (
                        <div key={i} className="pl-3 print:pl-2 border-l-4 print:border-l-2 border-orange-500 print:border-black bg-orange-50/40 print:bg-transparent p-3 print:p-1 rounded-r-lg print:rounded-none flex flex-col justify-start overflow-hidden">
                          <h3 className="text-lg print:text-[12px] font-bold text-slate-900 flex justify-between items-center print:mb-1 border-b border-orange-100 print:border-slate-200 pb-1">
                            <span>{tarif.ad}</span>
                            <span className="text-xs print:text-[9px] font-normal text-slate-500 print:text-slate-600 bg-white print:bg-transparent px-2 py-0.5 rounded border print:border-none">
                              {tarif.kategori}
                            </span>
                          </h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4 print:gap-2 mt-2">
                            {/* Malzemeler */}
                            <div className="print:text-[9px] text-sm">
                              <h4 className="font-bold text-orange-800 print:text-black border-b border-orange-200 print:border-dashed pb-1 mb-1 print:mb-0.5 uppercase tracking-wider text-[10px] print:text-[8px]">Malzemeler</h4>
                              <ul className="space-y-1 print:space-y-0 text-slate-700 print:text-black">
                                {tarif.malzemeler.map((m, idx) => (
                                  <li key={idx} className="flex justify-between border-b border-slate-100 print:border-none print:py-0">
                                    <span>{m.isim}</span>
                                    <span className="font-semibold text-slate-900">{m.miktar} {m.birim}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Hazırlanışı */}
                            <div className="print:text-[9px] text-sm">
                               <h4 className="font-bold text-slate-800 print:text-black border-b border-slate-200 print:border-dashed pb-1 mb-1 print:mb-0.5 uppercase tracking-wider text-[10px] print:text-[8px]">Hazırlanışı</h4>
                               <p className="text-slate-600 print:text-black whitespace-pre-wrap leading-snug">{tarif.hazirlanis || '-'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Alışveriş Toplu Liste */}
                    <div className="mt-8 print:mt-auto bg-orange-100/50 print:bg-transparent p-4 print:p-2 border print:border-t-2 print:border-x-0 print:border-b-0 border-orange-200 print:border-black rounded-xl print:rounded-none shrink-0">
                      <h3 className="text-lg print:text-[11px] font-bold text-orange-900 print:text-black mb-3 print:mb-1 uppercase tracking-wider print:text-center">
                        Toplam Alışveriş & Malzeme Listesi
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-x-6 gap-y-2 print:gap-x-4 print:gap-y-0.5 text-sm print:text-[9px]">
                        {topluMalzemeler.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b border-dashed border-orange-200 print:border-slate-300 pb-1">
                            <span className="text-slate-700 print:text-black font-medium">{item.isim}</span>
                            <span className="font-bold text-slate-900 print:text-black">
                              {item.miktar > 0 ? item.miktar : ''} {item.birim}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Silme / Uyarı Modalı */}
      {modal.acik && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className={`text-xl font-bold mb-3 ${modal.tip === 'uyari' ? 'text-orange-600' : 'text-red-600'}`}>
              {modal.tip === 'uyari' ? 'Uyarı' : 'Emin misiniz?'}
            </h3>
            <p className="text-slate-600 mb-6">{modal.mesaj}</p>
            <div className="flex justify-end gap-3">
              {modal.tip === 'onay' && <button onClick={() => setModal({ ...modal, acik: false })} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold">İptal</button>}
              <button onClick={() => { if(modal.onOnay) modal.onOnay(); setModal({ ...modal, acik: false }); }} className={`px-5 py-2 text-white rounded-lg font-bold shadow-sm ${modal.tip === 'uyari' ? 'bg-orange-600' : 'bg-red-600'}`}>
                {modal.tip === 'uyari' ? 'Tamam' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

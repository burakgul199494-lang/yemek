import React, { useState, useEffect } from 'react';
import { 
  ChefHat, PlusCircle, CalendarDays, Printer, 
  Trash2, Image as ImageIcon, Plus, X, BookOpen,
  List, ArrowLeft, Layers, ShoppingCart, Check, Edit
} from 'lucide-react';

// Sabit Veriler
const KATEGORILER = ['Çorba', 'Ana Yemek', 'Zeytinyağlı', 'Ara Sıcak', 'Salata/Meze', 'Tatlı', 'Kahvaltılık'];
const BIRIMLER = ['gr', 'kg', 'ml', 'Litre', 'adet', 'yemek kaşığı', 'tatlı kaşığı', 'çay kaşığı', 'su bardağı', 'çay bardağı', 'tutam', 'paket'];
const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// Tarih Hesaplama Yardımcı Fonksiyonu
const getHaftaTarihleri = () => {
  const bugun = new Date();
  bugun.setHours(0,0,0,0);
  const gunDegeri = bugun.getDay(); // 0 = Pazar, 1 = Pazartesi...
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

// Varsayılan Örnek Tarifler
const ornekTarifler = [
  {
    id: '1',
    ad: 'Tavuklu Bezelye',
    kategori: 'Ana Yemek',
    resim: '', 
    malzemeler: [
      { miktar: '500', birim: 'gr', isim: 'Kuşbaşı Tavuk Göğsü' },
      { miktar: '2', birim: 'su bardağı', isim: 'Bezelye' },
      { miktar: '1', birim: 'adet', isim: 'Havuç (Küp doğranmış)' },
      { miktar: '1', birim: 'yemek kaşığı', isim: 'Domates Salçası' },
      { miktar: '3', birim: 'yemek kaşığı', isim: 'Sıvı Yağ' }
    ],
    hazirlanis: "1. Tencereye sıvı yağı ve tavukları alın, kavurun.\n2. Salçayı ekleyip kokusu çıkana kadar kavurun.\n3. Havuç ve bezelyeleri ekleyin.\n4. Sıcak su ekleyip pişirin."
  },
  {
    id: '2',
    ad: 'Şehriyeli Pirinç Pilavı',
    kategori: 'Ana Yemek',
    resim: '', 
    malzemeler: [
      { miktar: '2', birim: 'su bardağı', isim: 'Pirinç' },
      { miktar: '2', birim: 'yemek kaşığı', isim: 'Arpa Şehriye' },
      { miktar: '3', birim: 'yemek kaşığı', isim: 'Sıvı Yağ' },
      { miktar: '1', birim: 'tatlı kaşığı', isim: 'Tuz' }
    ],
    hazirlanis: "1. Pirinçleri ıslatın ve yıkayın.\n2. Şehriyeleri yağda kavurun.\n3. Pirinçleri ekleyip şeffaflaşana kadar kavurun.\n4. Suyunu ve tuzunu ekleyip demlenmeye bırakın."
  },
  {
    id: '3',
    ad: 'Mevsim Salata',
    kategori: 'Salata/Meze',
    resim: '', 
    malzemeler: [
      { miktar: '1', birim: 'adet', isim: 'Kıvırcık Marul' },
      { miktar: '2', birim: 'adet', isim: 'Domates' },
      { miktar: '1', birim: 'adet', isim: 'Salatalık' },
      { miktar: '3', birim: 'yemek kaşığı', isim: 'Zeytinyağı' }
    ],
    hazirlanis: "1. Tüm malzemeleri yıkayıp doğrayın.\n2. Yağ, limon ve tuz ekleyip harmanlayın."
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
    return kayitli ? JSON.parse(kayitli) : [{id: 'm1', ad: 'Örnek Akşam Menüsü', tarifler: ['1', '2', '3']}];
  });

  const [haftalikPlan, setHaftalikPlan] = useState(() => {
    const kayitli = localStorage.getItem('haftalikPlan');
    const kayitliHafta = localStorage.getItem('kayitliHafta');
    
    if (kayitli && kayitliHafta === haftaBilgisi.pazartesiStr) {
      return JSON.parse(kayitli);
    }
    return {
      Pazartesi: [], Salı: [], Çarşamba: [], Perşembe: [], Cuma: [], Cumartesi: [], Pazar: []
    };
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
    e.stopPropagation(); 
    setModal({
      acik: true,
      tip: 'onay',
      mesaj: 'Bu tarifi silmek istediğinize emin misiniz?',
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
      setModal({ acik: true, tip: 'uyari', mesaj: 'Lütfen menü adı girin ve en az 1 tarif seçin!' });
      return;
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
      acik: true,
      tip: 'onay',
      mesaj: 'Bu menüyü silmek istediğinize emin misiniz?',
      onOnay: () => setMenuler(prev => prev.filter(m => m.id !== id))
    });
  };

  const planaEkle = (gun, secim) => {
    if(secim.startsWith('menu_')) {
      const menuId = secim.replace('menu_', '');
      const menu = menuler.find(m => m.id === menuId);
      if (menu) {
        setHaftalikPlan({...haftalikPlan, [gun]: [...haftalikPlan[gun], ...menu.tarifler]});
      }
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
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-20">
      <nav className="bg-orange-600 text-white shadow-md print:hidden sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-xl min-w-max pr-4">
            <ChefHat size={28} />
            <span className="hidden sm:inline">Bizim Mutfak</span>
          </div>
          <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-1 -mb-1">
            <button onClick={() => {setAktifSekme('tarifler'); setDetayGosterilenTarif(null);}} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${aktifSekme === 'tarifler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <List size={18} /> <span>Tariflerim</span>
            </button>
            <button onClick={() => {
              setAktifSekme('ekle');
              setYeniTarif({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: '' });
            }} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${aktifSekme === 'ekle' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <PlusCircle size={18} /> <span>Yeni Tarif</span>
            </button>
            <button onClick={() => setAktifSekme('menuler')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${aktifSekme === 'menuler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <Layers size={18} /> <span>Menülerim</span>
            </button>
            <button onClick={() => setAktifSekme('plan')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${aktifSekme === 'plan' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <CalendarDays size={18} /> <span>Haftalık Plan</span>
            </button>
            <button onClick={() => setAktifSekme('yazdir')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${aktifSekme === 'yazdir' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <Printer size={18} /> <span>Yazdır</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
        
        {aktifSekme === 'tarifler' && (
          <div className="animate-in fade-in duration-300">
            {detayGosterilenTarif ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-orange-100 p-4 flex items-center justify-between">
                  <button onClick={() => setDetayGosterilenTarif(null)} className="flex items-center text-orange-800 hover:text-orange-600 font-medium">
                    <ArrowLeft size={20} className="mr-1"/> Listeye Dön
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {detayGosterilenTarif.kategori}
                    </span>
                    <button 
                      onClick={() => {
                        setYeniTarif(detayGosterilenTarif); 
                        setAktifSekme('ekle'); 
                      }}
                      className="flex items-center bg-white text-blue-600 hover:text-blue-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm transition-colors"
                    >
                      <Edit size={16} className="mr-1"/> Düzenle
                    </button>
                  </div>
                </div>
                
                {detayGosterilenTarif.resim && (
                  <div className="w-full h-64 bg-slate-200">
                    <img src={detayGosterilenTarif.resim} alt={detayGosterilenTarif.ad} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="p-6 md:p-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b pb-4">{detayGosterilenTarif.ad}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 bg-orange-50 p-5 rounded-xl border border-orange-100">
                      <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
                        <ShoppingCart className="mr-2" size={20}/> Malzemeler
                      </h3>
                      <ul className="space-y-3">
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
                      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        {detayGosterilenTarif.hazirlanis || "Hazırlanış bilgisi girilmemiş."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b-2 border-orange-200 pb-4">
                  <h2 className="text-2xl font-bold text-orange-800">Tarif Defterim</h2>
                  <select 
                    value={seciliKategori} 
                    onChange={(e) => setSeciliKategori(e.target.value)}
                    className="p-2 border border-orange-300 rounded-lg text-slate-700 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="Tümü">Tüm Kategoriler</option>
                    {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {tarifler.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">Henüz hiç tarifiniz yok.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {tarifler
                        .filter(t => seciliKategori === 'Tümü' || t.kategori === seciliKategori)
                        .sort((a, b) => a.ad.localeCompare(b.ad))
                        .map(tarif => (
                          <div 
                            key={tarif.id} 
                            onClick={() => setDetayGosterilenTarif(tarif)}
                            className="flex items-center p-3 sm:p-4 hover:bg-orange-50 cursor-pointer transition-colors group"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden mr-4">
                              {tarif.resim ? (
                                <img src={tarif.resim} alt={tarif.ad} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-orange-300"><ImageIcon size={24} /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-orange-700 transition-colors">{tarif.ad}</h3>
                              <p className="text-sm text-slate-500">{tarif.kategori}</p>
                            </div>
                            <button 
                              onClick={(e) => tarifSil(tarif.id, e)}
                              className="ml-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Sil"
                            >
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

        {aktifSekme === 'menuler' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b-2 border-orange-200 pb-2">Özel Menülerim</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-fit sticky top-20">
                <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">
                  {yeniMenu.id ? 'Menüyü Düzenle' : 'Yeni Menü Oluştur'}
                </h3>
                <form onSubmit={menuKaydet} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Menü Adı (Örn: Hafta Sonu Menüsü)</label>
                    <input 
                      type="text" required value={yeniMenu.ad} onChange={e => setYeniMenu({...yeniMenu, ad: e.target.value})}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Bu Menüye Eklenecek Yemekler</label>
                    <div className="max-h-72 overflow-y-auto border rounded-lg bg-slate-50 relative">
                      {KATEGORILER.map(kategori => {
                        const kategoriTarifleri = tarifler.filter(t => t.kategori === kategori).sort((a,b) => a.ad.localeCompare(b.ad));
                        if (kategoriTarifleri.length === 0) return null;
                        
                        return (
                          <div key={kategori} className="mb-1">
                            <div className="sticky top-0 bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 uppercase tracking-wide z-10 border-b border-slate-300 shadow-sm">
                              {kategori}
                            </div>
                            <div className="p-1 space-y-1">
                              {kategoriTarifleri.map(tarif => (
                                <label key={tarif.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                                  <input 
                                    type="checkbox" 
                                    checked={yeniMenu.tarifler.includes(tarif.id)}
                                    onChange={() => menuTarifToggle(tarif.id)}
                                    className="w-5 h-5 text-orange-600 rounded mr-3 accent-orange-600"
                                  />
                                  <span className="text-sm font-medium text-slate-800">{tarif.ad}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {tarifler.length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-500">Önce tarif eklemelisiniz.</div>
                      )}
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700">
                    {yeniMenu.id ? 'Menüyü Güncelle' : 'Menüyü Kaydet'}
                  </button>
                  
                  {yeniMenu.id && (
                    <button 
                      type="button" 
                      onClick={() => setYeniMenu({ ad: '', tarifler: [] })} 
                      className="w-full bg-slate-100 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                    >
                      İptal Et
                    </button>
                  )}
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {menuler.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500">
                    Henüz özel menü oluşturmadınız.
                  </div>
                ) : (
                  menuler.map(menu => (
                    <div key={menu.id} className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-slate-800 flex items-center mb-2">
                          <Layers className="mr-2 text-orange-500" size={20}/> {menu.ad}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {menu.tarifler.map((tId, idx) => {
                            const t = tarifler.find(x => x.id === tId);
                            return t ? (
                              <span key={idx} className="bg-orange-50 text-orange-800 border border-orange-200 px-2 py-1 rounded text-sm flex items-center">
                                <Check size={14} className="mr-1 opacity-50"/> {t.ad}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 self-start sm:self-auto">
                        <button onClick={() => setYeniMenu(menu)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Düzenle">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => menuSil(menu.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Sil">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {aktifSekme === 'ekle' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md animate-in fade-in duration-300">
             <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b-2 border-orange-200 pb-2">
               {yeniTarif.id ? 'Tarifi Düzenle' : 'Yeni Yemek Tarifi'}
             </h2>
             <form onSubmit={tarifKaydet} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Yemek Adı</label>
                  <input type="text" required value={yeniTarif.ad} onChange={(e) => setYeniTarif({...yeniTarif, ad: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Örn: Zeytinyağlı Enginar" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select value={yeniTarif.kategori} onChange={(e) => setYeniTarif({...yeniTarif, kategori: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                    {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yemek Fotoğrafı (Opsiyonel)</label>
                <input type="file" accept="image/*" onChange={resimYukle} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                {yeniTarif.resim && <img src={yeniTarif.resim} alt="Önizleme" className="mt-2 h-32 object-cover rounded-lg border" />}
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-800">Malzemeler</h3>
                  <button type="button" onClick={malzemeIslem.ekle} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium"><Plus size={16} className="mr-1" /> Ekle</button>
                </div>
                <div className="space-y-2">
                  {yeniTarif.malzemeler.map((malzeme, index) => (
                    <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                      <input type="number" placeholder="Miktar" value={malzeme.miktar} onChange={(e) => malzemeIslem.guncelle(index, 'miktar', e.target.value)} className="w-20 p-2 border rounded-lg text-sm" />
                      <select value={malzeme.birim} onChange={(e) => malzemeIslem.guncelle(index, 'birim', e.target.value)} className="w-32 p-2 border rounded-lg text-sm">
                        {BIRIMLER.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <input type="text" placeholder="Malzeme adı (Örn: Havuç)" required value={malzeme.isim} onChange={(e) => malzemeIslem.guncelle(index, 'isim', e.target.value)} className="flex-1 p-2 border rounded-lg text-sm" />
                      {yeniTarif.malzemeler.length > 1 && <button type="button" onClick={() => malzemeIslem.sil(index)} className="text-red-400 hover:text-red-600 p-2"><X size={18} /></button>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hazırlanışı</label>
                <textarea rows="4" value={yeniTarif.hazirlanis} onChange={(e) => setYeniTarif({...yeniTarif, hazirlanis: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="1. Adım..."></textarea>
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                {yeniTarif.id ? 'Değişiklikleri Kaydet' : 'Tarifi Kaydet'}
              </button>
            </form>
          </div>
        )}

        {aktifSekme === 'plan' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b-2 border-orange-200 pb-2 gap-2">
              <h2 className="text-2xl font-bold text-orange-800">Haftalık Menü Planı</h2>
              <div className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border shadow-sm flex items-center">
                <CalendarDays size={16} className="mr-2 text-orange-500" /> 
                <span>Hafta: <b className="text-slate-800">{gunTarihleri['Pazartesi']} - {gunTarihleri['Pazar']}</b></span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {GUNLER.map(gun => (
                <div key={gun} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
                  <h3 className="font-bold text-lg border-b pb-2 mb-3 text-slate-700 flex justify-between items-center">
                    <div>
                      <span className="block">{gun}</span>
                      <span className="text-xs font-normal text-slate-400">{gunTarihleri[gun]}</span>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">{haftalikPlan[gun].length} Çeşit</span>
                  </h3>
                  
                  <div className="space-y-2 flex-1 min-h-[120px]">
                    {haftalikPlan[gun].map((tarifId, index) => {
                      const tarif = tarifler.find(t => t.id === tarifId);
                      if (!tarif) return null;
                      return (
                        <div key={index} className="flex justify-between items-center bg-orange-50/70 p-2 rounded-lg border border-orange-100 group">
                          <div className="truncate pr-2 w-full">
                            <span className="font-medium text-sm text-slate-800 block truncate">{tarif.ad}</span>
                            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">{tarif.kategori}</span>
                          </div>
                          <button onClick={() => plandanCikar(gun, index)} className="text-slate-300 hover:text-red-500 transition-colors bg-white rounded shadow-sm p-1 border">
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <select 
                      className="w-full text-sm p-2 border rounded-lg bg-orange-50 text-orange-900 font-medium outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                      onChange={(e) => {
                        if(e.target.value) {
                          planaEkle(gun, e.target.value);
                          e.target.value = ""; 
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Menü veya Yemek Ekle</option>
                      
                      {menuler.length > 0 && (
                        <optgroup label="🌟 Özel Menülerim">
                          {menuler.map(m => (
                            <option key={`m_${m.id}`} value={`menu_${m.id}`}>📦 {m.ad} ({m.tarifler.length} Çeşit)</option>
                          ))}
                        </optgroup>
                      )}

                      {KATEGORILER.map(kat => {
                        const katTarifleri = tarifler.filter(t => t.kategori === kat).sort((a,b)=> a.ad.localeCompare(b.ad));
                        if(katTarifleri.length === 0) return null;
                        return (
                          <optgroup label={`🍽 ${kat}`} key={kat}>
                            {katTarifleri.map(t => (
                              <option key={`t_${t.id}`} value={`tarif_${t.id}`}>{t.ad}</option>
                            ))}
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

        {aktifSekme === 'yazdir' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white p-4 rounded-xl shadow mb-6 print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Günlük Menüyü Yazdır</h2>
                <p className="text-sm text-slate-500">Seçtiğiniz günün planını ve tarif detaylarını A4 boyutunda çıktı alın.</p>
              </div>
              
              <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100 w-full md:w-auto overflow-x-auto">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Yazdırılacak Günü Seçin:</label>
                <div className="flex gap-2 min-w-max">
                  {GUNLER.map(g => (
                    <button 
                      key={g}
                      onClick={() => setYazdirilacakGun(g)}
                      className={`px-4 py-2 rounded-md border transition-colors text-sm font-medium select-none ${yazdirilacakGun === g ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center shadow-lg w-full md:w-auto justify-center">
                <Printer size={20} className="mr-2" /> Yazdır / PDF
              </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm print:shadow-none print:p-0">
              <div className="text-center mb-8 border-b-4 border-slate-800 pb-4">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Günlük Yemek Planı</h1>
                <p className="text-xl text-slate-600 font-bold">{yazdirilacakGun} <span className="text-lg font-medium">({gunTarihleri[yazdirilacakGun]})</span></p>
              </div>

              {(() => {
                const gununTarifleri = haftalikPlan[yazdirilacakGun].map(id => tarifler.find(t => t.id === id)).filter(Boolean);
                
                if (gununTarifleri.length === 0) {
                  return (
                    <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-xl font-medium">{yazdirilacakGun} günü için planlanmış bir yemek bulunamadı.</p>
                      <p className="text-sm mt-2">Haftalık plan sekmesinden bu güne yemek ekleyebilirsiniz.</p>
                    </div>
                  );
                }

                const topluMalzemeler = getGunlukTopluMalzemeler(gununTarifleri);

                return (
                  <div className="mb-10 print:break-inside-avoid">
                    <div className="space-y-8">
                      {gununTarifleri.map((tarif, i) => (
                        <div key={i} className="pl-4 border-l-4 border-orange-500 bg-orange-50/30 p-4 rounded-r-xl">
                          <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                            <ChefHat className="mr-2 text-orange-600 print:text-slate-800" size={24} />
                            {tarif.ad} 
                            <span className="text-sm font-normal text-slate-500 ml-3 bg-white px-2 py-1 rounded-md border print:border-slate-300">
                              {tarif.kategori}
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                            <div className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm print:border-slate-300 print:shadow-none">
                              <h4 className="font-bold text-sm text-orange-800 mb-3 border-b border-orange-200 pb-2 flex items-center print:text-slate-800 print:border-slate-300">
                                <ShoppingCart size={16} className="mr-2" /> Malzemeler
                              </h4>
                              <ul className="text-sm space-y-2">
                                {tarif.malzemeler.map((m, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-orange-500 mr-2 print:text-slate-800">•</span>
                                    <span><span className="font-bold text-slate-800">{m.miktar} {m.birim}</span> {m.isim}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm print:border-slate-300 print:shadow-none">
                               <h4 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-200 pb-2 flex items-center">
                                 <List size={16} className="mr-2" /> Hazırlanışı
                               </h4>
                               <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed print:text-black">{tarif.hazirlanis || 'Bilgi yok.'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 bg-orange-50/50 p-6 rounded-xl border border-orange-200 shadow-sm print:bg-transparent print:border-slate-300 print:shadow-none print:mt-8 print:border-t-2 print:border-x-0 print:border-b-0 print:rounded-none">
                      <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center border-b border-orange-200 pb-2 print:text-slate-800 print:border-slate-300">
                        <ShoppingCart size={20} className="mr-2" /> Günün Toplu Malzeme Listesi
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-8">
                        {topluMalzemeler.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-end border-b border-dashed border-orange-200 pb-1 print:border-slate-300">
                            <span className="font-medium text-slate-800">{item.isim}</span>
                            <span className="font-bold text-orange-700 bg-white px-2 py-0.5 rounded text-sm print:text-slate-800 print:p-0">
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

      {modal.acik && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className={`text-xl font-bold mb-3 flex items-center ${modal.tip === 'uyari' ? 'text-orange-600' : 'text-red-600'}`}>
              {modal.tip === 'uyari' ? 'Uyarı' : 'Emin misiniz?'}
            </h3>
            <p className="text-slate-600 mb-6 font-medium">{modal.mesaj}</p>
            <div className="flex justify-end gap-3">
              {modal.tip === 'onay' && (
                <button 
                  onClick={() => setModal({ ...modal, acik: false })}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition-colors"
                >
                  İptal
                </button>
              )}
              <button 
                onClick={() => {
                  if(modal.onOnay) modal.onOnay();
                  setModal({ ...modal, acik: false });
                }}
                className={`px-5 py-2 text-white rounded-lg font-bold transition-colors shadow-sm ${modal.tip === 'uyari' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {modal.tip === 'uyari' ? 'Tamam' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

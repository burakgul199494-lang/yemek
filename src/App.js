import React, { useState, useEffect } from 'react';
import { 
  ChefHat, PlusCircle, CalendarDays, Printer, 
  Image as ImageIcon, X, List, Layers, ShoppingCart, ArrowLeft, Search, LogOut
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

import YeniEkle from './components/YeniEkle';
import Menulerim from './components/Menulerim';
import Login from './components/Login';

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
    hazirlanis: ["Tencereye sıvı yağı ve tavukları alın, kavurun.", "Salçayı ekleyip kokusu çıkana kadar kavurun.", "Havuç ve bezelyeleri ekleyin.", "Sıcak su ekleyip pişirin."]
  }
];

export default function App() {
  // GİRİŞ KONTROLÜ İÇİN YENİ STATE'LER
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [aktifSekme, setAktifSekme] = useState('ekle'); 
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
    return GUNLER[jsDay === 0 ? 6 : jsDay - 1];
  });

  const [seciliKategori, setSeciliKategori] = useState('Tümü');
  const [tarifArama, setTarifArama] = useState('');
  const [detayGosterilenTarif, setDetayGosterilenTarif] = useState(null);
  const [detayMenu, setDetayMenu] = useState(null);
  const [neredenGeldi, setNeredenGeldi] = useState(null);
  const [yeniMenu, setYeniMenu] = useState({ ad: '', tarifler: [] });
  const [modal, setModal] = useState({ acik: false, tip: '', mesaj: '', onOnay: null });
  const [yeniTarif, setYeniTarif] = useState({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [''] });

  // FIREBASE GİRİŞ KONTROLÜ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setKullanici(currentUser);
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => localStorage.setItem('tarifler', JSON.stringify(tarifler)), [tarifler]);
  useEffect(() => {
    localStorage.setItem('haftalikPlan', JSON.stringify(haftalikPlan));
    localStorage.setItem('kayitliHafta', haftaBilgisi.pazartesiStr);
  }, [haftalikPlan, haftaBilgisi.pazartesiStr]);
  useEffect(() => localStorage.setItem('menuler', JSON.stringify(menuler)), [menuler]);

  const cikisYap = () => {
    signOut(auth);
  };

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

  const hazirlanisIslem = {
    ekle: () => {
      const arr = Array.isArray(yeniTarif.hazirlanis) ? yeniTarif.hazirlanis : (yeniTarif.hazirlanis ? yeniTarif.hazirlanis.split('\n') : []);
      setYeniTarif({...yeniTarif, hazirlanis: [...arr, '']});
    },
    guncelle: (index, deger) => {
      const arr = Array.isArray(yeniTarif.hazirlanis) ? [...yeniTarif.hazirlanis] : (yeniTarif.hazirlanis ? yeniTarif.hazirlanis.split('\n') : ['']);
      arr[index] = deger;
      setYeniTarif({ ...yeniTarif, hazirlanis: arr });
    },
    sil: (index) => {
      const arr = Array.isArray(yeniTarif.hazirlanis) ? [...yeniTarif.hazirlanis] : (yeniTarif.hazirlanis ? yeniTarif.hazirlanis.split('\n') : ['']);
      setYeniTarif({...yeniTarif, hazirlanis: arr.filter((_, i) => i !== index)});
    }
  };

  const tarifKaydet = (e) => {
    e.preventDefault();
    if (!yeniTarif.ad) return;
    
    let temizHazirlanis = Array.isArray(yeniTarif.hazirlanis) ? yeniTarif.hazirlanis.filter(adim => adim.trim() !== '') : [];
    if (temizHazirlanis.length === 0) temizHazirlanis = [''];

    const eklenecekTarif = { ...yeniTarif, hazirlanis: temizHazirlanis };
    
    if (yeniTarif.id) {
      setTarifler(tarifler.map(t => t.id === yeniTarif.id ? eklenecekTarif : t));
    } else {
      setTarifler([...tarifler, { ...eklenecekTarif, id: Date.now().toString() }]);
    }
    setYeniTarif({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [''] });
  };

  const tarifSil = (id) => {
    setModal({
      acik: true, tip: 'onay', mesaj: 'Bu tarifi silmek istediğinize emin misiniz?',
      onOnay: () => {
        setTarifler(prev => prev.filter(t => t.id !== id));
        setHaftalikPlan(prevPlan => {
          const yeniPlan = {...prevPlan};
          for(let gun in yeniPlan) yeniPlan[gun] = yeniPlan[gun].filter(tId => tId !== id);
          return yeniPlan;
        });
        setMenuler(prev => prev.map(m => ({...m, tarifler: m.tarifler.filter(tId => tId !== id)})));
        if(detayGosterilenTarif?.id === id) setDetayGosterilenTarif(null);
      }
    });
  };

  const menuTarifToggle = (tarifId) => {
    if(yeniMenu.tarifler.includes(tarifId)) setYeniMenu({...yeniMenu, tarifler: yeniMenu.tarifler.filter(id => id !== tarifId)});
    else setYeniMenu({...yeniMenu, tarifler: [...yeniMenu.tarifler, tarifId]});
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
        const key = `${m.isim.toLowerCase().trim()}_${m.birim}`;
        if (!liste[key]) liste[key] = { isim: m.isim.charAt(0).toUpperCase() + m.isim.slice(1), birim: m.birim, miktar: 0 };
        liste[key].miktar += Number(m.miktar) || 0;
      });
    });
    return Object.values(liste).sort((a,b) => a.isim.localeCompare(b.isim));
  };

  const navClickEkle = () => { setAktifSekme('ekle'); setYeniTarif({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [''] }); setYeniMenu({ ad: '', tarifler: [] }); setDetayGosterilenTarif(null); setNeredenGeldi(null); };
  const navClickTarifler = () => { setAktifSekme('tarifler'); setDetayGosterilenTarif(null); setNeredenGeldi(null); };
  const navClickMenuler = () => { setAktifSekme('menuler'); setDetayMenu(null); setNeredenGeldi(null); };

  // YÜKLENİYOR DURUMU
  if (yukleniyor) {
    return <div className="min-h-screen bg-orange-50 flex items-center justify-center text-orange-600 font-bold">Yükleniyor...</div>;
  }

  // KULLANICI YOKSA LOGİN EKRANINI GÖSTER
  if (!kullanici) {
    return <Login />;
  }

  // KULLANICI VARSA ANA UYGULAMAYI GÖSTER
  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-20 md:pb-6 print:pb-0 print:bg-white">
      <nav className="bg-orange-600 text-white shadow-md print:hidden sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-xl">
            <ChefHat size={28} />
            <span className="hidden sm:inline">Bizim Mutfak</span>
          </div>
          
          <div className="hidden md:flex space-x-1">
            <button onClick={navClickEkle} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'ekle' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <PlusCircle size={18} /> <span>Yönetim / Ekle</span>
            </button>
            <button onClick={navClickTarifler} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'tarifler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <List size={18} /> <span>Tariflerim</span>
            </button>
            <button onClick={navClickMenuler} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'menuler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <Layers size={18} /> <span>Menülerim</span>
            </button>
            <button onClick={() => setAktifSekme('plan')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'plan' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <CalendarDays size={18} /> <span>Plan</span>
            </button>
            <button onClick={() => setAktifSekme('yazdir')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'yazdir' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}>
              <Printer size={18} /> <span>Yazdır</span>
            </button>
          </div>

          <button onClick={cikisYap} className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
            <LogOut size={18} /> <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] flex justify-between items-center px-1 py-2 z-50 pb-safe print:hidden">
        <button onClick={navClickEkle} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'ekle' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}>
          <PlusCircle size={22} className="mb-1" /> Yönetim
        </button>
        <button onClick={navClickTarifler} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'tarifler' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}>
          <List size={22} className="mb-1" /> Tariflerim
        </button>
        <button onClick={navClickMenuler} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'menuler' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}>
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
        
        {aktifSekme === 'ekle' && (
          <YeniEkle 
            yeniTarif={yeniTarif} setYeniTarif={setYeniTarif} yeniMenu={yeniMenu} setYeniMenu={setYeniMenu}
            tarifler={tarifler} menuler={menuler} tarifKaydet={tarifKaydet} menuKaydet={menuKaydet}
            KATEGORILER={KATEGORILER} BIRIMLER={BIRIMLER} malzemeIslem={malzemeIslem} hazirlanisIslem={hazirlanisIslem}
            resimYukle={resimYukle} menuTarifToggle={menuTarifToggle} tarifSil={tarifSil} menuSil={menuSil}
          />
        )}

        {aktifSekme === 'tarifler' && (
          <div className="animate-in fade-in duration-300">
            {detayGosterilenTarif ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden pb-4">
                <div className="bg-orange-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <button 
                    onClick={() => {
                      setDetayGosterilenTarif(null);
                      if (neredenGeldi === 'menuler') {
                        setAktifSekme('menuler');
                        setNeredenGeldi(null);
                      }
                    }} 
                    className="flex items-center text-orange-800 hover:text-orange-600 font-medium"
                  >
                    <ArrowLeft size={20} className="mr-1"/> 
                    {neredenGeldi === 'menuler' ? 'Menüye Dön' : 'Listeye Dön'}
                  </button>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                    <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold truncate">{detayGosterilenTarif.kategori}</span>
                  </div>
                </div>
                {detayGosterilenTarif.resim && <div className="w-full h-48 sm:h-64 bg-slate-200"><img src={detayGosterilenTarif.resim} alt={detayGosterilenTarif.ad} className="w-full h-full object-cover" /></div>}
                
                <div className="p-4 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 border-b pb-4">{detayGosterilenTarif.ad}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center"><ShoppingCart className="mr-2" size={20}/> Malzemeler</h3>
                      <ul className="space-y-3 text-sm sm:text-base">
                        {detayGosterilenTarif.malzemeler.map((m, i) => (
                          <li key={i} className="flex items-start text-slate-700"><span className="text-orange-500 mr-2">•</span><span><b className="font-semibold">{m.miktar} {m.birim}</b> {m.isim}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><ChefHat className="mr-2" size={20}/> Hazırlanışı</h3>
                      <div className="text-sm sm:text-base text-slate-700 leading-relaxed bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        {Array.isArray(detayGosterilenTarif.hazirlanis) ? (
                          <ul className="space-y-3">
                            {detayGosterilenTarif.hazirlanis.map((adim, i) => adim.trim() && (
                              <li key={i} className="flex gap-3">
                                <span className="font-bold text-orange-600">{i+1}.</span>
                                <span className="flex-1">{adim}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="whitespace-pre-wrap">{detayGosterilenTarif.hazirlanis || "-"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b-2 border-orange-200 pb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-orange-800">Tarif Defterim</h2>
                  <div className="flex w-full sm:w-auto gap-2">
                    <div className="relative flex-1 sm:w-48">
                      <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                      <input type="text" placeholder="Yemek Ara..." value={tarifArama} onChange={(e) => setTarifArama(e.target.value)} className="w-full pl-9 p-2 border border-orange-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <select value={seciliKategori} onChange={(e) => setSeciliKategori(e.target.value)} className="w-1/2 sm:w-32 p-2 border border-orange-300 rounded-lg text-slate-700 bg-white shadow-sm outline-none text-sm">
                      <option value="Tümü">Kategoriler</option>
                      {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                  {tarifler.length === 0 ? <div className="text-center py-12 text-slate-500">Henüz hiç tarifiniz yok.</div> : (
                    <div className="divide-y divide-slate-100">
                      {tarifler
                        .filter(t => (seciliKategori === 'Tümü' || t.kategori === seciliKategori) && t.ad.toLowerCase().includes(tarifArama.toLowerCase()))
                        .sort((a, b) => a.ad.localeCompare(b.ad))
                        .map(tarif => (
                        <div key={tarif.id} onClick={() => setDetayGosterilenTarif(tarif)} className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                          <div className="w-16 h-16 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden mr-3">
                            {tarif.resim ? <img src={tarif.resim} alt={tarif.ad} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-300"><ImageIcon size={20} /></div>}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{tarif.ad}</h3>
                            <p className="text-xs sm:text-sm text-slate-500">{tarif.kategori}</p>
                          </div>
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
          <Menulerim 
            menuler={menuler} tarifler={tarifler} getGunlukTopluMalzemeler={getGunlukTopluMalzemeler} 
            setAktifSekme={setAktifSekme} setDetayGosterilenTarif={setDetayGosterilenTarif}
            detayMenu={detayMenu} setDetayMenu={setDetayMenu} setNeredenGeldi={setNeredenGeldi} 
          />
        )}

        {aktifSekme === 'plan' && (
          <div className="animate-in fade-in duration-300 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b-2 border-orange-200 pb-3 gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-orange-800">Haftalık Menü Planı</h2>
              <div className="text-xs sm:text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm border flex items-center w-full sm:w-auto">
                <CalendarDays size={16} className="mr-2 text-orange-500" /> <span>Hafta: <b className="text-slate-800">{gunTarihleri['Pazartesi']} - {gunTarihleri['Pazar']}</b></span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {GUNLER.map(gun => (
                <div key={gun} className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 flex flex-col">
                  <h3 className="font-bold text-base sm:text-lg border-b pb-2 mb-2 sm:mb-3 text-slate-700 flex justify-between items-center">
                    <div><span className="block">{gun}</span><span className="text-[10px] sm:text-xs font-normal text-slate-400">{gunTarihleri[gun]}</span></div>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {aktifSekme === 'yazdir' && (
          <div className="animate-in fade-in duration-300 print:m-0 print:p-0">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 print:hidden flex flex-col items-center gap-4 border border-slate-200">
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">Menüyü Yazdır (PDF)</h2>
              </div>
              <div className="w-full bg-slate-50 p-2 sm:p-3 rounded-lg border border-slate-100 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max px-2">
                  {GUNLER.map(g => (
                    <button key={g} onClick={() => setYazdirilacakGun(g)} className={`px-4 py-2 rounded-lg border transition-colors text-sm font-bold shadow-sm ${yazdirilacakGun === g ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => window.print()} className="bg-blue-600 w-full sm:w-auto hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center shadow-lg text-lg">
                <Printer size={22} className="mr-2" /> PDF Olarak Kaydet
              </button>
            </div>
          </div>
        )}
      </main>

      {modal.acik && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className={`text-xl font-bold mb-3 ${modal.tip === 'uyari' ? 'text-orange-600' : 'text-red-600'}`}>{modal.tip === 'uyari' ? 'Uyarı' : 'Emin misiniz?'}</h3>
            <p className="text-slate-600 mb-6">{modal.mesaj}</p>
            <div className="flex justify-end gap-3">
              {modal.tip === 'onay' && <button onClick={() => setModal({ ...modal, acik: false })} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold">İptal</button>}
              <button onClick={() => { if(modal.onOnay) modal.onOnay(); setModal({ ...modal, acik: false }); }} className={`px-5 py-2 text-white rounded-lg font-bold shadow-sm ${modal.tip === 'uyari' ? 'bg-orange-600' : 'bg-red-600'}`}>{modal.tip === 'uyari' ? 'Tamam' : 'Sil'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

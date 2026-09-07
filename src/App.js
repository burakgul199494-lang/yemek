import React, { useState, useEffect } from 'react';
import { 
  ChefHat, PlusCircle, CalendarDays, 
  Image as ImageIcon, List, Layers, ShoppingCart, ArrowLeft, Search, LogOut, Folder
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import YeniEkle from './components/YeniEkle';
import Menulerim from './components/Menulerim';
import HaftalikPlan from './components/HaftalikPlan';
import Login from './components/Login';

const BIRIMLER = ['gr', 'kg', 'ml', 'Litre', 'adet', 'yemek kaşığı', 'tatlı kaşığı', 'çay kaşığı', 'su bardağı', 'çay bardağı', 'tutam', 'paket'];

export default function App() {
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veriYuklendi, setVeriYuklendi] = useState(false); 

  const [aktifSekme, setAktifSekme] = useState('ekle'); 

  const [tarifler, setTarifler] = useState([]);
  const [menuler, setMenuler] = useState([]);
  const [haftalikPlan, setHaftalikPlan] = useState({});
  
  const [yemekKategorileri, setYemekKategorileri] = useState(['Çorba', 'Ana Yemek', 'Zeytinyağlı', 'Ara Sıcak', 'Salata/Meze', 'Tatlı', 'Kahvaltılık', 'Kategorisiz']);
  const [menuKategorileri, setMenuKategorileri] = useState(['Günlük', 'Hafif Menü', 'Ağır Menü', 'Misafir', 'Hafta Sonu', 'Kategorisiz']);

  const [tarifKlasoru, setTarifKlasoru] = useState(null); 
  const [tarifArama, setTarifArama] = useState('');
  
  // YENİ: Kategoriye girmeden tüm tariflerde arama yapmak için state
  const [genelTarifArama, setGenelTarifArama] = useState('');

  const [detayGosterilenTarif, setDetayGosterilenTarif] = useState(null);
  
  const [detayMenu, setDetayMenu] = useState(null);
  const [neredenGeldi, setNeredenGeldi] = useState(null);
  
  const [yeniMenu, setYeniMenu] = useState({ ad: '', kategori: 'Günlük', tarifler: [] });
  const [modal, setModal] = useState({ acik: false, tip: '', mesaj: '', onOnay: null });
  const [yeniTarif, setYeniTarif] = useState({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [''] });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setKullanici(currentUser);
      if (currentUser) {
        const docRef = doc(db, "kullanicilar", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTarifler(data.tarifler || []);
          setMenuler(data.menuler || []);
          setHaftalikPlan(data.haftalikPlan || {});
          if(data.yemekKategorileri) setYemekKategorileri(data.yemekKategorileri);
          if(data.menuKategorileri) setMenuKategorileri(data.menuKategorileri);
        }
        setVeriYuklendi(true);
      } else {
        setVeriYuklendi(false);
      }
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (kullanici && veriYuklendi) {
      setDoc(doc(db, "kullanicilar", kullanici.uid), { tarifler, menuler, haftalikPlan, yemekKategorileri, menuKategorileri });
    }
  }, [tarifler, menuler, haftalikPlan, yemekKategorileri, menuKategorileri, kullanici, veriYuklendi]);

  const cikisYap = () => { signOut(auth); };

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
    const ilkKategori = yemekKategorileri.find(k => k !== 'Kategorisiz') || 'Kategorisiz';
    setYeniTarif({ ad: '', kategori: ilkKategori, resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [''] });
  };

  const tarifSil = (id) => {
    setModal({
      acik: true, tip: 'onay', mesaj: 'Bu tarifi silmek istediğinize emin misiniz?',
      onOnay: () => {
        setTarifler(prev => prev.filter(t => t.id !== id));
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
    const ilkKategori = menuKategorileri.find(k => k !== 'Kategorisiz') || 'Kategorisiz';
    setYeniMenu({ ad: '', kategori: ilkKategori, tarifler: [] });
  };

  const menuSil = (id) => {
    setModal({
      acik: true, tip: 'onay', mesaj: 'Bu menüyü silmek istediğinize emin misiniz?',
      onOnay: () => setMenuler(prev => prev.filter(m => m.id !== id))
    });
  };

  const kategoriSil = (tip, silinecek) => {
    if (silinecek === 'Kategorisiz') return;
    setModal({
      acik: true, tip: 'onay', mesaj: `"${silinecek}" kategorisini silmek istediğinize emin misiniz? İçindeki ögeler 'Kategorisiz' olarak güncellenecek.`,
      onOnay: () => {
        if (tip === 'tarif') {
          setYemekKategorileri(prev => prev.filter(k => k !== silinecek));
          setTarifler(prev => prev.map(t => t.kategori === silinecek ? {...t, kategori: 'Kategorisiz'} : t));
        } else {
          setMenuKategorileri(prev => prev.filter(k => k !== silinecek));
          setMenuler(prev => prev.map(m => m.kategori === silinecek ? {...m, kategori: 'Kategorisiz'} : m));
        }
      }
    });
  };

  const kategoriEkle = (tip, yeniAd) => {
    const ad = yeniAd.trim();
    if (!ad || ad.toLowerCase() === 'kategorisiz') return;
    if (tip === 'tarif' && !yemekKategorileri.includes(ad)) {
      const yeni = [...yemekKategorileri.filter(k => k !== 'Kategorisiz'), ad, 'Kategorisiz'];
      setYemekKategorileri(yeni);
    }
    if (tip === 'menu' && !menuKategorileri.includes(ad)) {
      const yeni = [...menuKategorileri.filter(k => k !== 'Kategorisiz'), ad, 'Kategorisiz'];
      setMenuKategorileri(yeni);
    }
  };

  const kategoriTasi = (tip, ad, yon) => {
    const islemListesi = tip === 'tarif' ? [...yemekKategorileri] : [...menuKategorileri];
    const stateHook = tip === 'tarif' ? setYemekKategorileri : setMenuKategorileri;
    
    const index = islemListesi.indexOf(ad);
    if (index < 0 || index + yon < 0 || index + yon >= islemListesi.length || islemListesi[index + yon] === 'Kategorisiz') return;
    
    const temp = islemListesi[index];
    islemListesi[index] = islemListesi[index + yon];
    islemListesi[index + yon] = temp;
    stateHook(islemListesi);
  };

  const hizliKategoriGuncelle = (tip, id, yeniKategori) => {
    if (tip === 'tarif') setTarifler(prev => prev.map(t => t.id === id ? { ...t, kategori: yeniKategori } : t));
    else setMenuler(prev => prev.map(m => m.id === id ? { ...m, kategori: yeniKategori } : m));
  };

  const tariheMenuEkle = (tarihStr, menuObjesi) => {
    setHaftalikPlan(prev => ({ ...prev, [tarihStr]: { menuAdi: menuObjesi.ad, tarifler: menuObjesi.tarifler } }));
  };

  const planSil = (tarihStr) => {
    setHaftalikPlan(prev => { const kopya = { ...prev }; delete kopya[tarihStr]; return kopya; });
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

  const navClickEkle = () => { setAktifSekme('ekle'); setYeniTarif({ ad: '', kategori: yemekKategorileri.find(k=>k!=='Kategorisiz')||'Kategorisiz', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [''] }); setYeniMenu({ ad: '', kategori: menuKategorileri.find(k=>k!=='Kategorisiz')||'Kategorisiz', tarifler: [] }); setDetayGosterilenTarif(null); setNeredenGeldi(null); };
  
  // YENİ: Menü değişiminde genel aramayı da sıfırlıyoruz.
  const navClickTarifler = () => { setAktifSekme('tarifler'); setTarifKlasoru(null); setDetayGosterilenTarif(null); setNeredenGeldi(null); setTarifArama(''); setGenelTarifArama(''); };
  
  const navClickMenuler = () => { setAktifSekme('menuler'); setDetayMenu(null); setNeredenGeldi(null); };

  if (yukleniyor) return <div className="min-h-screen bg-orange-50 flex items-center justify-center text-orange-600 font-bold">Yükleniyor...</div>;
  if (!kullanici) return <Login />;

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-20 md:pb-6 print:pb-0 print:bg-white">
      <nav className="bg-orange-600 text-white shadow-md print:hidden sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-xl">
            <ChefHat size={28} />
            <span className="hidden sm:inline">Bizim Mutfak</span>
          </div>
          
          <div className="hidden md:flex space-x-1">
            <button onClick={navClickEkle} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'ekle' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}><PlusCircle size={18} /> <span>Yönetim / Ekle</span></button>
            <button onClick={navClickTarifler} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'tarifler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}><List size={18} /> <span>Tariflerim</span></button>
            <button onClick={navClickMenuler} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'menuler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}><Layers size={18} /> <span>Menülerim</span></button>
            <button onClick={() => setAktifSekme('plan')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekme === 'plan' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}><CalendarDays size={18} /> <span>Plan & Alışveriş</span></button>
          </div>

          <button onClick={cikisYap} className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
            <LogOut size={18} /> <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] flex justify-between items-center px-1 py-2 z-50 pb-safe print:hidden">
        <button onClick={navClickEkle} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'ekle' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}><PlusCircle size={22} className="mb-1" /> Yönetim</button>
        <button onClick={navClickTarifler} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'tarifler' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}><List size={22} className="mb-1" /> Tariflerim</button>
        <button onClick={navClickMenuler} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'menuler' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}><Layers size={22} className="mb-1" /> Menüler</button>
        <button onClick={() => setAktifSekme('plan')} className={`flex-1 flex flex-col items-center p-2 rounded-lg text-[10px] ${aktifSekme === 'plan' ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-orange-500'}`}><CalendarDays size={22} className="mb-1" /> Plan</button>
      </div>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
        
        {aktifSekme === 'ekle' && (
          <YeniEkle 
            yeniTarif={yeniTarif} setYeniTarif={setYeniTarif} yeniMenu={yeniMenu} setYeniMenu={setYeniMenu}
            tarifler={tarifler} menuler={menuler} tarifKaydet={tarifKaydet} menuKaydet={menuKaydet}
            yemekKategorileri={yemekKategorileri} menuKategorileri={menuKategorileri} BIRIMLER={BIRIMLER} 
            malzemeIslem={malzemeIslem} hazirlanisIslem={hazirlanisIslem} resimYukle={resimYukle} 
            menuTarifToggle={menuTarifToggle} tarifSil={tarifSil} menuSil={menuSil} 
            kategoriEkle={kategoriEkle} kategoriSil={kategoriSil} kategoriTasi={kategoriTasi}
            hizliKategoriGuncelle={hizliKategoriGuncelle}
          />
        )}

        {aktifSekme === 'tarifler' && (
          <div className="animate-in fade-in duration-300">
            {detayGosterilenTarif ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden pb-4">
                <div className="bg-orange-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <button onClick={() => { setDetayGosterilenTarif(null); if (neredenGeldi === 'menuler') { setAktifSekme('menuler'); setNeredenGeldi(null); } }} className="flex items-center text-orange-800 hover:text-orange-600 font-medium">
                    <ArrowLeft size={20} className="mr-1"/> {neredenGeldi === 'menuler' ? 'Menüye Dön' : (genelTarifArama ? 'Aramaya Dön' : 'Kategoriye Dön')}
                  </button>
                  <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold truncate">{detayGosterilenTarif.kategori}</span>
                </div>
                {detayGosterilenTarif.resim && <div className="w-full h-48 sm:h-64 bg-slate-200"><img src={detayGosterilenTarif.resim} alt={detayGosterilenTarif.ad} className="w-full h-full object-cover" /></div>}
                <div className="p-4 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 border-b pb-4">{detayGosterilenTarif.ad}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center"><ShoppingCart className="mr-2" size={20}/> Malzemeler</h3>
                      <ul className="space-y-3 text-sm sm:text-base">
                        {detayGosterilenTarif.malzemeler.map((m, i) => <li key={i} className="flex items-start text-slate-700"><span className="text-orange-500 mr-2">•</span><span><b className="font-semibold">{m.miktar} {m.birim}</b> {m.isim}</span></li>)}
                      </ul>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><ChefHat className="mr-2" size={20}/> Hazırlanışı</h3>
                      <div className="text-sm sm:text-base text-slate-700 leading-relaxed bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        {Array.isArray(detayGosterilenTarif.hazirlanis) ? (
                          <ul className="space-y-3">{detayGosterilenTarif.hazirlanis.map((adim, i) => adim.trim() && <li key={i} className="flex gap-3"><span className="font-bold text-orange-600">{i+1}.</span><span className="flex-1">{adim}</span></li>)}</ul>
                        ) : <p className="whitespace-pre-wrap">{detayGosterilenTarif.hazirlanis || "-"}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : tarifKlasoru ? (
              <>
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <button onClick={() => setTarifKlasoru(null)} className="flex items-center text-orange-800 hover:text-orange-600 font-bold">
                    <ArrowLeft size={20} className="mr-2"/> Kategorilere Dön
                  </button>
                  <span className="font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg flex items-center"><Folder size={18} className="mr-2 text-orange-500"/> {tarifKlasoru} Kategorisi</span>
                </div>
                
                <div className="relative mb-6">
                  <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="text" placeholder={`"${tarifKlasoru}" içinde yemek ara...`} value={tarifArama} onChange={(e) => setTarifArama(e.target.value)} className="w-full pl-12 p-3 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-base" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                  {tarifler.filter(t => t.kategori === tarifKlasoru).length === 0 ? <div className="text-center py-12 text-slate-500">Bu kategoride henüz yemek yok.</div> : (
                    <div className="divide-y divide-slate-100">
                      {tarifler
                        .filter(t => t.kategori === tarifKlasoru && t.ad.toLowerCase().includes(tarifArama.toLowerCase()))
                        .sort((a, b) => a.ad.localeCompare(b.ad))
                        .map(tarif => (
                        <div key={tarif.id} onClick={() => setDetayGosterilenTarif(tarif)} className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                          <div className="w-16 h-16 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden mr-3">
                            {tarif.resim ? <img src={tarif.resim} alt={tarif.ad} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-300"><ImageIcon size={20} /></div>}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{tarif.ad}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-orange-800 border-b-2 border-orange-200 pb-2 flex items-center">
                  <Folder className="mr-2" size={24}/> Yemek Kategorileri
                </h2>
                
                {/* YENİ: GENEL TARİF ARAMA ÇUBUĞU */}
                <div className="relative mb-6">
                  <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Tüm tariflerde yemek ara..." 
                    value={genelTarifArama} 
                    onChange={(e) => setGenelTarifArama(e.target.value)} 
                    className="w-full pl-12 p-3 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-base bg-white" 
                  />
                </div>

                {genelTarifArama.trim() !== '' ? (
                  // ARAMA YAPILIYORSA LİSTEYİ GÖSTER
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="divide-y divide-slate-100">
                      {tarifler
                        .filter(t => t.ad.toLowerCase().includes(genelTarifArama.toLowerCase()))
                        .sort((a, b) => a.ad.localeCompare(b.ad))
                        .map(tarif => (
                        <div key={tarif.id} onClick={() => setDetayGosterilenTarif(tarif)} className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                          <div className="w-16 h-16 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden mr-3">
                            {tarif.resim ? <img src={tarif.resim} alt={tarif.ad} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-300"><ImageIcon size={20} /></div>}
                          </div>
                          <div className="flex-1 min-w-0 pr-2 flex flex-col items-start">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{tarif.ad}</h3>
                            <span className="text-[10px] sm:text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-medium mt-1">{tarif.kategori}</span>
                          </div>
                        </div>
                      ))}
                      {tarifler.filter(t => t.ad.toLowerCase().includes(genelTarifArama.toLowerCase())).length === 0 && (
                         <div className="text-center py-8 text-slate-500">Aramanızla eşleşen yemek bulunamadı.</div>
                      )}
                    </div>
                  </div>
                ) : (
                  // ARAMA YOKSA KATEGORİ KLASÖRLERİNİ GÖSTER
                  <div className="flex flex-col space-y-3">
                    {yemekKategorileri.map(kategori => {
                      const adet = tarifler.filter(t => t.kategori === kategori).length;
                      if (kategori === 'Kategorisiz' && adet === 0) return null;
                      
                      return (
                        <div key={kategori} onClick={() => {setTarifKlasoru(kategori); setTarifArama('');}} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between group">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-orange-500 transition-colors">
                              <Folder size={24} className="text-orange-500 group-hover:text-white transition-colors" />
                            </div>
                            <h4 className="font-bold text-slate-800 text-base sm:text-lg">{kategori}</h4>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{adet} Yemek</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {aktifSekme === 'menuler' && (
          <Menulerim 
            menuler={menuler} tarifler={tarifler} getGunlukTopluMalzemeler={getGunlukTopluMalzemeler} 
            setAktifSekme={setAktifSekme} setDetayGosterilenTarif={setDetayGosterilenTarif}
            detayMenu={detayMenu} setDetayMenu={setDetayMenu} setNeredenGeldi={setNeredenGeldi} 
            tariheMenuEkle={tariheMenuEkle} menuKategorileri={menuKategorileri}
          />
        )}

        {aktifSekme === 'plan' && <HaftalikPlan haftalikPlan={haftalikPlan} tarifler={tarifler} planSil={planSil} />}
      </main>

      {modal.acik && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4 print:hidden">
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

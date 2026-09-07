import React, { useState, useEffect } from 'react';
import { 
  ChefHat, PlusCircle, CalendarDays, 
  Image as ImageIcon, List, Layers, ShoppingCart, ArrowLeft, Search, LogOut, Folder, Calendar, X
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

  const getBaslangicSekmesi = () => {
    const hash = window.location.hash.replace('#', '');
    return ['ekle', 'tarifler', 'menuler', 'plan'].includes(hash) ? hash : 'ekle';
  };

  const [aktifSekmeState, setAktifSekmeState] = useState(getBaslangicSekmesi);
  const setAktifSekme = (sekme) => { window.location.hash = sekme; setAktifSekmeState(sekme); };

  useEffect(() => {
    const handleHashChange = () => setAktifSekmeState(getBaslangicSekmesi());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [tarifler, setTarifler] = useState([]);
  const [menuler, setMenuler] = useState([]);
  const [haftalikPlan, setHaftalikPlan] = useState({});
  const [yemekKategorileri, setYemekKategorileri] = useState(['Çorba', 'Ana Yemek', 'Zeytinyağlı', 'Ara Sıcak', 'Salata/Meze', 'Tatlı', 'Kahvaltılık', 'Kategorisiz']);
  const [menuKategorileri, setMenuKategorileri] = useState(['Günlük', 'Hafif Menü', 'Ağır Menü', 'Misafir', 'Hafta Sonu', 'Kategorisiz']);

  const [tarifKlasoru, setTarifKlasoru] = useState(null); 
  const [tarifArama, setTarifArama] = useState('');
  const [genelTarifArama, setGenelTarifArama] = useState('');
  const [detayGosterilenTarif, setDetayGosterilenTarif] = useState(null);
  const [detayMenu, setDetayMenu] = useState(null);
  const [neredenGeldi, setNeredenGeldi] = useState(null);
  
  // YENİ: Menü state'ine resim eklendi
  const [yeniMenu, setYeniMenu] = useState({ ad: '', kategori: 'Günlük', tarifler: [], resim: '' });
  const [modal, setModal] = useState({ acik: false, tip: '', mesaj: '', onOnay: null });
  const [yeniTarif, setYeniTarif] = useState({ ad: '', kategori: 'Ana Yemek', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [{metin: '', resim: ''}] });

  const [tarifPlanModalAcik, setTarifPlanModalAcik] = useState(false);
  const [tarifPlanTarihi, setTarifPlanTarihi] = useState('');

  const [resimYukleniyor, setResimYukleniyor] = useState(false);
  const [acikResim, setAcikResim] = useState(null);

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

  // YENİ: Hedef eklendi ('tarif' veya 'menu')
  const resimYukle = async (e, hedef = 'tarif', stepIndex = null) => {
    const dosya = e.target.files[0];
    if (!dosya) return;
    setResimYukleniyor(true);

    const formData = new FormData();
    formData.append('image', dosya);

    try {
      const IMGBB_API_KEY = "329fb6a18d6667bf935aecfbd2c20d43"; 
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();

      if (data.success) {
        const url = data.data.url; 

        if (hedef === 'tarif') {
          if (stepIndex !== null) {
            hazirlanisIslem.resimEkle(stepIndex, url);
          } else {
            setYeniTarif({ ...yeniTarif, resim: url });
          }
        } else if (hedef === 'menu') {
          setYeniMenu({ ...yeniMenu, resim: url });
        }
        
      } else {
        alert("Fotoğraf yüklenemedi: Lütfen ImgBB API anahtarınızı kontrol edin.");
      }
    } catch(error) {
      alert("Fotoğraf yüklenirken bir internet bağlantısı hatası oluştu.");
    }
    setResimYukleniyor(false);
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
      const arr = Array.isArray(yeniTarif.hazirlanis) ? yeniTarif.hazirlanis : [{metin: '', resim: ''}];
      setYeniTarif({...yeniTarif, hazirlanis: [...arr, {metin: '', resim: ''}]});
    },
    guncelle: (index, deger) => {
      const arr = Array.isArray(yeniTarif.hazirlanis) ? [...yeniTarif.hazirlanis] : [];
      if (typeof arr[index] === 'string') arr[index] = { metin: arr[index], resim: '' };
      else if (!arr[index]) arr[index] = { metin: '', resim: '' };
      arr[index] = { ...arr[index], metin: deger };
      setYeniTarif({ ...yeniTarif, hazirlanis: arr });
    },
    resimEkle: (index, url) => {
      const arr = Array.isArray(yeniTarif.hazirlanis) ? [...yeniTarif.hazirlanis] : [];
      if (typeof arr[index] === 'string') arr[index] = { metin: arr[index], resim: '' };
      else if (!arr[index]) arr[index] = { metin: '', resim: '' };
      arr[index] = { ...arr[index], resim: url };
      setYeniTarif({ ...yeniTarif, hazirlanis: arr });
    },
    resimSil: (index) => {
      const arr = [...yeniTarif.hazirlanis];
      if (typeof arr[index] === 'object') {
        arr[index] = { ...arr[index], resim: '' };
        setYeniTarif({ ...yeniTarif, hazirlanis: arr });
      }
    },
    sil: (index) => {
      const arr = Array.isArray(yeniTarif.hazirlanis) ? [...yeniTarif.hazirlanis] : [];
      setYeniTarif({...yeniTarif, hazirlanis: arr.filter((_, i) => i !== index)});
    }
  };

  const tarifKaydet = (e) => {
    e.preventDefault();
    if (!yeniTarif.ad) return;
    let temizHazirlanis = [];
    if (Array.isArray(yeniTarif.hazirlanis)) {
      temizHazirlanis = yeniTarif.hazirlanis.filter(adim => {
        const metin = typeof adim === 'string' ? adim : adim.metin;
        return metin && metin.trim() !== '';
      });
    }
    if (temizHazirlanis.length === 0) temizHazirlanis = [{metin: '', resim: ''}];

    const eklenecekTarif = { ...yeniTarif, hazirlanis: temizHazirlanis };
    if (yeniTarif.id) setTarifler(tarifler.map(t => t.id === yeniTarif.id ? eklenecekTarif : t));
    else setTarifler([...tarifler, { ...eklenecekTarif, id: Date.now().toString() }]);
    
    const ilkKategori = yemekKategorileri.find(k => k !== 'Kategorisiz') || 'Kategorisiz';
    setYeniTarif({ ad: '', kategori: ilkKategori, resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [{metin: '', resim: ''}] });
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
    // YENİ: Menü resmini de sıfırlıyoruz
    setYeniMenu({ ad: '', kategori: ilkKategori, tarifler: [], resim: '' });
  };

  const menuSil = (id) => { setModal({ acik: true, tip: 'onay', mesaj: 'Bu menüyü silmek istediğinize emin misiniz?', onOnay: () => setMenuler(prev => prev.filter(m => m.id !== id)) }); };

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
    if (tip === 'tarif' && !yemekKategorileri.includes(ad)) setYemekKategorileri([...yemekKategorileri.filter(k => k !== 'Kategorisiz'), ad, 'Kategorisiz']);
    if (tip === 'menu' && !menuKategorileri.includes(ad)) setMenuKategorileri([...menuKategorileri.filter(k => k !== 'Kategorisiz'), ad, 'Kategorisiz']);
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

  const tariheEkle = (tarihStr, tip, obje) => {
    setHaftalikPlan(prev => {
      const gunPlani = prev[tarihStr] || { menuAdlari: [], tarifler: [] };
      let yeniMenuAdlari = [...(gunPlani.menuAdlari || [])];
      let yeniTarifler = [...(gunPlani.tarifler || [])];
      if (gunPlani.menuAdi && yeniMenuAdlari.length === 0) yeniMenuAdlari.push(gunPlani.menuAdi);
      if (tip === 'menu') {
        if (!yeniMenuAdlari.includes(obje.ad)) yeniMenuAdlari.push(obje.ad);
        obje.tarifler.forEach(tId => { if (!yeniTarifler.includes(tId)) yeniTarifler.push(tId); });
      } else if (tip === 'tarif') {
        if (!yeniTarifler.includes(obje.id)) yeniTarifler.push(obje.id);
      }
      return { ...prev, [tarihStr]: { menuAdlari: yeniMenuAdlari, tarifler: yeniTarifler } };
    });
  };

  const tarifTakvimeIsle = (e) => {
    e.preventDefault();
    if(!tarifPlanTarihi) return;
    tariheEkle(tarifPlanTarihi, 'tarif', detayGosterilenTarif);
    setTarifPlanModalAcik(false);
    setTarifPlanTarihi('');
    alert(`"${detayGosterilenTarif.ad}" ${tarifPlanTarihi} tarihine başarıyla eklendi!`);
  };

  const planTemizle = (tarihStr) => { setHaftalikPlan(prev => { const kopya = { ...prev }; delete kopya[tarihStr]; return kopya; }); };

  const plandanOgeSil = (tarihStr, tip, obje) => {
    setHaftalikPlan(prev => {
      const kopya = { ...prev };
      const gunPlani = { ...kopya[tarihStr] };
      if (!gunPlani) return prev;
      if (tip === 'menu') {
        gunPlani.menuAdlari = (gunPlani.menuAdlari || []).filter(m => m !== obje.ad);
        if (gunPlani.menuAdi === obje.ad) delete gunPlani.menuAdi;
        const cikarilacakTarifler = obje.tarifler || [];
        gunPlani.tarifler = (gunPlani.tarifler || []).filter(tId => !cikarilacakTarifler.includes(tId));
      } else if (tip === 'tarif') {
        gunPlani.tarifler = (gunPlani.tarifler || []).filter(tId => tId !== obje.id);
      }
      if ((!gunPlani.menuAdlari || gunPlani.menuAdlari.length === 0) && (!gunPlani.tarifler || gunPlani.tarifler.length === 0)) delete kopya[tarihStr];
      else kopya[tarihStr] = gunPlani;
      return kopya;
    });
  };

  const formatTarih = (iso) => { if (!iso) return ''; const p = iso.split('-'); return `${p[2]}.${p[1]}.${p[0]}`; };
  const sonTarihTarif = (id) => { const t = Object.keys(haftalikPlan).filter(x => haftalikPlan[x].tarifler?.includes(id)).sort((a,b) => new Date(b) - new Date(a)); return t.length > 0 ? formatTarih(t[0]) : null; };
  const sonTarihMenu = (ad) => { const t = Object.keys(haftalikPlan).filter(x => { const p = haftalikPlan[x]; return p.menuAdlari?.includes(ad) || p.menuAdi === ad; }).sort((a,b) => new Date(b) - new Date(a)); return t.length > 0 ? formatTarih(t[0]) : null; };

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

  const navClickEkle = () => { setAktifSekme('ekle'); setYeniTarif({ ad: '', kategori: yemekKategorileri.find(k=>k!=='Kategorisiz')||'Kategorisiz', resim: '', malzemeler: [{ miktar: '', birim: 'gr', isim: '' }], hazirlanis: [{metin:'', resim:''}] }); setYeniMenu({ ad: '', kategori: menuKategorileri.find(k=>k!=='Kategorisiz')||'Kategorisiz', tarifler: [], resim: '' }); setDetayGosterilenTarif(null); setNeredenGeldi(null); };
  const navClickTarifler = () => { setAktifSekme('tarifler'); setTarifKlasoru(null); setDetayGosterilenTarif(null); setNeredenGeldi(null); setTarifArama(''); setGenelTarifArama(''); };
  const navClickMenuler = () => { setAktifSekme('menuler'); setDetayMenu(null); setNeredenGeldi(null); };

  if (yukleniyor) return <div className="min-h-screen bg-orange-50 flex items-center justify-center text-orange-600 font-bold">Yükleniyor...</div>;
  if (!kullanici) return <Login />;

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800 font-sans pb-28 md:pb-6 print:pb-0 print:bg-white">
      <nav className="bg-orange-600 text-white shadow-md print:hidden sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 font-bold text-xl"><ChefHat size={28} /><span className="hidden sm:inline">Bizim Mutfak</span></div>
          <div className="hidden md:flex space-x-1">
            <button onClick={navClickEkle} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekmeState === 'ekle' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}><PlusCircle size={18} /> <span>Yönetim / Ekle</span></button>
            <button onClick={navClickTarifler} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekmeState === 'tarifler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}><List size={18} /> <span>Tariflerim</span></button>
            <button onClick={navClickMenuler} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekmeState === 'menuler' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}><Layers size={18} /> <span>Menülerim</span></button>
            <button onClick={() => setAktifSekme('plan')} className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${aktifSekmeState === 'plan' ? 'bg-orange-700' : 'hover:bg-orange-500'}`}><CalendarDays size={18} /> <span>Plan & Alışveriş</span></button>
          </div>
          <button onClick={cikisYap} className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"><LogOut size={18} /> <span className="hidden sm:inline">Çıkış</span></button>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.04)] flex justify-between items-center px-2 py-2 z-50 print:hidden" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        <button onClick={navClickEkle} className={`flex-1 flex flex-col items-center p-2 rounded-xl text-[10px] sm:text-xs transition-all active:scale-95 ${aktifSekmeState === 'ekle' ? 'text-orange-600 font-extrabold bg-orange-50' : 'text-slate-500'}`}><PlusCircle size={24} className="mb-1" /> Yönetim</button>
        <button onClick={navClickTarifler} className={`flex-1 flex flex-col items-center p-2 rounded-xl text-[10px] sm:text-xs transition-all active:scale-95 ${aktifSekmeState === 'tarifler' ? 'text-orange-600 font-extrabold bg-orange-50' : 'text-slate-500'}`}><List size={24} className="mb-1" /> Tariflerim</button>
        <button onClick={navClickMenuler} className={`flex-1 flex flex-col items-center p-2 rounded-xl text-[10px] sm:text-xs transition-all active:scale-95 ${aktifSekmeState === 'menuler' ? 'text-orange-600 font-extrabold bg-orange-50' : 'text-slate-500'}`}><Layers size={24} className="mb-1" /> Menüler</button>
        <button onClick={() => setAktifSekme('plan')} className={`flex-1 flex flex-col items-center p-2 rounded-xl text-[10px] sm:text-xs transition-all active:scale-95 ${aktifSekmeState === 'plan' ? 'text-orange-600 font-extrabold bg-orange-50' : 'text-slate-500'}`}><CalendarDays size={24} className="mb-1" /> Plan</button>
      </div>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
        
        {aktifSekmeState === 'ekle' && (
          <YeniEkle 
            yeniTarif={yeniTarif} setYeniTarif={setYeniTarif} yeniMenu={yeniMenu} setYeniMenu={setYeniMenu}
            tarifler={tarifler} menuler={menuler} tarifKaydet={tarifKaydet} menuKaydet={menuKaydet}
            yemekKategorileri={yemekKategorileri} menuKategorileri={menuKategorileri} BIRIMLER={BIRIMLER} 
            malzemeIslem={malzemeIslem} hazirlanisIslem={hazirlanisIslem} resimYukle={resimYukle} resimYukleniyor={resimYukleniyor}
            menuTarifToggle={menuTarifToggle} tarifSil={tarifSil} menuSil={menuSil} 
            kategoriEkle={kategoriEkle} kategoriSil={kategoriSil} kategoriTasi={kategoriTasi}
            hizliKategoriGuncelle={hizliKategoriGuncelle}
          />
        )}

        {aktifSekmeState === 'tarifler' && (
          <div className="animate-in fade-in duration-300">
            {detayGosterilenTarif ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden pb-4">
                <div className="bg-orange-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <button onClick={() => { setDetayGosterilenTarif(null); if (neredenGeldi === 'menuler') { setAktifSekme('menuler'); setNeredenGeldi(null); } else if (neredenGeldi === 'plan') { setAktifSekme('plan'); setNeredenGeldi(null); } }} className="flex items-center text-orange-800 hover:text-orange-600 font-medium"><ArrowLeft size={20} className="mr-1"/> {neredenGeldi === 'menuler' ? 'Menüye Dön' : neredenGeldi === 'plan' ? 'Plana Dön' : (genelTarifArama ? 'Aramaya Dön' : 'Kategoriye Dön')}</button>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold truncate">{detayGosterilenTarif.kategori}</span>
                    <button onClick={() => setTarifPlanModalAcik(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-full font-bold flex items-center shadow-sm text-sm"><Calendar size={16} className="mr-2" /> Planla</button>
                  </div>
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
                          <ul className="space-y-4">
                            {detayGosterilenTarif.hazirlanis.map((adim, i) => {
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
                        ) : <p className="whitespace-pre-wrap">{detayGosterilenTarif.hazirlanis}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {tarifPlanModalAcik && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 print:hidden">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                      <h3 className="text-lg font-bold text-slate-800 mb-3">Bu Yemek Hangi Güne Eklensin?</h3>
                      <form onSubmit={tarifTakvimeIsle} className="space-y-4">
                        <input type="date" required value={tarifPlanTarihi} onChange={(e) => setTarifPlanTarihi(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 font-medium" />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setTarifPlanModalAcik(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-600 text-sm">İptal</button>
                          <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-sm">Plana Ekle</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : tarifKlasoru ? (
              <>
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <button onClick={() => setTarifKlasoru(null)} className="flex items-center text-orange-800 hover:text-orange-600 font-bold"><ArrowLeft size={20} className="mr-2"/> Kategorilere Dön</button>
                  <span className="font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg flex items-center"><Folder size={18} className="mr-2 text-orange-500"/> {tarifKlasoru} Kategorisi</span>
                </div>
                <div className="relative mb-6">
                  <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="text" placeholder={`"${tarifKlasoru}" içinde yemek ara...`} value={tarifArama} onChange={(e) => setTarifArama(e.target.value)} className="w-full pl-12 p-3 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-base" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                  {tarifler.filter(t => t.kategori === tarifKlasoru).length === 0 ? <div className="text-center py-12 text-slate-500">Bu kategoride henüz yemek yok.</div> : (
                    <div className="divide-y divide-slate-100">
                      {tarifler.filter(t => t.kategori === tarifKlasoru && t.ad.toLowerCase().includes(tarifArama.toLowerCase())).sort((a, b) => a.ad.localeCompare(b.ad)).map(tarif => (
                        <div key={tarif.id} onClick={() => setDetayGosterilenTarif(tarif)} className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                          <div className="w-16 h-16 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden mr-3">
                            {tarif.resim ? <img src={tarif.resim} alt={tarif.ad} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-300"><ImageIcon size={20} /></div>}
                          </div>
                          <div className="flex-1 min-w-0 pr-2 flex flex-col items-start">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{tarif.ad}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] sm:text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-medium">{tarif.kategori}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center"><Calendar size={12} className="mr-1"/> Son: {sonTarihTarif(tarif.id) || 'Yok'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-orange-800 border-b-2 border-orange-200 pb-2 flex items-center"><Folder className="mr-2" size={24}/> Yemek Kategorileri</h2>
                <div className="relative mb-6">
                  <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="text" placeholder="Tüm tariflerde yemek ara..." value={genelTarifArama} onChange={(e) => setGenelTarifArama(e.target.value)} className="w-full pl-12 p-3 border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-base bg-white" />
                </div>
                {genelTarifArama.trim() !== '' ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="divide-y divide-slate-100">
                      {tarifler.filter(t => t.ad.toLowerCase().includes(genelTarifArama.toLowerCase())).sort((a, b) => a.ad.localeCompare(b.ad)).map(tarif => (
                        <div key={tarif.id} onClick={() => setDetayGosterilenTarif(tarif)} className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors group">
                          <div className="w-16 h-16 flex-shrink-0 bg-orange-100 rounded-lg overflow-hidden mr-3">
                            {tarif.resim ? <img src={tarif.resim} alt={tarif.ad} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-orange-300"><ImageIcon size={20} /></div>}
                          </div>
                          <div className="flex-1 min-w-0 pr-2 flex flex-col items-start">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">{tarif.ad}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] sm:text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-medium">{tarif.kategori}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center"><Calendar size={12} className="mr-1"/> Son: {sonTarihTarif(tarif.id) || 'Yok'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    {yemekKategorileri.map(kategori => {
                      const adet = tarifler.filter(t => t.kategori === kategori).length;
                      if (kategori === 'Kategorisiz' && adet === 0) return null;
                      return (
                        <div key={kategori} onClick={() => {setTarifKlasoru(kategori); setTarifArama('');}} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center justify-between group">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-orange-500 transition-colors"><Folder size={24} className="text-orange-500 group-hover:text-white transition-colors" /></div>
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

        {aktifSekmeState === 'menuler' && (
          <Menulerim 
            menuler={menuler} tarifler={tarifler} getGunlukTopluMalzemeler={getGunlukTopluMalzemeler} 
            setAktifSekme={setAktifSekme} setDetayGosterilenTarif={setDetayGosterilenTarif}
            detayMenu={detayMenu} setDetayMenu={setDetayMenu} setNeredenGeldi={setNeredenGeldi} 
            tariheEkle={tariheEkle} menuKategorileri={menuKategorileri} sonTarihMenu={sonTarihMenu}
            setAcikResim={setAcikResim} 
          />
        )}

        {aktifSekmeState === 'plan' && (
          <HaftalikPlan 
            haftalikPlan={haftalikPlan} tarifler={tarifler} menuler={menuler} 
            planTemizle={planTemizle} plandanOgeSil={plandanOgeSil} 
            getGunlukTopluMalzemeler={getGunlukTopluMalzemeler}
            setAktifSekme={setAktifSekme} setDetayGosterilenTarif={setDetayGosterilenTarif} setNeredenGeldi={setNeredenGeldi}
            setAcikResim={setAcikResim} 
          />
        )}
      </main>

      {acikResim && (
        <div className="fixed inset-0 bg-slate-900/90 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <button onClick={() => setAcikResim(null)} className="absolute top-6 right-6 text-slate-300 hover:text-white bg-slate-800 p-2 rounded-full transition-colors shadow-lg z-10"><X size={28}/></button>
          <img src={acikResim} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" alt="Hazırlık Adımı Detayı" />
        </div>
      )}

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

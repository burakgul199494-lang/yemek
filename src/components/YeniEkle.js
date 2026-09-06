import React, { useState } from 'react';
import { Layers, ChefHat } from 'lucide-react';

export default function YeniEkle({ tarifler, tarifKaydet, menuKaydet, KATEGORILER, BIRIMLER }) {
  const [islemTipi, setIslemTipi] = useState('tarif'); // 'tarif' veya 'menu'
  
  // Tarif state ve fonksiyonları (mevcut kodundaki yeniTarif state'i ve fonksiyonları buraya gelecek)
  // Menü state ve fonksiyonları (mevcut kodundaki yeniMenu state'i ve fonksiyonları buraya gelecek)

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300 mb-8">
      {/* Üst Geçiş Butonları */}
      <div className="flex bg-orange-100 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setIslemTipi('tarif')}
          className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center transition-all ${islemTipi === 'tarif' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/60 hover:text-orange-800'}`}
        >
          <ChefHat size={20} className="mr-2" /> Yeni Tarif Ekle
        </button>
        <button 
          onClick={() => setIslemTipi('menu')}
          className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center transition-all ${islemTipi === 'menu' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-800/60 hover:text-orange-800'}`}
        >
          <Layers size={20} className="mr-2" /> Yeni Menü Oluştur
        </button>
      </div>

      {/* Form Alanları */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-orange-100">
        {islemTipi === 'tarif' ? (
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Yeni Yemek Tarifi</h2>
            {/* BURAYA MEVCUT TARİF EKLEME FORMUNU (form onSubmit={tarifKaydet}...) YAPIŞTIR */}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Özel Menü Oluştur</h2>
            {/* BURAYA MEVCUT MENÜ EKLEME FORMUNU YAPIŞTIR */}
          </div>
        )}
      </div>
    </div>
  );
}

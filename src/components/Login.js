import React, { useState } from 'react';
import { ChefHat, Lock, User } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [kullanici, setKullanici] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const girisYap = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    
    try {
      // Firebase normalde e-posta ile giriş yapar. 
      // Kolaylık olsun diye sen "burak" yazsan bile sistem onu "burak@bizimmutfak.com" olarak algılayıp giriş yapacak.
      const formatliEmail = kullanici.includes('@') ? kullanici : `${kullanici}@bizimmutfak.com`;
      await signInWithEmailAndPassword(auth, formatliEmail, sifre);
    } catch (error) {
      setHata('Giriş başarısız. Kullanıcı adı veya şifre hatalı.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-600 text-white p-3 rounded-full mb-3 shadow-md">
            <ChefHat size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Bizim Mutfak</h1>
          <p className="text-slate-500 text-sm mt-1">Devam etmek için giriş yapın</p>
        </div>

        {hata && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-5 text-center font-medium border border-red-100">
            {hata}
          </div>
        )}

        <form onSubmit={girisYap} className="space-y-5">
          <div className="relative">
            <User size={20} className="absolute left-3 top-3.5 text-slate-400" />
            <input 
              type="text" 
              required
              value={kullanici}
              onChange={(e) => setKullanici(e.target.value.toLowerCase().trim())}
              placeholder="Kullanıcı Adı" 
              className="w-full pl-10 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
          
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-3.5 text-slate-400" />
            <input 
              type="password" 
              required
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="Şifre" 
              className="w-full pl-10 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={yukleniyor}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center"
          >
            {yukleniyor ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}

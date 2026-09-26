'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ kategori: string; akurasi: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Pilih gambar sampah terlebih dahulu!');

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Tembak API Flask Python di Port 5000
      const res = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Gagal terhubung ke server AI');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses gambar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
        <h1 className="text-3xl font-bold text-center text-emerald-400 mb-2">ESAM APP</h1>
        <p className="text-slate-400 text-center text-sm mb-6">
          Sistem Klasifikasi Sampah Berbasis AI (Organik, Anorganik, B3)
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-4 hover:border-emerald-500 transition cursor-pointer bg-slate-900/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer text-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview Sampah"
                  className="max-h-56 rounded-lg object-cover mx-auto mb-2"
                />
              ) : (
                <div className="py-8">
                  <p className="text-emerald-400 font-semibold mb-1">Klik untuk Upload Gambar</p>
                  <p className="text-xs text-slate-500">Format: JPG, JPEG, PNG</p>
                </div>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition shadow-lg"
          >
            {loading ? 'Memproses Gambar AI...' : 'Deteksi Sampah'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-emerald-500/50 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hasil Identifikasi</p>
            <h2 className="text-2xl font-black text-emerald-400 mb-1">{result.kategori}</h2>
            <p className="text-sm text-slate-300">
              Tingkat Keyakinan: <span className="font-bold text-white">{result.akurasi}</span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
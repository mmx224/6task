import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import type { Ad, AdsResponse } from './types';
import './App.css';

const API_BASE = 'https://inai-col1.fishrungames.com';

function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadAds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/ads`);
      const data: AdsResponse = await res.json();
      setAds(data.items);
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearSelection = () => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const publishAd = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('price', price);
    if (image) formData.append('image', image);

    try {
      setIsSending(true);
      const res = await fetch(`${API_BASE}/ads`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setPrice('');
        clearSelection();
        setToast('Товар успешно выставлен! 🌿');
        setTimeout(() => setToast(null), 3500);
        loadAds();
      } else {
        alert('Сбой при публикации.');
      }
    } catch (err) {
      alert('Нет связи с сервером.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="eco-wrapper">
      {toast && <div className="eco-toast">{toast}</div>}

      <div className="eco-layout">
        
        {/* Левая колонка: Сайдбар с формой */}
        <aside className="eco-sidebar">
          <div className="brand-logo">
            <span className="leaf-icon">🌿</span> INAI EcoMarket
          </div>
          
          <div className="form-container">
            <h3>Разместить товар</h3>
            <form onSubmit={publishAd} className="vertical-form">
              
              <div className="input-block">
                <label>Название</label>
                <input
                  type="text"
                  placeholder="Что продаешь?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-block">
                <label>Описание</label>
                <textarea
                  placeholder="Детали и состояние..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div className="input-block">
                <label>Цена (сом)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="input-block">
                <label>Фото товара</label>
                {preview ? (
                  <div className="image-box">
                    <img src={preview} alt="Выбрано" />
                    <button type="button" onClick={clearSelection} className="del-btn">Удалить</button>
                  </div>
                ) : (
                  <label className="upload-box">
                    <span>Выбрать фото</span>
                    <input type="file" accept="image/*" onChange={handleImage} hidden />
                  </label>
                )}
              </div>

              <button type="submit" className="mint-btn" disabled={isSending}>
                {isSending ? 'Загрузка...' : 'Опубликовать'}
              </button>
            </form>
          </div>
        </aside>

        {/* Правая колонка: Лента */}
        <main className="eco-main">
          <header className="main-header">
            <h2>Все объявления</h2>
            <div className="badge">Найдено: {ads.length}</div>
          </header>

          {loading ? (
            <div className="eco-grid">
              {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="eco-skeleton"></div>)}
            </div>
          ) : ads.length === 0 ? (
            <div className="eco-empty">Доска пока пуста.</div>
          ) : (
            <div className="eco-grid">
              {ads.map((ad) => (
                <div key={ad.id} className="eco-card">
                  <div className="card-thumb">
                    {ad.image_url ? (
                      <img src={`${API_BASE}${ad.image_url}`} alt={ad.title} loading="lazy" />
                    ) : (
                      <div className="no-thumb">Нет фото</div>
                    )}
                    <div className="price-pill">{Number(ad.price).toLocaleString()} ₸</div>
                  </div>
                  <div className="card-body">
                    <h4>{ad.title}</h4>
                    <p>{ad.description}</p>
                    <span className="tiny-id">ID: {ad.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
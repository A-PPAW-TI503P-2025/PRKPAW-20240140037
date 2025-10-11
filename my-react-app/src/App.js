import React, { useState } from 'react';
import './App.css';

function App() {
  const [nama, setNama] = useState('');
  const [pesan, setPesan] = useState('');

  
  const handleSubmit = (event) => {
    event.preventDefault();
    if (nama) {
      setPesan(`Hello, ${nama}!`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!pesan ? (
          <form onSubmit={handleSubmit}>
            <h1>Masukkan Nama Anda</h1>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Ketik nama di sini..."
              required
            />
            <button type="submit">Kirim</button>
          </form>
        ) : (
          <h1>{pesan}</h1>
        )}
      </header>
    </div>
  );
}

export default App;
import React from 'react';
import './App.css';
import WebcamFeed from './WebcamFeed';
import { BrowserRouter, Routes , Route } from 'react-router-dom';
import GlassesTryOn from './GlassesTryOn';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <BrowserRouter>
    <Routes>
    <Route path="glasses-frames" element={<GlassesTryOn />} />
    <Route path="contact-lens" element={<WebcamFeed />} />
    </Routes>
  </BrowserRouter>
        
      </header>
    </div>
  );
}

export default App;

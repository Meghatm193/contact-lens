import React from 'react';
import './App.css';
import { BrowserRouter, Routes , Route } from 'react-router-dom';
import WebcamFeed from './contact-lens/WebcamFeed';
import TryOnGlasses from './glasses-frames/TryOnGlasses';

import bgimg from './bgimg.jpg'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <BrowserRouter>
    <Routes>
    <Route path="glasses-frames" element={<TryOnGlasses />} />
    <Route path="contact-lens" element={<WebcamFeed />} />
    </Routes>
  </BrowserRouter>
        
      </header>
    </div>
  );
}

export default App;

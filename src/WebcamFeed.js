import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceMeshLib from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import lensImage1 from '../src/lens1.png';
import lensImage2 from '../src/lens2.png';
import lensImage3 from '../src/lens12.png';
import lensImage4 from '../src/lens13.png';
import lensImage5 from '../src/lens5.png';
import lensImage6 from '../src/lens6.png';
import lensImage7 from '../src/lens7.png';
import lensImage8 from '../src/lens8.png';
import lensImage9 from '../src/lens9.png';
import lensImage10 from '../src/lens10.png';
import lensImage11 from '../src/lens11.png';
import loadingSpinner from '../src/loading-spinner.gif'; // Import your loading spinner image

const WebcamFeed = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null); // Reference for face mesh instance
  const lensRefs = [useRef(new Image()), useRef(new Image()), useRef(new Image()), useRef(new Image()), useRef(new Image()), useRef(new Image()), useRef(new Image()), useRef(new Image()), useRef(new Image()), useRef(new Image()), useRef(new Image())];
  const [selectedLens, setSelectedLens] = useState(() => parseInt(localStorage.getItem('selectedLens')) || 0);
  const [eyesOpen, setEyesOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const lensImages = [lensImage1, lensImage2, lensImage3, lensImage4, lensImage5, lensImage6, lensImage7, lensImage8, lensImage9,lensImage10, lensImage11];

  useEffect(() => {
    const loadLensImages = async () => {
      await Promise.all(
        lensRefs.map((ref, index) => {
          ref.current.src = lensImages[index];
          return new Promise(resolve => (ref.current.onload = resolve));
        })
      );

      setLoading(true); // Set loading to false after all lens images are loaded
      startFaceMesh();
    };

    loadLensImages();
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedLens', selectedLens);
  }, [selectedLens]);

  useEffect(() => {
    const storedLens = localStorage.getItem("selectedLens");
    setSelectedLens(parseInt(storedLens) || 0);
  }, []);

  const startFaceMesh = () => {
    if (!webcamRef.current || !webcamRef.current.video) {
      console.error("Webcam or its video property is null");
      return;
    }

    const faceMesh = new faceMeshLib.FaceMesh({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    faceMesh.onResults(onResults);
    faceMeshRef.current = faceMesh; // Store face mesh instance in ref

    const camera = new cam.Camera(webcamRef.current.video, {
      onFrame: async () => {
        await faceMesh.send({ image: webcamRef.current.video });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  };

  const [lastResults, setLastResults] = useState(null);

  const onResults = results => {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
  
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
    if (results.multiFaceLandmarks) {
      const landmarks = results.multiFaceLandmarks[0];
      setEyesOpen(checkEyesOpen(landmarks)); // Update eye state
      drawContactLens(canvasCtx, landmarks);
    }
  
    // Store the latest results
    setLastResults(results);
  };
  

  const checkEyesOpen = (landmarks) => {
    // Ensure landmarks and the specific landmarks needed are available
    if (!landmarks || !landmarks[159] || !landmarks[145]) {
      console.error("Required landmarks not available.");
      return false;
    }
  
    // Add your logic to check if eyes are open based on landmark positions
    // For example, you can calculate the distance between certain landmarks to determine if eyes are open
  };

  const drawContactLens = (canvasCtx, landmarks) => {
    
    if (!landmarks || landmarks.length === 0 || selectedLens === null) {
      console.error('No landmarks available or selected lens is null.');
      return;
    }
  
    const leftEye = [landmarks[362], landmarks[385], landmarks[387], landmarks[263], landmarks[373], landmarks[380]];
    const rightEye = [landmarks[33], landmarks[160], landmarks[158], landmarks[133], landmarks[153], landmarks[144]];
  
    const drawLens = (eyeLandmarks, selectedLensRef) => {
      if (!eyeLandmarks || eyeLandmarks.length === 0 || !selectedLensRef || !selectedLensRef.current) {
        console.error('Eye landmarks or selected lens reference not available.');
        return;
      }
    
      // Calculate the center of the eye
      const eyeCenterX = ((eyeLandmarks[0].x + eyeLandmarks[3].x) / 2) * canvasRef.current.width + 8;
      const eyeCenterY = (eyeLandmarks[0].y * canvasRef.current.height + eyeLandmarks[3].y * canvasRef.current.height) / 2 - 4 ;
    
      // Calculate the width and height of the iris
      const irisWidth = Math.abs(eyeLandmarks[3].x - eyeLandmarks[0].x) * canvasRef.current.width * 1.8;
      const irisHeight = Math.abs(eyeLandmarks[5].y - eyeLandmarks[2].y) * canvasRef.current.height * 1.1;
      const irisSize = Math.min(irisWidth, irisHeight) * 1.6;
    
      // Set transparency level
      canvasCtx.globalAlpha = 0.2;
    
      canvasRef.current.style.filter = 'blur(2px)';
      // Draw the lens
      canvasCtx.drawImage(
        selectedLensRef.current,
        eyeCenterX - irisSize / 2 - irisSize * 0.1, // Adjust the position towards the inner corner
        eyeCenterY - irisSize / 2,
        irisSize,
        irisSize
      );
    
      // Reset transparency level and remove blur effect
      canvasCtx.globalAlpha = 1;
      canvasRef.current.style.filter = 'none';
    };
    
    
  
    const selectedLensRef = lensRefs[selectedLens];
    drawLens(leftEye, selectedLensRef);
    drawLens(rightEye, selectedLensRef);
  };

  const handleLensSelection = index => {
    window.location.reload();
    setSelectedLens(index);
    const canvasCtx = canvasRef.current.getContext('2d');
    // Access landmarks from the results object
    const landmarks = lastResults.multiFaceLandmarks[0];
    drawContactLens(canvasCtx, landmarks);
  };

  return (
    <div className="webcam-feed-container">
      <Webcam
        ref={webcamRef} hidden
        className="webcam-feed"
        videoConstraints={{
          width: 1920, // Increase webcam resolution
          height: 1080, // Increase webcam resolution
        }}
      />
      <canvas
        ref={canvasRef}
        className="overlay-canvas"
        width={1920} // Match webcam resolution
        height={1080} // Match webcam resolution
      />
      {loading && (
        <div className="loading-overlay">
          <img src={loadingSpinner} alt="Loading Spinner" />
        </div>
      )}
      <div className="lens-selection-container">
        {lensImages.map((image, index) => (
          <div 
            key={index}
            className={`lens-image-wrapper ${selectedLens === index ? 'selected' : ''}`}
            onClick={() => handleLensSelection(index)}
          >
            <img
              src={image}
              alt={`Lens ${index + 1}`}
              className="lens-image img-fluid"
            />
            {selectedLens === index && <div className="shadow-box"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebcamFeed;

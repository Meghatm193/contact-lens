import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceMeshLib from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import GlassesFrame1 from './glasses-frame-1.png'; // Import glasses frame images
import GlassesFrame2 from './glasses-frame-2.png';
// Import other glasses frame images as needed

const GlassesTryOn = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const [selectedFrame, setSelectedFrame] = useState(1); // Initial selected frame
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaceMesh = async () => {
      const faceMesh = new faceMeshLib.FaceMesh({
        locateFile: file =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(onFaceMeshResults);
      faceMeshRef.current = faceMesh;

      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();

      setLoading(false);
    };

    loadFaceMesh();
  }, []);

  const onFaceMeshResults = results => {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    if (results.multiFaceLandmarks) {
      // Process face landmarks to detect eyes
      const landmarks = results.multiFaceLandmarks[0];
      drawGlassesFrames(canvasCtx, landmarks);
    }
  };

  const drawGlassesFrames = (canvasCtx, landmarks) => {
    // Implement logic to position glasses frames over the eyes based on landmarks
    // Use selectedFrame state to determine which glasses frame to show
  };

  const handleFrameSelection = frameNumber => {
    setSelectedFrame(frameNumber);
  };

  return (
    <div className="glasses-try-on-container">
      {loading && <div className="loading-text">Loading...</div>}
      <Webcam
        ref={webcamRef}
        hidden
        className="webcam-feed"
        videoConstraints={{
          width: 1280,
          height: 720,
        }}
      />
      <canvas
        ref={canvasRef}
        className="overlay-canvas"
        width={1280}
        height={720}
      />
      <div className="frame-selection-container">
        <img
          src={GlassesFrame1}
          alt="Glasses Frame 1"
          onClick={() => handleFrameSelection(1)}
          className={`glasses-frame ${selectedFrame === 1 ? 'selected' : ''}`}
        />
        <img
          src={GlassesFrame2}
          alt="Glasses Frame 2"
          onClick={() => handleFrameSelection(2)}
          className={`glasses-frame ${selectedFrame === 2 ? 'selected' : ''}`}
        />
        {/* Add more images for additional glasses frames */}
      </div>
    </div>
  );
};

export default GlassesTryOn;

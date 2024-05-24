import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as mp from '@mediapipe/pose';
import glasses1 from '../src/glasses1.png'; // Make sure the path to your glasses image is correct

const TryOnGlasses = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedGlasses, setSelectedGlasses] = useState(null);
  const [glassesLoaded, setGlassesLoaded] = useState(false);
  const [glassesDimensions, setGlassesDimensions] = useState({ width: 0, height: 0 });
  const [pose, setPose] = useState(null);

  useEffect(() => {
    if (!selectedGlasses) return;

    const glassesImage = new Image();
    glassesImage.src = selectedGlasses;
    glassesImage.onload = () => {
      setGlassesDimensions({ width: glassesImage.width, height: glassesImage.height });
      setGlassesLoaded(true);
    };
  }, [selectedGlasses]);

  useEffect(() => {
    if (!pose) return;

    const runPoseDetection = async () => {
      pose.setOptions({
        upperBodyOnly: false,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      pose.onResults(handlePoseResults);

      if (webcamRef.current && webcamRef.current.video) {
        pose.send({ image: webcamRef.current.video });
      }
    };

    runPoseDetection();

    return () => {
      if (pose) {
        pose.close();
      }
    };
  }, [pose]);

  const handlePoseResults = (results) => {
    if (!results.poseLandmarks) return;

    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    results.poseLandmarks.forEach((landmark) => {
      const x = landmark.x * context.canvas.width;
      const y = landmark.y * context.canvas.height;
      context.beginPath();
      context.arc(x, y, 5, 0, 2 * Math.PI);
      context.fillStyle = 'red';
      context.fill();
    });

    if (selectedGlasses && glassesLoaded) {
      // Calculate glasses position and size based on detected landmarks
      const glassesX = results.poseLandmarks[0].x * context.canvas.width;
      const glassesY = results.poseLandmarks[0].y * context.canvas.height - glassesDimensions.height * 0.5;
      const glassesWidth = glassesDimensions.width;
      const glassesHeight = glassesDimensions.height;

      // Draw glasses
      const glassesImage = new Image();
      glassesImage.src = selectedGlasses;
      glassesImage.onload = () => {
        context.drawImage(glassesImage, glassesX, glassesY, glassesWidth, glassesHeight);
      };
    }
  };

  const handleGlassesSelection = (glassesUrl) => {
    setSelectedGlasses(glassesUrl);
  };

  return (
    <div>
      <Webcam
        audio={false}
        height={480}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={640}
      />
      <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div>
        {/* Render glasses selection buttons/dropdown here */}
        <button onClick={() => handleGlassesSelection(glasses1)}>
          Try On Glasses
        </button>
        {/* Add more buttons for different glasses options if needed */}
      </div>
    </div>
  );
};

export default TryOnGlasses;

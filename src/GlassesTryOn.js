import React, { useRef, useEffect, useState } from 'react';
import { FaceDetection } from '@mediapipe/face_detection';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import Webcam from 'react-webcam';
import './GlassesTryOn.css'; // Import CSS for styling the glasses overlay

const GlassesTryOn = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetection, setFaceDetection] = useState(null);

  useEffect(() => {
    const faceDetection = new FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}` });
    faceDetection.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
    });
    setFaceDetection(faceDetection);

    return () => {
      faceDetection.close();
    };
  }, []);

  const detectFace = async () => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;
    const video = webcam.video;
    const context = canvas.getContext('2d');

    canvas.width = webcam.video.videoWidth;
    canvas.height = webcam.video.videoHeight;

    const result = await faceDetection.send({ image: video });

    if (result.detections.length > 0) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const landmarks = result.detections[0].landmarks;

      const leftEyeLandmarks = landmarks.slice(36, 42);
      const rightEyeLandmarks = landmarks.slice(42, 48);

      const leftEyePosition = calculateEyePosition(leftEyeLandmarks);
      const rightEyePosition = calculateEyePosition(rightEyeLandmarks);

      overlayGlasses(context, leftEyePosition, rightEyePosition);
    }

    requestAnimationFrame(detectFace);
  };

  const calculateEyePosition = (eyeLandmarks) => {
    // Calculate the midpoint of the eye landmarks
    const x = eyeLandmarks.reduce((acc, curr) => acc + curr.x, 0) / eyeLandmarks.length;
    const y = eyeLandmarks.reduce((acc, curr) => acc + curr.y, 0) / eyeLandmarks.length;
    return { x, y };
  };

  const overlayGlasses = (context, leftEyePosition, rightEyePosition) => {
    const glassesWidth = 200; 
    const glassesHeight = 60; 
    const glassesImg = new Image();
    glassesImg.src = 'src/glasses1.png'; 
   console.log("glassesImg.src",glassesImg.src);
    glassesImg.onload = function () {
      context.drawImage(glassesImg, leftEyePosition.x - glassesWidth * 0.25, leftEyePosition.y - glassesHeight * 0.5, glassesWidth, glassesHeight);
      context.drawImage(glassesImg, rightEyePosition.x - glassesWidth * 0.75, rightEyePosition.y - glassesHeight * 0.5, glassesWidth, glassesHeight);
    };
  };

  useEffect(() => {
    if (webcamRef.current && faceDetection) {
      detectFace();
    }
  }, [webcamRef.current, faceDetection]);

  return (
    <div className="eye-glasses-detector">
      <Webcam
        ref={webcamRef}
        audio={false}
        width={640}
        height={480}
        screenshotFormat="image/jpeg"
        className="webcam"
      />
      <canvas ref={canvasRef} className="canvas" />
    </div>
  );
};

export default GlassesTryOn;

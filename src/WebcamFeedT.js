import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceMeshLib from '@mediapipe/face_mesh'; // Renamed the import to avoid conflict
import * as cam from '@mediapipe/camera_utils';

const WebcamFeedT = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);

  useEffect(() => {
    const runFaceMesh = async () => {
      // Load MediaPipe Face Mesh model
      const faceMesh = new faceMeshLib.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      // Set options for the face mesh model
      faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Configure webcam
      const videoElement = webcamRef.current.video;
      const camera = new cam.Camera(videoElement, {
        onFrame: async () => {
          await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480,
      });

      // Start capturing video
      camera.start();

      // Initialize face mesh
      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;
    };

    runFaceMesh();
  }, []);

  const onResults = (results) => {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    if (!results.multiFaceLandmarks) return;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    for (const landmarks of results.multiFaceLandmarks) {
      drawLandmarks(canvasCtx, landmarks);
    }
  };

  const drawLandmarks = (canvasCtx, landmarks) => {
    canvasCtx.fillStyle = '#FF0000';
    canvasCtx.strokeStyle = '#00FF00';
    canvasCtx.lineWidth = 2;

    // Draw facial landmarks
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i][0];
      const y = landmarks[i][1];

      canvasCtx.beginPath();
      canvasCtx.arc(x, y, 2, 0, 2 * Math.PI);
      canvasCtx.fill();
    }

    // Draw iris landmarks
    if (landmarks[468] && landmarks[473]) {
      canvasCtx.fillStyle = '#FFFF00';
      canvasCtx.beginPath();
      canvasCtx.arc(landmarks[468][0], landmarks[468][1], 2, 0, 2 * Math.PI);
      canvasCtx.fill();

      canvasCtx.beginPath();
      canvasCtx.arc(landmarks[473][0], landmarks[473][1], 2, 0, 2 * Math.PI);
      canvasCtx.fill();
    }
  };

  return (
    <div>
      <Webcam ref={webcamRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', left: 0, top: 0 }} />
    </div>
  );
};

export default WebcamFeedT;

import React, { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as mp from '@mediapipe/pose';

const IrisDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const runIrisDetection = async () => {
      // Load TensorFlow.js model
      await tf.setBackend('webgl');
      await tfjsWasm.setWasmPaths('/tfjs-backend-wasm/');
      const model = await tf.loadGraphModel('/path/to/model.json');

      // Load MediaPipe model for iris detection
      const irisModel = await mp.load();

      // Access webcam
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          })
          .catch((err) => console.error('getUserMedia Error: ', err));
      }

      // Process video feed
      const detectIris = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const predictions = await irisModel.estimatePoses(video);

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
          predictions.forEach((prediction) => {
            // Draw colored circle over detected iris
            const { x, y } = prediction.keypoints[0].position;
            const radius = 10;
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI, false);
            context.fillStyle = 'red'; // Change color as needed
            context.fill();
          });
        }

        requestAnimationFrame(detectIris);
      };

      detectIris();
    };

    runIrisDetection();
  }, []);

  return (
    <div>
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
    </div>
  );
};

export default IrisDetector;

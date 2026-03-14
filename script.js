// -------------------- TIMER LOGIC --------------------
let seconds = 0;
let timer;
let running = false;

function updateTimer(){
  seconds++;
  let min = Math.floor(seconds/60);
  let sec = seconds % 60;
  document.getElementById("timer").innerText = min + ":" + (sec<10?"0":"") + sec;
}

document.getElementById("startBtn").onclick = function(){
  if(!running){
    seconds = 0;
    running = true;
    timer = setInterval(updateTimer,1000);
    startRandomEvent();
  }
}

document.getElementById("stopBtn").onclick = function(){
  clearInterval(timer);
  running=false;
  alert("Your time: "+seconds+" seconds");
}

// -------------------- RANDOM EVENT --------------------
function startRandomEvent(){
  // DEVELOPMENT MODE: event appears after 10 seconds
  setTimeout(showEvent,10000);
}

function showEvent(){
  let box = document.getElementById("eventBox");
  box.classList.remove("hidden");

  let clicked = false;

  document.getElementById("tapBtn").onclick = function(){
    clicked = true;
    box.classList.add("hidden");
    startRandomEvent(); // schedule next event
  }

  setTimeout(function(){
    if(!clicked){
      alert("You failed the event!");
      clearInterval(timer);
      running=false;
    }
    box.classList.add("hidden");
  },5000);
}

// -------------------- MEDIA PIPE CAMERA & POSE --------------------
const videoElement = document.getElementById('camera');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(onResults);

function onResults(results) {
  // Clear canvas
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw video frame
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);

  // Draw pose landmarks
  if(results.poseLandmarks){
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                   {color:'#00FF00', lineWidth:4});
    drawLandmarks(canvasCtx, results.poseLandmarks,
                  {color:'#FF0000', lineWidth:2});
  }

  canvasCtx.restore();
}

// Initialize camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({image: videoElement});
  },
  width: 640,
  height: 480
});
camera.start();

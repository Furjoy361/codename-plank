let seconds = 0;
let timer;
let running = false;

const video = document.getElementById('camera');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 480;

let pose, camera;

// Draw pose results
function onResults(results){
  ctx.save();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(results.image,0,0,canvas.width,canvas.height);

  if(results.poseLandmarks){
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color:'#00FF00', lineWidth:4});
    drawLandmarks(ctx, results.poseLandmarks, {color:'#FF0000', lineWidth:2});
  }
  ctx.restore();
}

// Initialize MediaPipe Pose
function initPose(){
  pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  pose.onResults(onResults);
}

// Start camera (after user clicks START)
function startCamera(){
  camera = new Camera(video, {
    onFrame: async () => await pose.send({image: video}),
    width: 640,
    height: 480
  });
  camera.start();
}

// -------------------- TIMER --------------------
function updateTimer(){
  seconds++;
  let min = Math.floor(seconds/60);
  let sec = seconds%60;
  document.getElementById('timer').innerText = min + ":" + (sec<10?"0":"")+sec;
}

document.getElementById('startBtn').onclick = function(){
  if(!running){
    seconds = 0;
    running = true;
    initPose();
    startCamera();
    timer = setInterval(updateTimer,1000);
    startRandomEvent();
  }
}

document.getElementById('stopBtn').onclick = function(){
  clearInterval(timer);
  running=false;
  alert("Your time: "+seconds+" seconds");
}

// -------------------- RANDOM EVENT --------------------
function startRandomEvent(){
  setTimeout(showEvent,10000);
}

function showEvent(){
  const box = document.getElementById('eventBox');
  box.classList.remove('hidden');

  let clicked = false;
  document.getElementById('tapBtn').onclick = function(){
    clicked = true;
    box.classList.add('hidden');
    startRandomEvent();
  }

  setTimeout(function(){
    if(!clicked){
      alert("You failed the event!");
      clearInterval(timer);
      running=false;
    }
    box.classList.add('hidden');
  },5000);
}

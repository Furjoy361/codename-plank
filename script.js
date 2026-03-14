let seconds = 0;
let timer;
let running = false;

const video = document.getElementById('camera');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 480;

let pose, camera;

// -------------------- HELPER FUNCTION: CALCULATE ANGLE --------------------
function calculateAngle(A, B, C){
  // A, B, C = {x, y}
  const AB = {x: B.x - A.x, y: B.y - A.y};
  const CB = {x: B.x - C.x, y: B.y - C.y};
  const dot = AB.x*CB.x + AB.y*CB.y;
  const magAB = Math.sqrt(AB.x*AB.x + AB.y*AB.y);
  const magCB = Math.sqrt(CB.x*CB.x + CB.y*CB.y);
  const angleRad = Math.acos(dot/(magAB*magCB));
  return angleRad * (180/Math.PI); // convert to degrees
}

// -------------------- TIMER --------------------
function updateTimer(){
  seconds++;
  let min = Math.floor(seconds/60);
  let sec = seconds%60;
  document.getElementById('timer').innerText = min + ":" + (sec<10?"0":"")+sec;
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

// -------------------- MEDIA PIPE --------------------
function onResults(results){
  ctx.save();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(results.image,0,0,canvas.width,canvas.height);

  if(results.poseLandmarks){
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color:'#00FF00', lineWidth:4});
    drawLandmarks(ctx, results.poseLandmarks, {color:'#FF0000', lineWidth:2});

    // -------------------- PLANK POSTURE CHECK --------------------
    const leftShoulder = results.poseLandmarks[11];
    const rightShoulder = results.poseLandmarks[12];
    const leftHip = results.poseLandmarks[23];
    const rightHip = results.poseLandmarks[24];
    const leftKnee = results.poseLandmarks[25];
    const rightKnee = results.poseLandmarks[26];

    const shoulder = {x: (leftShoulder.x+rightShoulder.x)/2, y: (leftShoulder.y+rightShoulder.y)/2};
    const hip = {x: (leftHip.x+rightHip.x)/2, y: (leftHip.y+rightHip.y)/2};
    const knee = {x: (leftKnee.x+rightKnee.x)/2, y: (leftKnee.y+rightKnee.y)/2};

    const angle = calculateAngle(shoulder, hip, knee);

    // Check angle thresholds for bad plank
    if(angle < 160 || angle > 200){
      if(running){
        clearInterval(timer);
        running = false;
        alert("Plank form incorrect! Keep your back straight.");
      }
    }
  }
  ctx.restore();
}

// -------------------- START BUTTON --------------------
document.getElementById('startBtn').onclick = async function(){
  if(running) return;
  running = true;
  seconds = 0;
  timer = setInterval(updateTimer,1000);
  startRandomEvent();

  pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  pose.onResults(onResults);

  try {
    camera = new Camera(video, {
      onFrame: async () => await pose.send({image: video}),
      width: 640,
      height: 480
    });
    await camera.start();
  } catch(e){
    alert("Camera not allowed or not found!");
    running = false;
    clearInterval(timer);
  }
};

document.getElementById('stopBtn').onclick = function(){
  clearInterval(timer);
  running=false;
  alert("Your time: "+seconds+" seconds");
};

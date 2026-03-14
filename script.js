let squatStage = null; // "down" or "up"
let reps = 0;

const video = document.getElementById('camera');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 480;

let pose, camera;

// -------------------- HELPER: CALCULATE ANGLE --------------------
function calculateAngle(A, B, C){
  const AB = {x: B.x - A.x, y: B.y - A.y};
  const CB = {x: B.x - C.x, y: B.y - C.y};
  const dot = AB.x*CB.x + AB.y*CB.y;
  const magAB = Math.sqrt(AB.x*AB.x + AB.y*AB.y);
  const magCB = Math.sqrt(CB.x*CB.x + CB.y*CB.y);
  const angleRad = Math.acos(dot/(magAB*magCB));
  return angleRad * (180/Math.PI);
}

// -------------------- MEDIA PIPE & REP COUNTER --------------------
function onResults(results){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(results.image,0,0,canvas.width,canvas.height);

  if(results.poseLandmarks){
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color:'#00FF00', lineWidth:4});
    drawLandmarks(ctx, results.poseLandmarks, {color:'#FF0000', lineWidth:2});

    const leftHip = results.poseLandmarks[23];
    const rightHip = results.poseLandmarks[24];
    const leftKnee = results.poseLandmarks[25];
    const rightKnee = results.poseLandmarks[26];
    const leftAnkle = results.poseLandmarks[27];
    const rightAnkle = results.poseLandmarks[28];

    const hip = {x:(leftHip.x+rightHip.x)/2, y:(leftHip.y+rightHip.y)/2};
    const knee = {x:(leftKnee.x+rightKnee.x)/2, y:(leftKnee.y+rightKnee.y)/2};
    const ankle = {x:(leftAnkle.x+rightAnkle.x)/2, y:(leftAnkle.y+rightAnkle.y)/2};

    const kneeAngle = calculateAngle(hip, knee, ankle);

    // Squat logic: count up when full down->up
    if(kneeAngle < 100 && squatStage !== "down") squatStage = "down";
    if(kneeAngle > 150 && squatStage === "down"){
      squatStage = "up";
      reps++;
    }

    // Display reps
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Reps: " + reps, 20, 50);
  }
}

// -------------------- START BUTTON --------------------
document.getElementById('startBtn').onclick = async function(){
  if(pose) return; // already running

  pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  pose.onResults(onResults);

  camera = new Camera(video, {
    onFrame: async () => await pose.send({image: video}),
    width: 640,
    height: 480
  });
  camera.start();
};

document.getElementById('stopBtn').onclick = function(){
  if(camera) camera.stop();
  alert("You completed " + reps + " reps!");
};

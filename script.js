let seconds = 0;
let timer;
let running = false;

function updateTimer(){

seconds++;

let min = Math.floor(seconds/60);
let sec = seconds % 60;

document.getElementById("timer").innerText =
min + ":" + (sec<10?"0":"") + sec;

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

// schedule next event
startRandomEvent();

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
//Conencts to socket.io
var io = io.connect()

//x & y Gryoscope values
var x;
var y;

//Gyro limits
var gyroLimits = { left: -2, right: 2, forward: 3, backward: -3 }

//Serial Constants
var serial = { forwardLeft: 0, forward: 1, forwardRight: 2, backwardLeft: 3, backward: 4, bacwardRight: 5, stop: 6 }

//Event Key Codes for Up/Down/Left/Right Arrows
var keys = { up: 38, down: 40, left: 37,  right: 39 };
var lastDirectionKeyPressed;

//Web Socket Commands to be relayed to the serial connection
function move(direction) { io.emit('control', direction); }
function stop() {
	lastDirectionKeyPressed = null;
	move(serial.stop);
}

//Set up all event handlers
if(window.wiiu) setInterval(updateGamePadState, 20);
else {
	$("#top div, #bottom div").mousedown(mouseControl).mouseup(stop).mouseout(stop); //Mouse Event Listeners
	$(document).keydown(keyboardControl).keyup(stop).blur(stop); //Keyboard Event Listeners
}
// Triggered on mobile devices + Wii U Gamepad
window.ondevicemotion = driveWithMotion

//Event Handlers
//Drives cars with mouse. Uses the index of the divs
function mouseControl(e) { move($("#top div, #bottom div").index(this)) };

//Drives car with keyboard Up/Down/Left/Right arrows
function keyboardControl(e) {
	if(e.keyCode == keys.up) {
		lastDirectionKeyPressed = keys.up;
		move(serial.forward);
	} else if(e.keyCode == keys.down) {
		lastDirectionKeyPressed = keys.down;
		move(serial.backward);
	} else if(e.keyCode == keys.left) {
		if(lastDirectionKeyPressed == keys.up)		move(serial.forwardLeft);
		else if(lastDirectionKeyPressed == keys.down)	move(serial.backwardLeft);
	} else if(e.keyCode ==	keys.right) {
		if(lastDirectionKeyPressed == keys.up)		move(serial.forwardRight);
		else if(lastDirectionKeyPressed == keys.down)	move(serial.bacwardRight);
	}
}

//Drives car with motion
function driveWithMotion(event){
	//Update gyro values
	x = event.accelerationIncludingGravity.x;
	y = event.accelerationIncludingGravity.y;
	//For non-Wii U devices i.e. iOS
	if(!window.wiiu) {
		//Updating sensitivity for iOS
		gyroLimits.left = - 1;
		gyroLimits.right = 1;
		if(x < gyroLimits.left) {
			if(y > gyroLimits.forward)		move(serial.forwardLeft);
			else if(y < gyroLimits.backward)	move(serial.backwardLeft);
		} else if(x > gyroLimits.right) {
			if(y > forward)				move(serial.forwardRight);
			else if(y < gyroLimits.backward)	move(serial.bacwardRight);
		} else {
			if(y > gyroLimits.forward)		move(serial.forward);
			else if(y < gyroLimits.backward)	move(serial.backward);
			else stop();
		}
	}
}

//Drives with Wii U game pad at certian intervals
function updateGamePadState() {
	var state = window.wiiu.gamepad.update();
	if( !state.isEnabled || !state.isDataValid ){
		state = null;
		stop();
	} else {
		var plus = 0x00000008;
		var minus = 0x00000004;
		var buttonConst = 0x7f86fffc;
		if(state.hold & plus & buttonConst) {
			if(x < gyroLimits.left) 	move(serial.forwardLeft);
			else if(x > gyroLimits.right) 	move(serial.forwardRight);
			else														move(serial.forward);
		} else if(state.hold & minus & buttonConst) {
			if(x < gyroLimits.left) 	move(serial.backwardLeft);
			else if(x > gyroLimits.right) 	move(serial.bacwardRight);
			else														move(serial.backward);
		} else stop();
	}
}

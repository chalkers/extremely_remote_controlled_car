var io = io.connect()
var x;
var y;

//Gyro limits
var left = -2;
var right = 2;
var forward = 3;
var backward = -3;

//Constants
var forwardLeft = 0;
var dirForward = 1;
var forwardRight = 2;
var backwardLeft = 3;
var dirBackward = 4;
var bacwardRight = 5;

function move(direction) { io.emit('control', direction); }

function stop() { move(6) }

window.ondevicemotion = driveWithMotion

function driveWithMotion(event){
	x = event.accelerationIncludingGravity.x;
	y = event.accelerationIncludingGravity.y;
	if(!window.wiiu) {
		left = - 1;
		right = 1;
		if(x < left) {
			if(y > forward) {
				move(forwardLeft);
			} else if(y < backward) {
				move(backwardLeft);
			}
		} else if(x > right) {
			if(y > forward) {
				move(forwardRight);
			} else if(y < backward) {
				move(bacwardRight);
			}
		} else {
			if(y > forward) {
				move(dirForward);
			} else if(y < backward) {
				move(dirBackward);
			} else stop()
		}
	}
}

function updateGamePadState() {
	var state = window.wiiu.gamepad.update();
	  if( !state.isEnabled || !state.isDataValid ){
	    state = null;
	  } else {
			var plus = 0x00000008
			var minus = 0x00000004
			if(state.hold & plus & 0x7f86fffc) {
				if(x < left) {
					move(forwardLeft)
				} else if(x > right) {
					move(forwardRight)
				} else {
					move(dirForward);
				}
			} else if(state.hold & minus & 0x7f86fffc) {
				if(x < left) {
					move(backwardLeft)
				} else if(x > right) {
					move(bacwardRight);
				} else {
					move(dirBackward);
				}
			} else {
				stop();
			}
		}
}

if(window.wiiu) {
	setInterval(updateGamePadState, 20);
} else {
	$("#top div, #bottom div").mouseover(function(){
		move($("#top div, #bottom div").index(this));
	}).mouseout(stop);		
}

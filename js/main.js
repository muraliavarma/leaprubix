var BUFFER_SIZE = 60;
var frameQueue = [];
var gestureQueue = [];
onLoad = function() {
	Leap.loop(function(frame) {
		if(frame.hands.length > 0) {
			identifyGesture(frame);
		}
		else {
			//reset the gesture queue to empty so that we can start filling the queue when we find a new potential gesture
			gestureQueue = [];
		}
	});
}

function identifyGesture(data) {
	var gesture = {};
	var hand = data.hands[0];
	var frameId = data.id;
	frameQueue.push(data);
	if (frameQueue.length > BUFFER_SIZE) {
		frameQueue.shift();
	}
	if (hand.palmNormal.x < 0) {
		//then this is the right hand
		gesture.hand = 'right';
	}
	else {
		//left hand
		gesture.hand = 'left';
	}
	var zTrans = hand.translation(frameQueue[0]).z;
	if (zTrans < 0) {
		gesture.z = 'away';
		gesture.val = -zTrans;
	}
	else {
		gesture.z = 'towards';
		gesture.val = zTrans;
	}
	gestureQueue.push(gesture);
	if (gestureQueue.length > 50) {
		var ctr = 0;
		for (var i = 0; i < gestureQueue.length; i++) {
			if (gesture.hand == gestureQueue[i].hand && gesture.z == gestureQueue[i].z) {
				ctr ++;
			}
		}
		if (ctr > 30) {
			//a good chunk of the previous set of frames match with the current gesture, it is reasonably safe to assume the gesture is valid
			console.log(gesture);
			//reset the gesture queue
			gestureQueue = [];
		}
	}
}
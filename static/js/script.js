import {FilesetResolver, HandLandmarker} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@latest";

let handLandmarker = undefined;
let running_mode = "VIDEO";  // "VIDEO" for streaming video from webcam.
const [videoWidth, videoHeight] = ["300px", "225px"];
let num_hands = 4;  // Maximum number of hands to detect.
let flip_handedness = true;  // Flip handedness for front-facing camera.
let delay = 1000;  // Minimum number of milliseconds between screen updates.
let last_time = 0;  // Timestamp of last screen update.
const right_hand_landmarks_color = "#65d1f9";
const right_hand_connectors_color = "white";
const left_hand_landmarks_color = "#f9a165";
const left_hand_connectors_color = "white";
let carousel = bootstrap.Carousel.getOrCreateInstance("#carousel");
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

const touchless_control_webcam = document.getElementById("touchless-control-webcam");
let enableWebcamButton;
let webcamRunning = false;
// Before we can use HandLandmarker class, we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-tasks/hand_landmarker/hand_landmarker.task`,
        }, runningMode: running_mode, numHands: num_hands,
    });
    // need edit.
    touchless_control_webcam.classList.remove("invisible");
    // end edit.
};
createHandLandmarker();
// Check if webcam access is supported.
const hasGetUserMedia = () => {
    let _a;
    return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia);
};
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    } else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }
    // getUsermedia parameters.
    const constraints = {video: true};
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}

// Create a function to flip the handedness of the detected hand.
function reverse_handedness(handedness) {
    if (handedness === "Right") {
        handedness = "Left";
    } else {
        handedness = "Right";
    }
    return handedness;
}

// Select the color of the hand landmarks and hand connections based on the handedness.
function select_color(handedness) {
    if (handedness === "Right") {
        return [right_hand_landmarks_color, right_hand_connectors_color];
    } else {
        return [left_hand_landmarks_color, left_hand_connectors_color];
    }
}

function hand_gesture_recognizer(handedness, landmarks) {
    // if last_time + delay >= current_time then ignore the gesture
    if (last_time + delay >= performance.now()) {
        console.log("Gesture ignored");
        return;
    }

    let THUMB_TIP = landmarks[4];
    let MIDDLE_FINGER_TIP = landmarks[12];
    // y-axis is inverted in mediapipe, the higher the y value, the lower the point is on the screen.
    if (THUMB_TIP['y'] < MIDDLE_FINGER_TIP['y']) {
        if (handedness === "Right") {
            // waving right hand
            console.log("Move forward");
            carousel.next();  // move to the next slide
        }
        else if (handedness === "Left") {
            // waving left hand
            console.log("Move backward");
            carousel.prev();  // move to the previous slide
        }
        last_time = performance.now();
    }
}

// Continuously grab an image from webcam stream and detect it.
async function predictWebcam() {
    video.style.width = videoWidth;
    video.style.height = videoHeight;
    canvasElement.style.width = videoWidth;
    canvasElement.style.height = videoHeight;
    // show the video and canvas elements
    video.classList.remove("d-none");
    canvasElement.classList.remove("d-none");
    // Now let's start detecting the stream.
    let startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(video, startTimeMs);
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.landmarks) {
        // iterate through all detected hands
        for (let iteration = 0; iteration < results.landmarks.length; iteration++) {
            const landmarks = results.landmarks[iteration];
            let handedness = results.handednesses[iteration][0]['categoryName'];

            // flip the handedness if the camera is front-facing
            if (flip_handedness) {
                handedness = reverse_handedness(handedness);
            }
            // select the color of the hand landmarks and hand connections based on the handedness
            const [hand_landmarks_color, hand_connectors_color] = select_color(handedness);

            hand_gesture_recognizer(handedness, landmarks);

            // draw the hand landmarks and connectors on the canvas
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: hand_connectors_color,  // line color, default color #00FF00
                lineWidth: 5,
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: hand_landmarks_color,  // outer circle color, default color #FF0000
                lineWidth: 5, fillColor: hand_connectors_color,  // inner circle color
            });
        }
    }
    canvasCtx.restore();
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}

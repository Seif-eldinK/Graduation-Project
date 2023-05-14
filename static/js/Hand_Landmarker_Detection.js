import {FilesetResolver, HandLandmarker} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@latest";

let handLandmarker = undefined;
let running_mode = "VIDEO";  // "VIDEO" for streaming video from webcam.
const [video_width, video_height] = [1280, 720];
const [video_style_width, video_style_height] = ["300px", "225px"];
let num_hands = 4;  // Maximum number of hands to detect.
let selfie_mode = true;  // Flip handedness for front-facing camera.
let delay = 1000;  // Minimum number of milliseconds between screen updates.
let last_time = 0;  // Timestamp of last screen update.
const right_hand_landmarks_color = "#65d1f9";
const right_hand_connectors_color = "white";
const left_hand_landmarks_color = "#f9a165";
const left_hand_connectors_color = "white";

let carousel = bootstrap.Carousel.getOrCreateInstance("#carousel");
const touchless_control_webcam = document.getElementById("touchless-control-webcam");
let output_container = document.getElementById("output_container");
const video = document.getElementById("webcam");
const canvas = document.getElementById("output_canvas");
const canvas_context = canvas.getContext("2d");
const pointer_canvas = document.getElementById("pointer-canvas");
const pointer_canvas_context = pointer_canvas.getContext("2d");
const drawing_canvas = document.getElementById("drawing-canvas");
const drawing_canvas_context = drawing_canvas.getContext("2d");
video.width = canvas.width = video_width;
video.height = canvas.height = video_height;

video.style.width = canvas.style.width = video_style_width;
video.style.height = canvas.style.height = video_style_height;

const pointer_canvas_width = pointer_canvas.width =  pointer_canvas.getBoundingClientRect().width;
const pointer_canvas_height = pointer_canvas.height = pointer_canvas.getBoundingClientRect().height;
const drawing_canvas_width = drawing_canvas.width = drawing_canvas.getBoundingClientRect().width;
const drawing_canvas_height = drawing_canvas.height = drawing_canvas.getBoundingClientRect().height;

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
let video_stream = hasGetUserMedia();
if (video_stream) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", toggle_webcam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}


// Enable the live webcam view and start detection.
function toggle_webcam(event) {
    if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";

        // hide the output container that contains the video and canvas elements
        output_container.hidden = true;

        window.requestAnimationFrame(() => {
            // stop webcam stream
            video.srcObject.getTracks().forEach(track => {
                    track.stop();
                }
            );
        });
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";

        // getUsermedia parameters to force video but not audio.
        const constraints = {video: true};
        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            video.srcObject = stream;
            video.addEventListener("loadeddata", async () => {
                // show the output container once the webcam is streaming.
                output_container.hidden = false;

                await predictWebcam();
            });
        });
    }
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
    let INDEX_FINGER_TIP = landmarks[8];
    let MIDDLE_FINGER_TIP = landmarks[12];

    // y-axis is inverted in mediapipe, the higher the y value, the lower the point is on the screen.
    if (THUMB_TIP['y'] < MIDDLE_FINGER_TIP['y'] && THUMB_TIP['y'] < INDEX_FINGER_TIP['y']) {
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


function pointer(handedness, landmarks) {
    let INDEX_FINGER_TIP = landmarks[8];
    // get the x and y coordinates of the INDEX_FINGER_TIP landmark
    let x = INDEX_FINGER_TIP['x'] * pointer_canvas_width;
    let y = INDEX_FINGER_TIP['y'] * pointer_canvas_height;

    // invert the x-axis if selfie mode is enabled
    if (selfie_mode) {
        x = pointer_canvas_width - x;
    }

    // draw a circle at the INDEX_FINGER_TIP landmark
    // clear the canvas first
    pointer_canvas_context.clearRect(0, 0, pointer_canvas_width, pointer_canvas_height);

    // draw the outer circle
    pointer_canvas_context.beginPath();
    pointer_canvas_context.arc(x, y, 5, 0, 2 * Math.PI);
    pointer_canvas_context.fillStyle = "red";
    pointer_canvas_context.fill();
    pointer_canvas_context.closePath();

    // draw the inner circle
    pointer_canvas_context.beginPath();
    pointer_canvas_context.arc(x, y, 3, 0, 2 * Math.PI);
    pointer_canvas_context.fillStyle = "rgb(255, 150, 150)";
    pointer_canvas_context.fill();
    pointer_canvas_context.closePath();

    // draw a shadow around the circle
    pointer_canvas_context.beginPath();
    pointer_canvas_context.arc(x, y, 7, 0, 2 * Math.PI);
    pointer_canvas_context.shadowColor = "rgba(255, 0, 0, 1)";
    pointer_canvas_context.shadowBlur = 10;
    pointer_canvas_context.closePath();
}


function drawing(handedness, landmarks) {
    let THUMB_TIP = landmarks[4];
    // INDEX_FINGER
    let INDEX_FINGER_MCP = landmarks[5];
    let INDEX_FINGER_TIP = landmarks[8];
    // MIDDLE_FINGER
    let MIDDLE_FINGER_PIP = landmarks[10];
    let MIDDLE_FINGER_TIP = landmarks[12];

    // check if INDEX_FINGER is pointing down
    if (INDEX_FINGER_TIP['y'] > INDEX_FINGER_MCP['y']) {
        return;
    }
    // check if MIDDLE_FINGER is pointing down
    if (MIDDLE_FINGER_TIP['y'] > MIDDLE_FINGER_PIP['y']) {
        return;
    }

    // get the x and y coordinates of the INDEX_FINGER_TIP and MIDDLE_FINGER_TIP landmarks
    let INDEX_FINGER_TIP_x = INDEX_FINGER_TIP['x'] * drawing_canvas_width;
    let INDEX_FINGER_TIP_y = INDEX_FINGER_TIP['y'] * drawing_canvas_height;

    // invert the x-axis if selfie mode is enabled
    if (selfie_mode) {
        INDEX_FINGER_TIP_x = drawing_canvas_width - INDEX_FINGER_TIP_x;
    }

    // y-axis is inverted in mediapipe, the higher the y value, the lower the point is on the screen.
    if (THUMB_TIP['y'] > MIDDLE_FINGER_TIP['y'] && THUMB_TIP['y'] > INDEX_FINGER_TIP['y']) {

        // draw a circle at the INDEX_FINGER_TIP landmark
        drawing_canvas_context.fillStyle = "blue";
        drawing_canvas_context.fillRect(INDEX_FINGER_TIP_x, INDEX_FINGER_TIP_y, 25, 8);
    }
}


function eraser(handedness, landmarks) {
    let THUMB_TIP = landmarks[4];
    // INDEX_FINGER
    let INDEX_FINGER_MCP = landmarks[5];
    let INDEX_FINGER_TIP = landmarks[8];
    // MIDDLE_FINGER
    let MIDDLE_FINGER_PIP = landmarks[10];
    let MIDDLE_FINGER_TIP = landmarks[12];
    // RING_FINGER
    let RING_FINGER_PIP = landmarks[14];
    let RING_FINGER_TIP = landmarks[16];

    // check if INDEX_FINGER is pointing down
    if (INDEX_FINGER_TIP['y'] > INDEX_FINGER_MCP['y']) {
        return;
    }
    // check if MIDDLE_FINGER is pointing down
    if (MIDDLE_FINGER_TIP['y'] > MIDDLE_FINGER_PIP['y']) {
        return;
    }
    // check if RING_FINGER is pointing down
    if (RING_FINGER_TIP['y'] > RING_FINGER_PIP['y']) {
        return;
    }

    // clear the canvas if INDEX_FINGER_TIP, MIDDLE_FINGER_TIP, and RING_FINGER_TIP are all below THUMB_TIP
    if (THUMB_TIP['y'] > INDEX_FINGER_TIP['y'] && THUMB_TIP['y'] > MIDDLE_FINGER_TIP['y'] &&
        THUMB_TIP['y'] > RING_FINGER_TIP['y']) {
        drawing_canvas_context.clearRect(0, 0, drawing_canvas_width, drawing_canvas_height);
    }
}


// Continuously grab an image from webcam stream and detect it.
async function predictWebcam(){
    // Now let's start detecting the stream.
    let startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(video, startTimeMs);
    canvas_context.save();
    canvas_context.clearRect(0, 0, canvas.width, canvas.height);
    if (results.landmarks) {
        // iterate through all detected hands
        for (let iteration = 0; iteration < results.landmarks.length; iteration++) {
            const landmarks = results.landmarks[iteration];
            let handedness = results.handednesses[iteration][0]['categoryName'];

            // flip the handedness if the camera is front-facing
            if (selfie_mode) {
                handedness = reverse_handedness(handedness);
            }
            // select the color of the hand landmarks and hand connections based on the handedness
            const [hand_landmarks_color, hand_connectors_color] = select_color(handedness);

            hand_gesture_recognizer(handedness, landmarks);
            pointer(handedness, landmarks);
            drawing(handedness, landmarks);
            eraser(handedness, landmarks);

            // draw the hand landmarks and connectors on the canvas
            drawConnectors(canvas_context, landmarks, HAND_CONNECTIONS, {
                color: hand_connectors_color,  // line color, default color #00FF00
                lineWidth: 5,
            });
            drawLandmarks(canvas_context, landmarks, {
                color: hand_landmarks_color,  // outer circle color, default color #FF0000
                lineWidth: 5, fillColor: hand_connectors_color,  // inner circle color
            });
        }
    }
    canvas_context.restore();
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning){
        window.requestAnimationFrame(predictWebcam);
    }
}

const video = document.getElementById('video')

// function animate() {
//     requestAnimationFrame( animate );

//     mesh.rotation.x += 0.01;
//     mesh.rotation.y += 0.02;

//     renderer.render( scene, camera );
// }

function startVideo() {
    navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozkitGetUserMedia ||
        navigator.mskitGetUserMedia);
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.log(err)
    )
}

const MODELS_URL = '/models';
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL)
    // faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
    // faceapi.nets.ageGenderNet.loadFromUri(MODELS_URL),
    // faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL)   
    
]).then(startVideo)

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);    

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!detections) {
            return
        }
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        // console.log(detections.landmarks)

        ctx.beginPath();
        ctx.strokeStyle = "green";

        //Upper lips
        const upper_lips_points = [48,49,50,51,52,53,54,63,62,61,48]
        var initial_point = resizedDetections.landmarks.positions[48];
        ctx.moveTo( initial_point._x, initial_point._y)
        upper_lips_points.forEach(point => 
            ctx.lineTo(resizedDetections.landmarks.positions[point]._x, resizedDetections.landmarks.positions[point]._y)
            );
        ctx.fill();
        //Lower lips
        const lower_lips_points = [60,67,66,65,64,55,56,57,58,59,60]
        initial_point = resizedDetections.landmarks.positions[60];
        ctx.moveTo( initial_point._x, initial_point._y)
        lower_lips_points.forEach(point => 
            ctx.lineTo(resizedDetections.landmarks.positions[point]._x, resizedDetections.landmarks.positions[point]._y)
            );
        ctx.fillStyle = "#990000";
        ctx.fill();
        

        // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); 

    }, 50)
})

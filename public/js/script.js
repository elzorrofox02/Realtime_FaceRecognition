const elVideo = document.getElementById('video')
navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)
const loadCamera = () => {
    navigator.getMedia(
        {
            video: true,
            audio: false
        },
        stream => elVideo.srcObject = stream,
        console.error
    )
}

const model_url = "public/models"

Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(model_url),
    faceapi.nets.ageGenderNet.loadFromUri(model_url),
    faceapi.nets.faceExpressionNet.loadFromUri(model_url),
    faceapi.nets.faceLandmark68Net.loadFromUri(model_url),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(model_url),
    faceapi.nets.faceRecognitionNet.loadFromUri(model_url),
    faceapi.nets.ssdMobilenetv1.loadFromUri(model_url),
    faceapi.nets.tinyFaceDetector.loadFromUri(model_url),
]).then(loadCamera)

async function getLabeledFaceDescriptions() {
    const labels = ["leclerc", "hamilton"];
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 1; i++) {
          const img = await faceapi.fetchImage(`./public/labels/${label}/${i}.jpg`);         
          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
            let data = {"name":label,"descriptor":Array.from(detections.descriptor)}
            const response = await fetch("http://localhost:3000/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });     
          descriptions.push(detections.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
}

elVideo.addEventListener('play', async () => {
    const labeledFaceDescriptors = await getLabeledFaceDescriptions();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);  
    const canvas = faceapi.createCanvasFromMedia(elVideo)   
    document.body.append(canvas)   
    const displaySize = { width: elVideo.width, height: elVideo.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {       
        const detections = await faceapi.detectAllFaces(elVideo)
            .withFaceLandmarks()            
            .withFaceDescriptors()      
        const resizedDetections = faceapi.resizeResults(detections, displaySize)        
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)      
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)        
        const results = resizedDetections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor);
        });
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: result,
            });
            drawBox.draw(canvas);
          });
    })
})
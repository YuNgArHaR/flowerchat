let mediaRecorder;
let audioChunks = [];

function recordAudioMessage(event) {
  if (event.target && event.target.classList.contains("startVM")) {
    const startRecordBtn = document.getElementById("startRecordBtn");
    const stopRecordBtn = document.getElementById("cancelRecordBtn");
    const uploadBtn = document.getElementById("send-message-btn");
    const textfield = document.getElementById("message-input-txt");
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };

        mediaRecorder.start();
        textfield.disabled = true;
        startRecordBtn.style.display = "none";
        stopRecordBtn.style.display = "block";
        uploadBtn.style.display = "block";
      })
      .catch((error) => {
        console.error("ашипка при получении Майка", error);
      });
  }
}

function cancelRecording(event) {
  if (event.target && event.target.classList.contains("cancleVM")) {
    const startRecordBtn = document.getElementById("startRecordBtn");
    const stopRecordBtn = document.getElementById("cancelRecordBtn");
    const uploadBtn = document.getElementById("send-message-btn");
    const textfield = document.getElementById("message-input-txt");
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      audioChunks.splice(0, audioChunks.length);
    };
    startRecordBtn.style.display = "block";
    stopRecordBtn.style.display = "none";
    uploadBtn.style.display = "none";
    textfield.disabled = false;
  }
}

export { recordAudioMessage, cancelRecording, audioChunks, mediaRecorder };

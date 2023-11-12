import { auth, db, storage } from "./config.js";
import {
  query,
  orderBy,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  limit,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { audioChunks, mediaRecorder } from "./voiceMessage.js";
import { generateRandomString } from "./generateRandomString.js";
// import { showContextMenu, hideContextMenu } from "./contextMenu.js";
// import { openModal, closeModal } from "./modal.js";
import { openChat } from "./openChat.js";

let image = "";
let storageRef;

function changeRecordButtonToSend(event) {
  if (event.target && event.target.classList.contains("message-input-txt")) {
    let messageTextField = document.getElementById("message-input-txt");

    if (messageTextField.value.trim() !== "") {
      document.getElementById("send-message-btn").style.display = "block";
      document.getElementById("startRecordBtn").style.display = "none";
    } else {
      document.getElementById("send-message-btn").style.display = "none";
      document.getElementById("startRecordBtn").style.display = "block";
    }
  }
}

function handleImageInputChange(event) {
  let cancelImageBtn = document.getElementById("cancelImageBtn");
  let selectedFileName = document.getElementById("selectedFileName");
  if (event.target && event.target.classList.contains("imageInput")) {
    image = event.target.files[0];

    storageRef = ref(storage, `images/${image.name}`);

    if (image.name !== "") {
      selectedFileName.textContent = image.name;
      cancelImageBtn.style.display = "block";
      document.getElementById("send-message-btn").style.display = "block";
      document.getElementById("startRecordBtn").style.display = "none";
    } else {
      selectedFileName.textContent = "";
      cancelImageBtn.style.display = "none";
      document.getElementById("send-message-btn").style.display = "none";
      document.getElementById("startRecordBtn").style.display = "block";
    }
  }
}

function cancleImageSending(event) {
  if (event.target && event.target.classList.contains("cancleImage")) {
    let cancelImageBtn = document.getElementById("cancelImageBtn");
    selectedFileName.textContent = "";
    cancelImageBtn.style.display = "none";
    image = "";
  }
}

document.addEventListener("click", function (event) {
  if (event.target && event.target.classList.contains("send-message-btn")) {
    const receiverId = event.target.getAttribute("data-receiver");
    const senderId = event.target.getAttribute("data-sender");
    sendMessage(receiverId, senderId);
  }
});

async function sendMessage(receiverId, senderId) {
  const senderCollectionRef = collection(
    db,
    `users/${senderId}/chats/${receiverId}/messages`
  );
  const recevierCollectionRef = collection(
    db,
    `users/${receiverId}/chats/${senderId}/messages`
  );
  const last_message_sender = doc(db, `users/${senderId}/chats/${receiverId}`);
  const last_message_recevier = doc(
    db,
    `users/${receiverId}/chats/${senderId}`
  );
  let currentDate = new Date();
  let audioLink;
  let data = await new Promise(async (resolve, reject) => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();

      mediaRecorder.onstop = async () => {
        audioLink = await uploadAudio(audioChunks);
        if (audioLink) {
          console.log(audioLink);
          let dataWithAudio = {
            message: "",
            image: "",
            receiverId: receiverId,
            senderId: senderId,
            date: currentDate.toISOString(),
            audio: audioLink,
          };
          resolve(dataWithAudio);
        }
      };
    } else {
      let messageInput = document.getElementById("message-input-txt");
      let message = messageInput.value;

      if (message.trim() !== "" || image !== "") {
        document
          .getElementById("send-message-btn")
          .setAttribute("disabled", "true");

        if (image !== "") {
          console.log("there is no image");

          let imageLink = await uploadImage(image);
          if (imageLink) {
            console.log(imageLink);
            let dataWithImage = {
              message: message,
              image: imageLink,
              receiverId: receiverId,
              senderId: senderId,
              date: currentDate.toISOString(),
              audio: "",
            };
            document.getElementById("imageInput").value = "";
            document.getElementById("selectedFileName").textContent = "";
            image = "";
            storageRef = "";
            messageInput.value = "";
            resolve(dataWithImage);
          }
        } else {
          let dataMessage = {
            message: message,
            image: "",
            receiverId: receiverId,
            senderId: senderId,
            date: currentDate.toISOString(),
            audio: "",
          };
          messageInput.value = "";
          resolve(dataMessage);
        }
      }
    }
  });

  if (data) {
    console.log(data);
  }
  try {
    if (data) {
      getDoc(last_message_sender).then(async (docSnapshot) => {
        if (docSnapshot.exists()) {
          await updateDoc(last_message_sender, {
            date: data.date,
            last_message: data.message,
            senderId: data.senderId,
            file:
              data.image !== ""
                ? data.image
                : data.audio !== ""
                ? data.audio
                : "",
          });
          await updateDoc(last_message_recevier, {
            date: data.date,
            last_message: data.message,
            senderId: data.senderId,
            file:
              data.image !== ""
                ? data.image
                : data.audio !== ""
                ? data.audio
                : "",
          });
          await addDoc(senderCollectionRef, data);
          await addDoc(recevierCollectionRef, data);
        } else {
          await setDoc(last_message_sender, {
            date: data.date,
            last_message: data.message,
            senderId: data.senderId,
            file:
              data.image !== ""
                ? data.image
                : data.audio !== ""
                ? data.audio
                : "",
          });
          await setDoc(last_message_recevier, {
            date: data.date,
            last_message: data.message,
            senderId: data.senderId,
            file:
              data.image !== ""
                ? data.image
                : data.audio !== ""
                ? data.audio
                : "",
          });
          await addDoc(senderCollectionRef, data);
          await addDoc(recevierCollectionRef, data);
        }
      });

      console.log("sent!");
    }
    document.getElementById("send-message-btn").removeAttribute("disabled");
    document.getElementById("send-message-btn").style.display = "none";
    document.getElementById("startRecordBtn").style.display = "block";
    let cancelImageBtn = document.getElementById("cancelImageBtn");
    cancelImageBtn.style.display = "none";
  } catch (error) {
    console.error(`какаято там ошибка ${error}`);
    document.getElementById("send-message-btn").removeAttribute("disabled");
    document.getElementById("imageInput").value = "";
    image = "";
    storageRef = "";
  }
}

async function uploadAudio(audioChunks) {
  return new Promise(async (resolve, reject) => {
    const startRecordBtn = document.getElementById("startRecordBtn");
    const stopRecordBtn = document.getElementById("cancelRecordBtn");
    const uploadBtn = document.getElementById("send-message-btn");
    const textfield = document.getElementById("message-input-txt");
    startRecordBtn.style.display = "block";
    stopRecordBtn.style.display = "none";
    uploadBtn.style.display = "none";
    textfield.disabled = false;
    let audioName = generateRandomString(10);
    let audioMessageRef = ref(storage, `audio_message/${audioName}.wav`);

    let audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    try {
      let snapshot = await uploadBytes(audioMessageRef, audioBlob);
      audioChunks.splice(0, audioChunks.length);

      let audioLink = await getDownloadURL(snapshot.ref);
      console.log("audio sent");

      resolve(audioLink);
    } catch (error) {
      console.error(`error pri otpravke audio ${error}`);

      reject(error);
    }
  });
}

async function uploadImage(image) {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshot = await uploadBytes(storageRef, image);
      console.log("upload");

      const link = await getDownloadURL(snapshot.ref);

      resolve(link);
    } catch (error) {
      console.error(`error while uplading image ${error}`);
      document.getElementById("send-message-btn").removeAttribute("disabled");
      document.getElementById("imageInput").value = "";
      image = "";
      storageRef = "";
      reject(error);
    }
  });
}

export {
  sendMessage,
  handleImageInputChange,
  changeRecordButtonToSend,
  storageRef,
  image,
  cancleImageSending,
};

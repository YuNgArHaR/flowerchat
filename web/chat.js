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
// import { audioChunks, mediaRecorder } from "./voiceMessage.js";
// import { generateRandomString } from "./generateRandomString.js";
import { showContextMenu, hideContextMenu } from "./contextMenu.js";
// import { openModal, closeModal } from "./modal.js";
import { openChat } from "./openChat.js";
import { sendMessage } from "./sendMessage.js";

function getChatUi(status, friendName, friendImage, receiverId, senderId) {
    return `
    <div class="chat-header">
    <img class="chat-header__img" src="${friendImage}" alt="">
    <div class="chat-header__name-and-stat">
      <h1 class="chat-header__name-and-stat__name">${friendName}</h1>
      <h1 class="chat-header__name-and-stat__status">${status}</h1>
    </div>
    
  </div>
    <div id="container" class="panel__right__bg__container">
    </div>
    <span id="selectedFileName"></span>
    <button id="cancelImageBtn" class="cancleImage">❌</button>

    <div class="message-send">

      <label for="imageInput" style="cursor: pointer;">📌</label>
      <input type="file" class="message-send__button__file imageInput" id="imageInput" accept="image/*">
      
      <input class="message-send__write message-input-txt" type="text" id="message-input-txt" placeholder="Введите сообщение..."/>
      <button id="startRecordBtn" class="message-send__button startVM">🎤</button>
      <button id="cancelRecordBtn" class="message-send__button cancleVM">❌</button>
      <button class="message-send__button send-message-btn" id="send-message-btn" data-receiver="${receiverId}" data-sender="${senderId}">➤</button>
    </div>
    `;
}

export { getChatUi }
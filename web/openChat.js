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
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {
  getChatUi,
//   messageBlockText,
//   friendMessageBlockText,
} from "./chat.js";
import { loadChatHistory } from "./loadChatHistory.js";
import { handleImageInputChange, changeRecordButtonToSend, cancleImageSending } from "./sendMessage.js";
import { recordAudioMessage, cancelRecording } from "./voiceMessage.js";
// import { showContextMenu, hideContextMenu } from "./contextMenu.js";

function openChat(friendId, userId) {
    let friendDataRef = doc(db, `users/${friendId}`);
    onSnapshot(
        friendDataRef,
        (snapshot) => {
            if (snapshot.exists()) {
                let friendData = snapshot.data();
                let status = friendData.status;
                let friendName = friendData.username;
                let friendImage = friendData.pfp;
                let chat = document.getElementById("chat")
                chat.innerHTML = getChatUi(status, friendName, friendImage, friendId, userId);
                loadChatHistory(friendId, userId);
                document.addEventListener("change", handleImageInputChange);
                document.addEventListener("input", changeRecordButtonToSend);
                document.addEventListener("click", recordAudioMessage);
                document.addEventListener("click", cancelRecording);
                document.addEventListener("click", cancleImageSending);
            }
        },
        (error) => {
            console.log(`Ошибка при получении данных друга: ${error}`);
        }
    );
}

export { openChat };
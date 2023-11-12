import { auth, db } from "./config.js";
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
import { showContextMenu, hideContextMenu } from "./contextMenu.js";
import { deleteMessage } from "./deleteMessage.js";

function loadChatHistory(receiverId, senderId) {
  const messagesDiv = document.getElementById("container");

  const messagesCollectionRef = collection(
    db,
    `users/${senderId}/chats/${receiverId}/messages`
  );
  const sortedByDate = query(messagesCollectionRef, orderBy("date", "desc"));
  onSnapshot(sortedByDate, async (snapshot) => {
    messagesDiv.innerHTML = "";

    snapshot.forEach(async (messageDoc) => {
      const messageData = messageDoc.data();
      let time = messageData.date;
      let hours = new Date(time).getHours();
      let minutes = new Date(time).getMinutes();
      let formattedTime = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;

      const messageElement = document.createElement("div");

      if (messageData.senderId === auth.currentUser.uid) {
        messageElement.classList.add("message-your");
      } else {
        messageElement.classList.add("message-mate");
      }
      messageElement.addEventListener("contextmenu", (e) =>
        showContextMenu(e, messageElement, messageDoc.id)
      );
      //   if (messageData.forwardedFrom) {
      //     const forwardedText = document.createElement("p");
      //     forwardedText.classList.add("message-text");
      //     forwardedText.textContent = `Переслано от ${messageData.forwardedFrom}:`;
      //     forwardedText.style.fontWeight = "bold"; // Жирный шрифт
      //     forwardedText.style.userSelect = "none";
      //     messageElement.appendChild(forwardedText);
      //   }
      let messageSentTime = document.createElement("p");
      messageSentTime.classList.add("message-time");
      messageSentTime.textContent = formattedTime;

      if (messageData.audio) {
        const audioElement = document.createElement("audio");
        audioElement.controls = true;
        audioElement.src = messageData.audio;
        messageSentTime.style.color = "white";

        messageElement.appendChild(audioElement);
        messageElement.style.backgroundColor = "transparent";
      }
      if (messageData.image) {
        const imageElement = document.createElement("img");
        imageElement.classList.add("message-img");
        imageElement.src = messageData.image;

        messageElement.appendChild(imageElement);
      }
      if (messageData.message) {
        const textElement = document.createElement("p");
        textElement.classList.add("message-text");
        textElement.textContent = messageData.message;

        messageElement.appendChild(textElement);
      }
      messageElement.appendChild(messageSentTime);

      let contextMenuForMsg = document.createElement("div");
      contextMenuForMsg.innerHTML = getContextMenu(messageDoc.id);
      // let modalWin = document.createElement("div");
      // let usersList = await getUsersList(senderId);
      // modalWin.innerHTML = getModalWindow(messageDoc.id);
      messagesDiv.appendChild(contextMenuForMsg);
      //   messagesDiv.appendChild(modalWin);
      //   let forwardButton = document.getElementById(
      //     `forwardButton-${messageDoc.id}`
      //   );
      let deleteButton = document.getElementById(
        `deleteButton-${messageDoc.id}`
      );
      //   let closeModalButton = document.getElementById(
      //     `closeModalButton-${messageDoc.id}`
      //   );

      //   forwardButton.addEventListener("click", () =>
      //     openModal(messageDoc.id, usersList, senderId, receiverId)
      //   );
      if (deleteButton) {
        deleteButton.addEventListener("click", () =>
          deleteMessage(messageDoc.id, senderId, receiverId)
        );
      }
      //   closeModalButton.addEventListener("click", () =>
      //     closeModal(messageDoc.id)
      //   );
      document.addEventListener("click", () => hideContextMenu(messageDoc.id));
      messagesDiv.appendChild(messageElement);
    });
  });
}

// <button class="contextMenuButton forward" id="forwardButton-${messageId}">Переслать</button>

function getContextMenu(messageId) {
  return `
        <div class="contextMenu" id="contextMenu-${messageId}" class="hidden">
            <button class="contextMenuButton delete" id="deleteButton-${messageId}">Удалить</button>
        </div>
    `;
}

export { loadChatHistory };

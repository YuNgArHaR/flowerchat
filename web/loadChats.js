
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
import { showContextMenu, hideContextMenu } from "./contextMenu.js";
import { openChat } from "./openChat.js";

function loadChats(userID) {
  const chatsCollectionRef = collection(db, `users/${userID}/chats`);

  const sortedByDate = query(chatsCollectionRef, orderBy("date", "desc"));

  onSnapshot(sortedByDate, (snapshot) => {
    let i = 0;
    let maxDocs;
    let chatsParentDiv = document.getElementById("chat-el-location");
    let chatsDiv = document.getElementById("chats-history");
    let updatedChatsHistory = document.createElement("div");
    updatedChatsHistory.setAttribute("id", "chats-history");
    updatedChatsHistory.className = "panel__left__search__search__search";
    maxDocs = snapshot.docs.length;
    snapshot.forEach(async (chat) => {
      let chatData = chat.data();
      let friendPfp;
      let friendName;
      let friendsDataRef = doc(db, `users/${chat.id}`);
      await getDoc(friendsDataRef).then((friendDoc) => {
        let friendData = friendDoc.data();
        friendPfp = friendData.pfp;
        friendName = friendData.username;
      });
      let time = chatData.date;
      let hours = new Date(time).getHours();
      let minutes = new Date(time).getMinutes();
      let formattedTime = `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;
      const chatElement = document.createElement("div");
      chatElement.classList.add("user-card");

      const pfp = document.createElement("img");
      pfp.classList.add("user-card__img");
      pfp.src = friendPfp;

      chatElement.appendChild(pfp);

      const chatInfoElement = document.createElement("div");
      chatInfoElement.classList.add("user-card__name-message");

      const friendNameElement = document.createElement("h1");
      friendNameElement.classList.add("user-card__name-message__name");
      friendNameElement.textContent = friendName;

      const lastMessageTimeElement = document.createElement("h1");
      lastMessageTimeElement.classList.add("user-card__date");
      lastMessageTimeElement.textContent = formattedTime;

      const lastMessageElement = document.createElement("h1");
      lastMessageElement.classList.add("user-card__name-message__message");
      if (chatData.senderId === userID) {
        if (chatData.file !== "") {
          if (chatData.file.includes(".wav")) {
            lastMessageElement.innerHTML = "Вы: &#127925; Голосовое сообщение";
          } else if (chatData.file === "Пересланное сообщение") {
            lastMessageElement.innerHTML = "Вы: &#8618; Пересланное сообщение";
          } else {
            lastMessageElement.innerHTML = "Вы: 🖼️ Фотография";
          }
        } else {
          lastMessageElement.textContent = `Вы: ${chatData.last_message}`;
        }
      } else {
        if (chatData.file !== "") {
          if (chatData.file.includes(".wav")) {
            lastMessageElement.innerHTML = "&#127925; Голосовое сообщение";
          } else if (chatData.file === "Пересланное сообщение") {
            lastMessageElement.innerHTML = "&#8618; Пересланное сообщение";
          } else {
            lastMessageElement.innerHTML = "🖼️ Фотография";
          }
        } else {
          lastMessageElement.textContent = `${chatData.last_message}`;
        }
      }
      chatInfoElement.appendChild(friendNameElement);
      chatInfoElement.appendChild(lastMessageElement);

      chatElement.appendChild(chatInfoElement);
      chatElement.appendChild(lastMessageTimeElement);

      chatElement.addEventListener("click", () => openChat(chat.id, userID));

      updatedChatsHistory.appendChild(chatElement);
      i++;
      if (i === maxDocs) {
        chatsParentDiv.replaceChild(updatedChatsHistory, chatsDiv);
        chatsDiv.remove();
      }
    });
  });
}

export { loadChats }
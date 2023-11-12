import { db, auth } from "./config.js";
import {
  collection,
  query,
  where,
  and,
  or,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
// import { getChatUi, loadChatHistory, handleImageInputChange } from './chat.js';
import { openChat } from './openChat.js'

const searchButton = document.getElementById("search-btn");

const resultsList = document.getElementById("search-results");

searchButton.addEventListener("click", search);

document.addEventListener("click", function (e) {
  if (!resultsList.contains(e.target)) {
    resultsList.style.display = "none";
  }
});

async function search() {
  const searchInput = document.getElementById("query-text").value;

  if (searchInput.trim() !== "") {
    resultsList.innerHTML = "";

    const users = query(collection(db, "users"));

    try {
      let i = 0;
      const result = await getDocs(users);
      result.forEach((doc) => {
        const user = doc.data();
        const username = user.username.toLowerCase();
        resultsList.style.display = "block";
        if (
          auth.currentUser.uid != user.id &&
          (username === searchInput.toLowerCase() ||
            username.startsWith(searchInput.toLowerCase()))
        ) {
          i++;

          const listItem = document.createElement("div");
          listItem.className = "user-card";
          const imagePfp = document.createElement("img");
          imagePfp.className = "user-card__img";
          imagePfp.src = user.pfp;
          const nameAndStatusDiv = document.createElement("div");
          nameAndStatusDiv.className = "user-card__name-message";
          const friendName = document.createElement("h1");
          friendName.className = "user-card__name-message__name";
          friendName.textContent = user.username;
          const status = document.createElement("h1");
          status.className = "user-card__name-message__message";
          status.textContent = user.status;
          listItem.addEventListener("click", () =>
            openChat(user.id, auth.currentUser.uid)
          );
          nameAndStatusDiv.appendChild(friendName);
          nameAndStatusDiv.appendChild(status);
          listItem.appendChild(imagePfp);
          listItem.appendChild(nameAndStatusDiv);
          resultsList.appendChild(listItem);
        }
      });
      if (i === 0) {
        console.log("empty");
        const emptyText = document.createElement("h5");
        emptyText.textContent = `По запросу '${searchInput}' нет результатов`;
        resultsList.appendChild(emptyText);
      }
    } catch (error) {
      console.log(`error while getting users from db ${error}`);
    }
  } else {
    resultsList.style.display = "none";
  }
}

import { auth, db, storage } from "./config.js";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

const fileInput = document.getElementById("file-input");
const uploadButton = document.getElementById("upload-button");

uploadButton.addEventListener("click", function () {
  fileInput.click();
});

async function uploadImg(userId) {
  const file = fileInput.files[0];
  const storageRef = ref(storage, `images/${file.name}`);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    alert("Фото боновлено");

    const link = await getDownloadURL(snapshot.ref);
    const userDoc = doc(db, `users/${userId}`);
    try {
      await updateDoc(userDoc, { pfp: link });
      const pfp = document.getElementById("user-img");
      pfp.src = link;
    } catch (error) {
      alert(`error while uploading image 1: ${error}`);
    }
  } catch (error) {
    alert(`error while uploading image 2: ${error}`);
  }
}

export { uploadImg };

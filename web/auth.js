import { auth, db } from "./config.js";
import { uploadImg } from "./updatepfp.js";
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
import { loadChats } from "./loadChats.js";

const registerButton = document.getElementById("register-btn");
registerButton.addEventListener("click", register);

const loginButton = document.getElementById("login-btn");
loginButton.addEventListener("click", login);

const logoutButton = document.getElementById("logout-btn");
logoutButton.addEventListener("click", logout);

async function register() {
  let emailInput = document.getElementById("email");
  let pass = document.getElementById("pass");
  let usernameInput = document.getElementById("username");

  let email = emailInput.value;
  let password = pass.value;
  let username = usernameInput.value;

  let userCredential;

  try {
    userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
  } catch (error) {
    alert(`error while creating new user: ${error}`);
  }

  const data = {
    id: userCredential.user.uid,
    email: email,
    username: username,
    pfp: "https://firebasestorage.googleapis.com/v0/b/ch4t-e60c8.appspot.com/o/avatar.png?alt=media&token=5be0e341-6d30-4572-8145-dc6868eb44b1&_gl=1*148o1h2*_ga*ODQxNTEwODUzLjE2OTc0MDMwMzU.*_ga_CW55HF8NVT*MTY5Nzk4MTQ0OC4yLjEuMTY5Nzk4NzE5NS4zNC4wLjA.",
    status: "В сети",
  };

  const newUserDoc = doc(db, `users/${userCredential.user.uid}`);
  try {
    await setDoc(newUserDoc, data);
    emailInput.value = "";
    pass.value = "";
    usernameInput.value = "";
    alert(`new user: ${userCredential.user.email}`);
  } catch (error) {
    alert(`error while writing user data: ${error}`);
  }
}

async function login() {
  let emailInput = document.getElementById("login-email");
  let passInput = document.getElementById("login-pass");

  let email = emailInput.value;
  let pass = passInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    emailInput.value = "";
    passInput.value = "";
  } catch (error) {
    alert(`error while signing in: ${error}`);
  }
}


async function getUserData(userId) {
  try {
    const collectionRef = collection(db, "users");
    const docRef = doc(collectionRef, userId);
    if (document.visibilityState === "visible") {
      await updateDoc(docRef, { status: "В сети" });
    }
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    } else {
      console.log("user dosn't exist!");
    }
  } catch (error) {
    alert(`error while getting user data ${error}`);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user != null) {
    getUserData(user.uid).then((userData) => {
      console.log(`logged in`);
      document.getElementById("splash-screen").style.display = "none";
      document.getElementById("background").style.display = "block";
      document.getElementById("content").style.display = "block";
      document.getElementById("tab-container-id").style.display = "none";
      document.getElementById(
        "welcome"
      ).innerHTML = `Привет, ${userData.username}.`;
      loadChats(user.uid);
      const pfp = document.getElementById("user-img");
      pfp.src = userData.pfp;
      const fileInput = document.getElementById("file-input");
      fileInput.addEventListener("change", () => uploadImg(userData.id));
      document.addEventListener("visibilitychange", () =>
        changeStatus(user.uid)
      );
      window.addEventListener("beforeunload", () => changeStatus(user.uid));
    });
  } else {
    console.log(`no user`);
    document.getElementById("splash-screen").style.display = "none";
    document.getElementById("background").style.display = "block";
    document.getElementById("content").style.display = "none";
    document.getElementById("tab-container-id").style.display = "contents";
  }
});

async function logout() {
  await signOut(auth);
}

async function changeStatus(userId) {
  const collectionRef = collection(db, "users");
  const docRef = doc(collectionRef, userId);
  if (document.visibilityState === "visible") {
    try {
      await updateDoc(docRef, { status: "В сети" });
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      await updateDoc(docRef, { status: "Не в сети" });
    } catch (error) {
      console.log(error);
    }
  }
}

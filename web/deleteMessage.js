import { db } from "./config.js";
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



function deleteMessage(messageId, userId, chatId) {
    const messageToDelete = doc(
        db,
        `users/${userId}/chats/${chatId}/messages/${messageId}`
    );
    if (messageToDelete) {
        deleteDoc(messageToDelete).then(() => {
            const messagesCollectionRef = collection(
                db,
                `users/${userId}/chats/${chatId}/messages`
            );
            const sortedByDate = query(
                messagesCollectionRef,
                orderBy("date", "desc"),
                limit(1)
            );
            getDocs(sortedByDate).then((snapshot) => {
                if (!snapshot.empty) {
                    const last_message_sender = doc(
                        db,
                        `users/${userId}/chats/${chatId}`
                    );
                    const latestDocument = snapshot.docs[0];
                    const latestData = latestDocument.data();
                    let file;
                    if (latestData.image !== "") {
                        file = latestData.image;
                    } else if(latestData.audio !== "") {
                        file = latestData.audio;
                    } else {
                        file = "";
                    }
                    setDoc(last_message_sender, {
                        date: latestData.date,
                        last_message: latestData.message,
                        senderId: latestData.senderId,
                        file: file,
                    });
                } else {
                    const deleteChat = doc(
                        db,
                        `users/${userId}/chats/${chatId}`
                    );
                    if (deleteChat) {
                        deleteDoc(deleteChat);
                    }
                }
            });
        });
    }
}

export { deleteMessage }
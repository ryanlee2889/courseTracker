import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getSnipes() {
  const querySnapshot = await getDocs(collection(db, "snipes"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { db, getSnipes };
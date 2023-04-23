// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDD5wjyszMLNSDU87kpiH3OK_PIccQ08bg",
  authDomain: "fir-rtc-9b178.firebaseapp.com",
  projectId: "fir-rtc-9b178",
  storageBucket: "fir-rtc-9b178.appspot.com",
  messagingSenderId: "707840077378",
  appId: "1:707840077378:web:fd66a78a31dec371ce07db",
  measurementId: "G-WD6G4XJHQK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireStore = getFirestore(app);
console.log(await getDocs(collection(fireStore, "test")));
const ss = onSnapshot(collection(fireStore, "test"), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    console.log(change.type, change.doc.data());
  });
});

setTimeout(() => {
  ss();
  console.log("done");
}, 3000);

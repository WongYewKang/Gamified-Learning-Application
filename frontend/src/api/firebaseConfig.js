import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDFqTvIszbNQegfL1J9-ct-m-u6hkWl6xA",
  authDomain: "gla-fyp.firebaseapp.com",
  projectId: "gla-fyp",
  storageBucket: "gla-fyp.appspot.com",
  messagingSenderId: "812432690047",
  appId: "1:812432690047:web:b0f61433365c72e7d9684a",
  measurementId: "G-W8NLH60VJS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const imageDb = getStorage(app);

export { imageDb }; // Export the storage reference

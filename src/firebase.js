import firebase from 'firebase'

const firebaseApp= firebase.initializeApp ({
  apiKey: "AIzaSyAwTpJ-B1oy_j0WwuLaow6l77ixc0MABis",
  authDomain: "inspirer-9743c.firebaseapp.com",
  databaseURL: "https://inspirer-9743c.firebaseio.com",
  projectId: "inspirer-9743c",
  storageBucket: "inspirer-9743c.appspot.com",
  messagingSenderId: "392233747782",
  appId: "1:392233747782:web:7f7c2e40fd6eb014789147",
  measurementId: "G-ZRGV6Y3VD7"
});

  const db= firebaseApp.firestore();
  const auth= firebaseApp.auth();
  const storage= firebaseApp.storage();

  export {db, auth, storage};


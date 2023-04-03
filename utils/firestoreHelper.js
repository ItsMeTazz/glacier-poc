import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FB_DATABASE_URL,
};

let db = null;

async function getDb() {
  if (db) {
    return db;
  }
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  const username = process.env.NEXT_PUBLIC_FB_USERNAME;
  const pwd = process.env.NEXT_PUBLIC_FB_PASS;

  if (username && pwd) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        pwd
      );
      if (userCredential) {
        db = getDatabase(initializeApp(firebaseConfig));
      }
    } catch (e) {
      console.error(e);
    }
  }
  return db;
}

export default async function fetchDBPairs() {
  const fireDb = await getDb();
  let data = [];
  if (fireDb) {
    const snapshot = await get(ref(db, "/pairs"));
    snapshot.forEach((pair) => {
      const pairData = pair.val();
      data.push(pairData);
    });
  }
  return data;
}

export async function updateDBPairs(pairs) {
  const fireDb = await getDb();

  if (fireDb) {
    pairs.forEach(async (pair) => {
      if (pair.address) {
        await set(ref(db, "pairs/" + pair.address), {
          ...pair,
        });
      }
    });
  }
}

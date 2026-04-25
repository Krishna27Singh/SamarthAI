require("dotenv/config");

const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath = path.resolve(
  process.cwd(),
  process.env.FIREBASE_CREDENTIALS_PATH || "./firebase-credentials.json"
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

const db = admin.firestore();

module.exports = {
  admin,
  db,
};

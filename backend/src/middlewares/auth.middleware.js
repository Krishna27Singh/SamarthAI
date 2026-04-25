const { admin } = require("../config/firebase");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Missing or invalid Authorization header." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing token." });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token." });
  }
};

module.exports = authMiddleware;

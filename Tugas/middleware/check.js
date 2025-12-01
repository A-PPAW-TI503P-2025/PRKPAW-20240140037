const jwt = require("jsonwebtoken");
const JWT_SECRET = "INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN";

const checkAuth = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
};

const addUserData = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            return res.status(401).json({ message: "Token tidak valid" });
        }
    } else {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }
    next();
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya admin yang diperbolehkan." });
  }
};

module.exports = { checkAuth, addUserData, isAdmin };

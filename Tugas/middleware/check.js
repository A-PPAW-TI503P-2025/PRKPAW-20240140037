const checkAuth = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
};

const addUserData = (req, res, next) => {
    console.log('Middleware: Menambahkan User Data Dummy...');
    req.user = {
        id: 1,
        nama: 'Ridho',
        role: 'admin'
    };
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak: Hanya untuk admin.' });
    }
};

module.exports = { checkAuth, addUserData, isAdmin };
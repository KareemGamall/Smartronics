const jwt = require("jsonwebtoken");

module.exports = function (allowedRoles) {
  allowedRoles = allowedRoles || [];

  return async function (req, res, next) {
    try {
      const token = req.cookies.token;

      if (!token) {
        // return res.status(401).json({ message: "No token provided" });
<<<<<<< HEAD
        return res.status(401).redirect(`/login?message=Please+log+in+to+continue&redirect=${encodeURIComponent(req.originalUrl)}`);
=======
        return res.status(401).redirect("/");
>>>>>>> 0160af1 (Finished seif work)
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_PHRASE);

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        // return res.status(403).json({ message: "Forbidden: Access denied" });
<<<<<<< HEAD
        return res.status(403).redirect("/login?message=Please+log+in+to+continue");
=======
        return res.status(403).redirect("/");
>>>>>>> 0160af1 (Finished seif work)
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: error.message });
    }
  };
};

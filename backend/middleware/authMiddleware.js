const jwt = require("jsonwebtoken");

exports.authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);

      if (!decoded || (allowedRoles.length && !allowedRoles.includes(decoded.role))) {
        console.log(allowedRoles);
        return res.status(403).json({ error: "Forbidden. Not authorized." });
        
      }

      req.user = decoded; // attach payload (id, role)
      next();
    } catch (err) {
      console.error("Auth Middleware Error:", err);
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  };
};

const { supabase } = require("../config/supabase");

async function requireUserAuth(req, res, next) {
  try {
    if (!supabase) {
      return res.status(500).json({
        error: { message: "Supabase auth is not configured" },
      });
    }

    const authorization = req.get("authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        error: { message: "Missing bearer token" },
      });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: { message: "Invalid or expired user token" },
      });
    }

    req.user = data.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireUserAuth };

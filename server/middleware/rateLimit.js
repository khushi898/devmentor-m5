import rateLimit from "express-rate-limit";
 
export const aiLimiter=rateLimit({
    windowMs: 60*1000,
    limit:10,
    keyGenerator: (req)=>req.user._id.toString(),
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{ message:"Too many AI requests. Please wait a minute and try again."},
});
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Please wait a minute and try again." },
});
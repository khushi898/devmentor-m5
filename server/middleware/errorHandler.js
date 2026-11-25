export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  if(err.code === "LIMIT_FILE_SIZE"){
    return res.status(400).json({message:"File is too large. Maximum size is 10 MB"});
  }
  
  const statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({ message: err.message });
};
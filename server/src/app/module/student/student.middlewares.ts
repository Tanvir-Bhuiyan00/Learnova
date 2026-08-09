import { NextFunction, Request, Response } from "express";

export const updateStudentProfileMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  if (req.file) {
    req.body.profilePhoto = req.file.path;
  }

  next();
};

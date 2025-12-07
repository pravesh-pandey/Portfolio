import { Router } from "express";
import { submitContactController } from "../controllers/submitContactController.js";

export const contactRouter = Router();

contactRouter.post("/", submitContactController);

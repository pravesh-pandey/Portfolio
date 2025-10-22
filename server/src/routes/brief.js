import { Router } from "express";
import { submitBriefController } from "../controllers/submitBriefController.js";

export const briefRouter = Router();

briefRouter.post("/", submitBriefController);

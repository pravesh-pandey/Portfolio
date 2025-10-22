import { briefSchema } from "../validators/briefSchema.js";
import { saveBrief } from "../lib/briefStore.js";

export const submitBriefController = async (req, res, next) => {
  try {
    const parsed = briefSchema.parse(req.body);

    const saved = await saveBrief({
      ...parsed,
      clientIp: req.ip,
      userAgent: req.get("user-agent") ?? "unknown"
    });

    res.status(201).json({ ok: true, id: saved.id });
  } catch (error) {
    if (error.name === "ZodError") {
      res.status(422).json({ ok: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

import { contactSchema } from "../validators/contactSchema.js";
import { saveContact } from "../lib/contactStore.js";

export const submitContactController = async (req, res, next) => {
  try {
    const parsed = contactSchema.parse(req.body);

    const saved = await saveContact({
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

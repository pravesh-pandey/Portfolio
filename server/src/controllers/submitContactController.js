import { Resend } from "resend";
import { contactSchema } from "../validators/contactSchema.js";
import { saveContact } from "../lib/contactStore.js";
import { env } from "../config/env.js";

const resend = new Resend(env.resendApiKey);

export const submitContactController = async (req, res, next) => {
  try {
    const parsed = contactSchema.parse(req.body);

    const saved = await saveContact({
      ...parsed,
      clientIp: req.ip,
      userAgent: req.get("user-agent") ?? "unknown"
    });

    if (env.resendApiKey) {
      await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: env.contactEmail,
        reply_to: parsed.email,
        subject: `New message from ${parsed.name}`,
        text: `Name: ${parsed.name}\nEmail: ${parsed.email}\n\nMessage:\n${parsed.message}`
      });
    }

    res.status(201).json({ ok: true, id: saved.id });
  } catch (error) {
    if (error.name === "ZodError") {
      res.status(422).json({ ok: false, errors: error.errors });
      return;
    }
    next(error);
  }
};

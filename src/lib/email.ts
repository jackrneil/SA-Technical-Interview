import { Resend } from "resend";
import { SendEmailRequest, SendEmailResponse } from "@/lib/types";

export async function sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      sent: true,
      mode: "mock",
      message: "Mock Sent: Resend credentials are not configured, so no real email was sent.",
    };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: request.to,
    subject: request.subject,
    html: request.html,
  });

  if (error) {
    return {
      sent: false,
      mode: "real",
      message: error.message,
    };
  }

  return {
    sent: true,
    mode: "real",
    message: "Email sent through Resend.",
    providerId: data?.id,
  };
}

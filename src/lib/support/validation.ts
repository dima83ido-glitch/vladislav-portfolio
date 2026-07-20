import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().trim().min(4).max(150),
  body: z.string().trim().min(10).max(4000),
});

export const replySchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

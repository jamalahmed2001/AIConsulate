import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  budget: z.string().optional(),
  goals: z.string().optional(),
  message: z.string().min(10),
  source: z.string().optional(),
});

export const leadRouter = createTRPCRouter({
  create: publicProcedure.input(leadSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.lead.create({ data: input });
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.lead.findMany({ orderBy: { createdAt: "desc" } });
  }),
  markHandled: protectedProcedure
    .input(z.object({ id: z.string(), handled: z.boolean().default(true) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.lead.update({
        where: { id: input.id },
        data: { handled: input.handled },
      });
    }),
});

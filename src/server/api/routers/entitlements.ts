import { z } from "zod";
import { db } from "@/server/db";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// Narrow types to avoid any-usage lint issues without changing runtime
type AggregateSumDelta = { _sum: { delta: number | null } };
type CreditLedgerAggregateArgs = { _sum: { delta: true }; where: { userId: string } };
type CreditLedgerFindManyArgs = {
  where: { userId: string }
  take: number
  cursor?: { id: string }
  orderBy: { createdAt: "desc" }
  select: {
    id: true
    delta: true
    reason: true
    createdAt: true
    currency: true
    source: true
    sourceRef: true
    balanceAfter: true
    metadata: true
  }
};
type CreditLedgerItem = {
  id: string
  delta: number
  reason: string | null
  createdAt: Date
  currency: string | null
  source: string | null
  sourceRef: string | null
  balanceAfter: number | null
  metadata: unknown
};
type CreditLedgerModel = {
  aggregate: (args: CreditLedgerAggregateArgs) => Promise<AggregateSumDelta>
  findMany: (args: CreditLedgerFindManyArgs) => Promise<Array<CreditLedgerItem>>
}
type SubscriptionRecord = { status: string; currentPeriodEnd: Date | null; planCode: string | null; quantity: number };
type SubscriptionFindManyArgs = { where: { userId: string; status: { in: ["active", "trialing"] } } };
type SubscriptionFindFirstArgs = SubscriptionFindManyArgs & { orderBy: { createdAt: "desc" } };
type SubscriptionModel = {
  findMany: (args: SubscriptionFindManyArgs) => Promise<Array<SubscriptionRecord>>
  findFirst: (args: SubscriptionFindFirstArgs) => Promise<SubscriptionRecord | null>
}
const pdb = db as unknown as { creditLedger: CreditLedgerModel; subscription: SubscriptionModel };

export const entitlementsRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const [balanceAgg, subs] = await Promise.all([
      pdb.creditLedger.aggregate({ _sum: { delta: true }, where: { userId } }),
      pdb.subscription.findMany({ where: { userId, status: { in: ["active", "trialing"] } } }),
    ]);
    const creditBalance = balanceAgg._sum.delta ?? 0;
    return {
      creditBalance,
      plans: subs.map((s) => ({
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd,
        planCode: s.planCode,
        quantity: s.quantity,
      })),
    };
  }),

  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const balanceAgg = await pdb.creditLedger.aggregate({
      _sum: { delta: true },
      where: { userId }
    });
    return {
      balance: balanceAgg._sum.delta ?? 0
    };
  }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const subscription = await pdb.subscription.findFirst({
      where: { 
        userId,
        status: { in: ["active", "trialing"] }
      },
      orderBy: { createdAt: "desc" }
    });
    
    if (!subscription) return { active: false };
    
    return {
      active: true,
      status: subscription.status,
      planName: subscription.planCode ?? "Pro",
      currentPeriodEnd: subscription.currentPeriodEnd,
      quantity: subscription.quantity
    };
  }),

  getCreditHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      cursor: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { limit, cursor } = input;

      const items = await pdb.creditLedger.findMany({
        where: { userId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          delta: true,
          reason: true,
          createdAt: true,
          currency: true,
          source: true,
          sourceRef: true,
          balanceAfter: true,
          metadata: true,
        }
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor
      };
    })
});



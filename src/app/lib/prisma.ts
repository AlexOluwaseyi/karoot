import { PrismaClient } from "@prisma/client";
import { CreateUser, FindUser, UpdateUser } from "./zodSchema";
import { SubmitQuiz, UpdateQuiz } from "./zodSchema";
import { AuditLogSchema } from "./zodSchema";

const prisma = new PrismaClient().$extends({
  query: {
    user: {
      create({ args, query }) {
        args.data = CreateUser.parse(args.data);
        return query(args);
      },
      findUnique({ args, query }) {
        args.where = FindUser.parse(args.where);
        return query(args);
      },
      update({ args, query }) {
        args.data = UpdateUser.parse(args.data);
        args.where = FindUser.parse(args.where);
        return query(args);
      },
    },
    quiz: {
      create({ args, query }) {
        args.data = SubmitQuiz.parse(args.data);
        return query(args);
      },
      update({ args, query }) {
        args.data = UpdateQuiz.parse(args.data);
        return query(args);
      },
    },
    auditLog: {
      create({ args, query }) {
        const validatedData = AuditLogSchema.parse(args.data);
        const { performer, target, ...auditData } = validatedData;
        void performer; // Explicitly ignore
        void target;    // Explicitly ignore
        args.data = auditData;
        return query(args);
      }
    },
  },
});

export default prisma;

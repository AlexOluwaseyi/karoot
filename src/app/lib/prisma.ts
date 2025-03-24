import { PrismaClient } from "@prisma/client";
import { CreateUser, FindUser, UpdateUser } from "./zodSchema";

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
  },
});

export default prisma;

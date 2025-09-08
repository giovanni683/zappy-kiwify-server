"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
class Prisma {
    static instance() {
        return new client_1.PrismaClient({
            log: ["error", "warn", "query"],
            errorFormat: "pretty"
        });
    }
}
exports.prisma = Prisma.instance();

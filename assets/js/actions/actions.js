import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GetClasses() {

    const classes = await prisma.class.findMany();
    return classes
}






export async function logclasses() {
    const c = await GetClasses()
    console.log(c);

}

logclasses()

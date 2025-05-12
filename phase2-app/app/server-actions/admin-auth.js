// 'use server';

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// export async function loginAsAdmin(formData) {
//   const username = formData.get('username');
//   const password = formData.get('password');

//   const admin = await prisma.admin.findUnique({ where: { username } });

//   if (admin && admin.password === password) {
//     return { success: true };
//   }

//   return { success: false, message: 'Only admins can access statistics.' };
// }

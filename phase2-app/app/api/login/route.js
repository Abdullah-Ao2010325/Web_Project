import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  const { username, password } = await req.json();

  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin || admin.password !== password) {
    return NextResponse.json({ success: false, message: 'Only admins can access the statistics. Please enter valid admin credentials.' }, { status: 401 });
  }


  return NextResponse.json({ success: true });
}

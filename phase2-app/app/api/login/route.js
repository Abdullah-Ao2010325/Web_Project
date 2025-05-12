// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET;

// export async function POST(req) {
//   console.log("POST /api/login hit");

//   try {
//     const body = await req.json();
//     const { username, password } = body;

//     console.log("Login attempt with:", username, password);

//     const admin = await prisma.admin.findUnique({
//       where: { username },
//     });

//     if (!admin) {
//       console.log("Admin not found");
//       return NextResponse.json({ success: false, message: "Admin not found" }, { status: 401 });
//     }

//     if (admin.password !== password) {
//       console.log("Wrong password");
//       return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });
//     }

//     console.log("Admin authenticated:", admin);

//     // Generate a JWT token
//     const token = jwt.sign(
//       { id: admin.id, username: admin.username, role: 'admin' },
//       JWT_SECRET,
//       { expiresIn: '1h' } // Token expiration time (e.g., 1 hour)
//     );

//     return NextResponse.json({
//       success: true,
//       message: 'Login successful',
//       token: token,
//     });

//   } catch (error) {
//     console.error("Login error:", error);
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
    console.log("POST /api/login endpoinnt"); //for debugging

    try {
        const body = await req.json();
        const { username, password } = body;

        console.log("Login  with:", username, password);

        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            console.log("Admin not found");
            return NextResponse.json({ success: false, message: "Admin not found" }, { status: 401 });
        }

        if (admin.password !== password) {
            console.log("Wrong password");
            return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });
        }

        console.log("Admin authenticated:", admin);

        // create a JWT 
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            token: token,
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {

  try {

    const { email, password } = await req.json();


    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });


    if (!user) {

      return NextResponse.json(
        {
          message: "User not found"
        },
        {
          status: 400
        }
      );

    }


    const match = await bcrypt.compare(
      password,
      user.password!
    );


    if (!match) {

      return NextResponse.json(
        {
          message: "Wrong password"
        },
        {
          status: 400
        }
      );

    }


    return NextResponse.json({
      message: "Login success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });


  }
  catch {

    return NextResponse.json(
      {
        message: "Server error"
      },
      {
        status: 500
      }
    );

  }

}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";


// GET goals
export async function GET() {

  const session = await auth();


  if (!session?.user?.id) {

    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );

  }


  const goals = await prisma.goal.findMany({

    where: {
      userId: session.user.id
    },

    orderBy: {
      createdAt: "desc"
    }

  });


  return NextResponse.json(goals);

}



// CREATE goal
export async function POST(req: Request) {

  const session = await auth();
  console.log("SESSION USER:", session?.user);

  if (!session?.user?.id) {

    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );

  }


  const body = await req.json();


  const goal = await prisma.goal.create({
    data: {
      title: body.title,
      description: body.description || "",
      progress: 0,
      completed: false,
      deadline: body.deadline ? new Date(body.deadline) : null,
      userId: session.user.id
    }
  });


  return NextResponse.json(goal);

}



// UPDATE goal
export async function PATCH(req: Request) {

  const session = await auth();


  if (!session?.user?.id) {

    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );

  }


  const body = await req.json();


  const goal = await prisma.goal.update({

    where: {
      id: body.id
    },

    data: {

      progress: body.progress,

      completed: body.completed

    }

  });


  return NextResponse.json(goal);

}



// DELETE goal
export async function DELETE(req: Request) {

  const session = await auth();


  if (!session?.user?.id) {

    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );

  }


  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");


  await prisma.goal.delete({

    where: {
      id: id!
    }

  });


  return NextResponse.json({
    message: "Deleted"
  });

}
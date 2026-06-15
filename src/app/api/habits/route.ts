import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";


export async function GET() {

  const session = await auth();


  if (!session?.user?.id)
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );


  const habits = await prisma.habit.findMany({

    where: {
      userId: session.user.id
    }

  });


  return NextResponse.json(habits);

}




export async function POST(req: Request) {


  const session = await auth();


  if (!session?.user?.id)
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );



  const { name } = await req.json();



  const habit = await prisma.habit.create({

    data: {

      name,

      userId: session.user.id

    }

  });


  return NextResponse.json(habit);


}




export async function PATCH(req: Request) {


  const { id } = await req.json();



  const habit = await prisma.habit.update({

    where: {
      id
    },

    data: {

      completedToday: true,

      streak: {
        increment: 1
      }

    }

  });


  return NextResponse.json(habit);

}




// DELETE HABIT
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

  if (!id) {
    return NextResponse.json(
      { message: "Missing habit ID" },
      { status: 400 }
    );
  }

  // Verify ownership
  const existingHabit = await prisma.habit.findUnique({
    where: { id },
  });

  if (!existingHabit || existingHabit.userId !== session.user.id) {
    return NextResponse.json(
      { message: "Not Found or Unauthorized" },
      { status: 404 }
    );
  }

  // Delete associated logs first
  await prisma.habitLog.deleteMany({
    where: { habitId: id },
  });

  // Delete the habit
  await prisma.habit.delete({
    where: { id },
  });

  return NextResponse.json({
    message: "Deleted"
  });
}
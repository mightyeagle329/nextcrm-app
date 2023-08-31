import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";

import { generateRandomPassword } from "@/lib/utils";

import { hash } from "bcryptjs";
import PasswordResetEmail from "@/emails/PasswordReset";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    //console.log(body, "body");
    //console.log(email, "email");

    if (!email) {
      return new NextResponse("Email is required!", {
        status: 401,
      });
    }

    const password = generateRandomPassword();

    const user = await prismadb.users.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return new NextResponse("No user with that Email exist in Db!", {
        status: 401,
      });
    }

    const newpassword = await prismadb.users.update({
      where: { id: user.id },
      data: {
        password: await hash(password, 12),
      },
    });

    if (!newpassword) {
      return new NextResponse("Password not updated!", {
        status: 401,
      });
    } else {
      const data = await resend.emails.send({
        from: "NextCRM <info@nextcrm.io>",
        to: user.email,
        //to: ["pavel@dovhomilja.cz"],
        subject: "NextCRM - Password reset",
        text: "", // Add this line to fix the types issue
        //react: DemoTemplate({ firstName: "John" }),
        react: PasswordResetEmail({
          username: user?.name!,
          avatar: user.avatar,
          email: user.email,
          password: password,
          userLanguage: user.userLanguage,
        }),
      });
      console.log(data, "data");
      console.log("Email sent to: " + user.email);
    }

    return NextResponse.json({ message: "Password changed!", status: true });
  } catch (error) {
    console.log("[USER_PASSWORD_CHANGE_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}

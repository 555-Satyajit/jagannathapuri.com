"use server";
import prisma from "@/lib/prisma";

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." };
  }

  try {
    const existing = await prisma.newsletter.findUnique({
      where: { email }
    });

    if (existing) {
      return { success: true, message: "You are already subscribed to our newsletter!" };
    }

    await prisma.newsletter.create({
      data: { email }
    });

    return { success: true, message: "Thank you for subscribing!" };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, message: "An error occurred. Please try again later." };
  }
}

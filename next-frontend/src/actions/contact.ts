"use server";

import prisma from "@/lib/prisma";

export async function submitContactMessage(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
      return { success: false, message: "Please fill in all required fields." };
    }

    await prisma.feedback.create({
      data: {
        name,
        email,
        message,
      },
    });

    return { success: true, message: "Thank you! Your message has been sent successfully." };
  } catch (error) {
    console.error("Contact submission error:", error);
    return { success: false, message: "Failed to send message. Please try again later." };
  }
}

import HomePage from "@/app/home/page";

export const revalidate = 60; // Revalidate every 60 seconds

export default function Home() {
  return <HomePage />;
}

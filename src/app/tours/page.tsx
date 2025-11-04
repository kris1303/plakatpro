import { redirect } from "next/navigation";

// Redirect to mobile tours app
export default function ToursPage() {
  redirect("/m/tours");
}


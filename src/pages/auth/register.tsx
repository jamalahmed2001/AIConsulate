import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signup page since this appears to be the same functionality
    void router.replace("/auth/signup");
  }, [router]);

  return null;
}

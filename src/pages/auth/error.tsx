import { useRouter } from "next/router";
import { CTA } from "@/components/ui/CTA";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The sign in link is no longer valid.";
      case "CredentialsSignin":
        return "Invalid email or password.";
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <Container className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">Authentication Error</h2>
          <p className="mt-2 text-sm text-gray-600">{getErrorMessage()}</p>
        </div>

        <div className="space-y-3">
          <CTA href="/auth/signin" fullWidth label="Try signing in again" />
          <CTA href="/" tone="secondary" fullWidth label="Go to homepage" />
        </div>
      </Card>
    </Container>
  );
}

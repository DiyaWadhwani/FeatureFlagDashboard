import { ROLE_LABELS, type ActorRole } from "@/constants";

export default function SignIn() {
  const signInAs = (role: ActorRole) => {
    localStorage.setItem("actorRole", role);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 space-y-4">
        <h1 className="text-lg font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Choose how you want to operate Gatekeeper.
        </p>

        <button
          onClick={() => signInAs("ADMIN")}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Continue as {ROLE_LABELS.ADMIN}
        </button>

        <button
          onClick={() => signInAs("DEVELOPER")}
          className="w-full rounded-md border px-4 py-2 text-sm"
        >
          Continue as {ROLE_LABELS.DEVELOPER}
        </button>
      </div>
    </div>
  );
}

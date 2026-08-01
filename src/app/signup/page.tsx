"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ApiErrorClass } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signup(email, name, password);
      router.push("/settings");
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to sign up");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-glow"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          <UserPlus className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sign Up</h1>
        <p className="mt-2 text-muted-foreground">
          Create a free account to store your own API key and Jira connection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            type="text"
            required
            size="lg"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            required
            size="lg"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            required
            minLength={8}
            size="lg"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline hover:no-underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

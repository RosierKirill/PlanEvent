import LoginForm from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="container mx-auto px-4 min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Se connecter</h1>
        <LoginForm />
        <div className="mt-4 text-sm text-center">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  );
}

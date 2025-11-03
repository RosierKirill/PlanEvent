import LoginForm from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Se connecter</h1>
      <LoginForm />
      <div className="mt-4 text-sm">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Créer un compte
        </Link>
      </div>
    </main>
  );
}

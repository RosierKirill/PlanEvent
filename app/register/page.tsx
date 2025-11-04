import RegisterForm from "@/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Créer un compte</h1>
        <RegisterForm />
          <div className="mt-4 text-sm text-center">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Se connecter
              </Link>
          </div>
        </div>
    </main>
  );
}

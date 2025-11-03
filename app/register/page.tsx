import RegisterForm from "@/components/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>
      <RegisterForm />
      <div className="mt-4 text-sm">
        Déjà un compte ? <Link href="/login" className="text-primary hover:underline">Se connecter</Link>
      </div>
    </main>
  )
}

import SignupForm from "@/components/signup-form"
import Link from "next/link"

export default function SignupPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>
      <SignupForm />
      <div className="mt-4 text-sm">
        Déjà un compte ? <Link href="/login" className="text-primary hover:underline">Se connecter</Link>
      </div>
    </main>
  )
}

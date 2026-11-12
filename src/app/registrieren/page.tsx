import { AuthForm } from "@/components/AuthForm";
import { registerAction } from "@/lib/actions/auth-actions";

export default function RegisterPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10">
      <AuthForm mode="register" action={registerAction} />
    </div>
  );
}

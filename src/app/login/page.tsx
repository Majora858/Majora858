import { AuthForm } from "@/components/AuthForm";
import { loginAction } from "@/lib/actions/auth-actions";

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10">
      <AuthForm mode="login" action={loginAction} />
    </div>
  );
}

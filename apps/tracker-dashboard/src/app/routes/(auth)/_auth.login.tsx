import { LoginForm } from '@/modules/auth';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/_auth/login')({
  component: LoginPage,
});

function LoginPage() {
  return <LoginForm />;
}

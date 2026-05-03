import { univerImg } from '@/shared/assets';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

import { Card, CardContent } from '@repo/ui-kit/components/common/layout/card';

export const Route = createFileRoute('/(auth)/_auth')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuth) {
      throw redirect({ to: '/' });
    }
  },
  component: Authlayout,
});

function Authlayout() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <Outlet />

              <div className="relative hidden bg-muted md:block">
                <img
                  src={univerImg}
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

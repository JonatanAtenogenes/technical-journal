import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from '@/app/admin/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className={'flex min-h-screen items-center justify-center px-4'}>
      <Card className={'w-full max-w-sm'}>
        <CardHeader>
          <CardTitle>Technical Journal Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signIn} className={'space-y-4'}>
            <div className={'space-y-2'}>
              <Label htmlFor={'email'}>Email</Label>
              <Input
                id="email"
                name={'email'}
                placeholder={'Email'}
                type={'email'}
                autoComplete={'email'}
                required
              />
            </div>
            <div className={'space-y-2'}>
              <Label htmlFor={'password'}>Password</Label>
              <Input
                id={'password'}
                name={'password'}
                type={'password'}
                placeholder={'Password'}
                autoComplete={'current-password'}
                required
              />
            </div>
            {error === 'invalid_credentials' && (
              <p className={'text-sm text-destructive'}>
                Invalid email or password.
              </p>
            )}
            <Button type={'submit'} className={'w-full'}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

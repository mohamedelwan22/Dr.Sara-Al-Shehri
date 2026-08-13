import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { authService } from '@/services';
import { signInSchema, type SignInValues } from '@/schemas/auth';
import { Card, CardBody, Input, FieldWrapper, Button, useToast } from '@/components/ui';

export function SignInPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInValues) => {
    try {
      await authService.signIn(values.email, values.password);
      toast.success(t('auth.welcome'));
      navigate(next, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('Invalid login credentials')) toast.error(t('auth.invalidCredentials'));
      else toast.error(t('errors.generic'));
    }
  };

  return (
    <>
      <Seo title={t('auth.signInTitle')} />
      <div className="container-page flex justify-center py-16">
        <Card className="w-full max-w-md">
          <CardBody className="py-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <LogIn className="h-7 w-7" />
              </div>
              <h1 className="font-display text-2xl font-bold text-primary-900">{t('auth.signInTitle')}</h1>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FieldWrapper label={t('auth.emailLabel')} error={form.formState.errors.email?.message} id="si-email">
                <Input id="si-email" type="email" dir="ltr" {...form.register('email')} error={Boolean(form.formState.errors.email)} placeholder={t('auth.emailLabel')} />
              </FieldWrapper>
              <FieldWrapper label={t('auth.passwordLabel')} error={form.formState.errors.password?.message} id="si-pass">
                <Input id="si-pass" type="password" dir="ltr" {...form.register('password')} error={Boolean(form.formState.errors.password)} placeholder="••••••" />
              </FieldWrapper>

              <div className="text-start">
                <Link to="/auth/forgot-password" className="text-sm font-bold text-primary-600 hover:text-gold-600">
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              <Button type="submit" className="w-full" isLoading={form.formState.isSubmitting}>
                {t('auth.signInBtn')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slateGray-dark">
              {t('auth.noAccount')}{' '}
              <Link to="/auth/sign-up" className="font-bold text-primary-600 hover:text-gold-600">
                {t('auth.signUpBtn')}
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

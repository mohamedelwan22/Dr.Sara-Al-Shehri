import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { authService } from '@/services';
import { signUpSchema, type SignUpValues } from '@/schemas/auth';
import { Card, CardBody, Input, FieldWrapper, Button, useToast } from '@/components/ui';

export function SignUpPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: SignUpValues) => {
    try {
      const { session } = await authService.signUp(values.displayName, values.email, values.password);
      if (session) {
        toast.success(t('auth.welcome'));
        navigate(next, { replace: true });
      } else {
        toast.success(t('auth.confirmationSent'));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('already registered') || message.includes('already been registered')) {
        toast.error(t('auth.emailInUse'));
      } else if (message.includes('Password should be')) {
        toast.error(t('auth.passwordTooShort'));
      } else {
        toast.error(t('errors.generic'));
      }
    }
  };

  return (
    <>
      <Seo title={t('auth.signUpTitle')} />
      <div className="container-page flex justify-center py-16">
        <Card className="w-full max-w-md">
          <CardBody className="py-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                <UserPlus className="h-7 w-7" />
              </div>
              <h1 className="font-display text-2xl font-bold text-primary-900">{t('auth.signUpTitle')}</h1>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FieldWrapper label={t('auth.displayNameLabel')} error={form.formState.errors.displayName?.message} id="su-name">
                <Input id="su-name" {...form.register('displayName')} error={Boolean(form.formState.errors.displayName)} placeholder={t('auth.displayNameLabel')} />
              </FieldWrapper>
              <FieldWrapper label={t('auth.emailLabel')} error={form.formState.errors.email?.message} id="su-email">
                <Input id="su-email" type="email" dir="ltr" {...form.register('email')} error={Boolean(form.formState.errors.email)} placeholder={t('auth.emailLabel')} />
              </FieldWrapper>
              <FieldWrapper label={t('auth.passwordLabel')} error={form.formState.errors.password?.message} id="su-pass">
                <Input id="su-pass" type="password" dir="ltr" {...form.register('password')} error={Boolean(form.formState.errors.password)} placeholder="••••••" />
              </FieldWrapper>
              <FieldWrapper label={t('auth.confirmPasswordLabel')} error={form.formState.errors.confirmPassword?.message} id="su-pass2">
                <Input id="su-pass2" type="password" dir="ltr" {...form.register('confirmPassword')} error={Boolean(form.formState.errors.confirmPassword)} placeholder="••••••" />
              </FieldWrapper>

              <Button type="submit" variant="gold" className="w-full" isLoading={form.formState.isSubmitting}>
                {t('auth.signUpBtn')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slateGray-dark">
              {t('auth.haveAccount')}{' '}
              <Link to="/auth/sign-in" className="font-bold text-primary-600 hover:text-gold-600">
                {t('auth.signInBtn')}
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

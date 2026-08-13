import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { authService } from '@/services';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/schemas/auth';
import { Card, CardBody, Input, FieldWrapper, Button, useToast } from '@/components/ui';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await authService.resetPassword(values.email);
      toast.success(t('auth.resetSent'));
    } catch {
      toast.error(t('errors.generic'));
    }
  };

  return (
    <>
      <Seo title={t('auth.forgotTitle')} />
      <div className="container-page flex justify-center py-16">
        <Card className="w-full max-w-md">
          <CardBody className="py-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <KeyRound className="h-7 w-7" />
              </div>
              <h1 className="font-display text-2xl font-bold text-primary-900">{t('auth.forgotTitle')}</h1>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FieldWrapper label={t('auth.emailLabel')} error={form.formState.errors.email?.message} id="fp-email">
                <Input id="fp-email" type="email" dir="ltr" {...form.register('email')} error={Boolean(form.formState.errors.email)} placeholder={t('auth.emailLabel')} />
              </FieldWrapper>

              <Button type="submit" className="w-full" isLoading={form.formState.isSubmitting}>
                {t('auth.sendResetBtn')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slateGray-dark">
              <Link to="/auth/sign-in" className="font-bold text-primary-600 hover:text-gold-600">
                {t('auth.backToSignIn')}
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

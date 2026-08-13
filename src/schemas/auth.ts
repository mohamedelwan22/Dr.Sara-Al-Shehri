import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, { message: 'auth.invalidEmail' }).email({ message: 'auth.invalidEmail' }),
  password: z.string().min(1, { message: 'auth.invalidCredentials' }),
});

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .min(2, { message: 'auth.displayNameRequired' })
      .max(80, { message: 'auth.displayNameRequired' }),
    email: z.string().min(1, { message: 'auth.invalidEmail' }).email({ message: 'auth.invalidEmail' }),
    password: z.string().min(6, { message: 'auth.passwordTooShort' }),
    confirmPassword: z.string().min(6, { message: 'auth.passwordTooShort' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.passwordsMismatch',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: 'auth.invalidEmail' }).email({ message: 'auth.invalidEmail' }),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(1, { message: 'auth.displayNameRequired' }).max(80),
  locale: z.enum(['ar', 'en']),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

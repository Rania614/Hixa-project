/**
 * Validation Schemas and Utilities
 * 
 * Password validation rules (unified for all roles):
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 */

import { z } from 'zod';

// ============================================
// Password Validation
// ============================================

export const passwordSchema = z
  .string()
  .min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  .regex(/[A-Z]/, { message: 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل' })
  .regex(/[a-z]/, { message: 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل' })
  .regex(/[0-9]/, { message: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل' });

// ============================================
// Email Validation
// ============================================

export const emailSchema = z
  .string()
  .min(1, { message: 'البريد الإلكتروني مطلوب' })
  .email({ message: 'يرجى إدخال بريد إلكتروني صحيح' })
  .transform((val) => val.toLowerCase().trim());

// ============================================
// Login Schema
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
  rememberMe: z.boolean().optional(),
});

// ============================================
// Company Registration Schema
// ============================================

export const companyRegistrationSchema = z
  .object({
    companyName: z
      .string()
      .min(1, { message: 'اسم الشركة مطلوب' })
      .min(2, { message: 'اسم الشركة يجب أن يكون على الأقل حرفين' })
      .max(200, { message: 'اسم الشركة يجب أن يكون أقل من 200 حرف' }),
    contactPersonName: z
      .string()
      .min(1, { message: 'اسم الشخص المسؤول مطلوب' })
      .min(2, { message: 'اسم الشخص المسؤول يجب أن يكون على الأقل حرفين' })
      .max(100, { message: 'اسم الشخص المسؤول يجب أن يكون أقل من 100 حرف' }),
    email: emailSchema,
    phone: z
      .string()
      .min(1, { message: 'رقم الهاتف مطلوب' })
      .min(8, { message: 'رقم الهاتف غير صحيح' }),
    countryCode: z
      .string()
      .min(1, { message: 'رمز الدولة مطلوب' })
      .length(2, { message: 'رمز الدولة يجب أن يكون حرفين' }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
    path: ['confirmPassword'],
  });

// ============================================
// Engineer Registration Schema
// ============================================

export const engineerRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: 'الاسم الكامل مطلوب' })
      .min(2, { message: 'الاسم الكامل يجب أن يكون على الأقل حرفين' })
      .max(100, { message: 'الاسم الكامل يجب أن يكون أقل من 100 حرف' }),
    specialization: z
      .string()
      .min(1, { message: 'التخصص مطلوب' })
      .min(2, { message: 'التخصص يجب أن يكون على الأقل حرفين' })
      .max(100, { message: 'التخصص يجب أن يكون أقل من 100 حرف' }),
    licenseNumber: z
      .string()
      .min(1, { message: 'رقم الترخيص مطلوب' })
      .max(50, { message: 'رقم الترخيص يجب أن يكون أقل من 50 حرف' }),
    email: emailSchema,
    phone: z
      .string()
      .min(1, { message: 'رقم الهاتف مطلوب' })
      .min(8, { message: 'رقم الهاتف غير صحيح' }),
    countryCode: z
      .string()
      .min(1, { message: 'رمز الدولة مطلوب' })
      .length(2, { message: 'رمز الدولة يجب أن يكون حرفين' }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
    path: ['confirmPassword'],
  });

// ============================================
// Client Registration Schema
// ============================================

export const clientRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: 'الاسم الكامل مطلوب' })
      .min(2, { message: 'الاسم الكامل يجب أن يكون على الأقل حرفين' })
      .max(100, { message: 'الاسم الكامل يجب أن يكون أقل من 100 حرف' }),
    email: emailSchema,
    phone: z
      .string()
      .min(1, { message: 'رقم الهاتف مطلوب' })
      .min(8, { message: 'رقم الهاتف غير صحيح' }),
    countryCode: z
      .string()
      .min(1, { message: 'رمز الدولة مطلوب' })
      .length(2, { message: 'رمز الدولة يجب أن يكون حرفين' }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
    path: ['confirmPassword'],
  });

// ============================================
// Type Exports
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type CompanyRegistrationFormData = z.infer<typeof companyRegistrationSchema>;
export type EngineerRegistrationFormData = z.infer<typeof engineerRegistrationSchema>;
export type ClientRegistrationFormData = z.infer<typeof clientRegistrationSchema>;


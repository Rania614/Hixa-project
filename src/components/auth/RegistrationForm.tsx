/**
 * RegistrationForm Component
 * 
 * Unified registration form with tabs for:
 * - Client (عميل)
 * - Engineer (مهندس)
 * - Company (شركة)
 * 
 * Features:
 * - Dynamic form fields based on selected role
 * - Validation according to schema rules
 * - Loading states
 * - Error handling
 * - Smart redirect based on user role after registration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Building2,
  Wrench,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  UserCircle,
  Briefcase,
  Hash,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  companyRegistrationSchema,
  engineerRegistrationSchema,
  clientRegistrationSchema,
  type CompanyRegistrationFormData,
  type EngineerRegistrationFormData,
  type ClientRegistrationFormData,
} from '@/lib/validation';
import {
  registerCompany,
  registerEngineer,
  registerClient,
  getDashboardPath,
  type CompanyRegistrationRequest,
  type EngineerRegistrationRequest,
  type ClientRegistrationRequest,
} from '@/services/authApi';
import { useApp } from '@/context/AppContext';
import { toast } from '@/components/ui/sonner';
import { CountryPhoneInput } from '@/components/shared/CountryPhoneInput';

interface RegistrationFormProps {
  onSuccess?: () => void;
  defaultRole?: 'client' | 'engineer' | 'company';
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  defaultRole = 'client',
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'engineer' | 'company'>(defaultRole);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setUserRole, language } = useApp();

  // Client Form
  const clientForm = useForm<ClientRegistrationFormData>({
    resolver: zodResolver(clientRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      countryCode: 'SA',
      password: '',
      confirmPassword: '',
    },
  });

  // Engineer Form
  const engineerForm = useForm<EngineerRegistrationFormData>({
    resolver: zodResolver(engineerRegistrationSchema),
    defaultValues: {
      fullName: '',
      specialization: '',
      licenseNumber: '',
      email: '',
      phone: '',
      countryCode: 'SA',
      password: '',
      confirmPassword: '',
    },
  });

  // Company Form
  const companyForm = useForm<CompanyRegistrationFormData>({
    resolver: zodResolver(companyRegistrationSchema),
    defaultValues: {
      companyName: '',
      contactPersonName: '',
      email: '',
      phone: '',
      countryCode: 'SA',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle Client Registration
  const onSubmitClient = async (data: ClientRegistrationFormData) => {
    setIsLoading(true);
    try {
      // Ensure all required fields are present
      const requestData: ClientRegistrationRequest = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        countryCode: data.countryCode,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };
      const response = await registerClient(requestData);
      setIsAuthenticated(true);
      
      const userRole = response.user?.role?.toLowerCase();
      const normalizedRole = userRole === 'client' ? 'client' : null;
      setUserRole(normalizedRole);
      
      toast.success(
        language === 'ar' ? 'تم تسجيل العميل بنجاح' : 'Client registered successfully',
        {
          description: language === 'ar' 
            ? `مرحباً ${response.user.name}` 
            : `Welcome ${response.user.name}`,
        }
      );
      
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        navigate(getDashboardPath(response.user.role), { replace: true });
      }, 500);
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Engineer Registration
  const onSubmitEngineer = async (data: EngineerRegistrationFormData) => {
    setIsLoading(true);
    try {
      // Ensure all required fields are present
      const requestData: EngineerRegistrationRequest = {
        fullName: data.fullName,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        email: data.email,
        phone: data.phone,
        countryCode: data.countryCode,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };
      const response = await registerEngineer(requestData);
      setIsAuthenticated(true);
      
      const userRole = response.user?.role?.toLowerCase();
      const normalizedRole = userRole === 'engineer' || userRole === 'partner' ? 'engineer' : null;
      setUserRole(normalizedRole);
      
      toast.success(
        language === 'ar' ? 'تم تسجيل المهندس بنجاح' : 'Engineer registered successfully',
        {
          description: language === 'ar' 
            ? `مرحباً ${response.user.name}` 
            : `Welcome ${response.user.name}`,
        }
      );
      
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        navigate(getDashboardPath(response.user.role), { replace: true });
      }, 500);
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Company Registration
  const onSubmitCompany = async (data: CompanyRegistrationFormData) => {
    setIsLoading(true);
    try {
      // Ensure all required fields are present
      const requestData: CompanyRegistrationRequest = {
        companyName: data.companyName,
        contactPersonName: data.contactPersonName,
        email: data.email,
        phone: data.phone,
        countryCode: data.countryCode,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };
      const response = await registerCompany(requestData);
      setIsAuthenticated(true);
      
      const userRole = response.user?.role?.toLowerCase();
      const normalizedRole = userRole === 'company' ? 'company' : null;
      setUserRole(normalizedRole);
      
      toast.success(
        language === 'ar' ? 'تم تسجيل الشركة بنجاح' : 'Company registered successfully',
        {
          description: language === 'ar' 
            ? `مرحباً ${response.user.name}` 
            : `Welcome ${response.user.name}`,
        }
      );
      
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        navigate(getDashboardPath(response.user.role), { replace: true });
      }, 500);
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="client" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {language === 'ar' ? 'عميل' : 'Client'}
          </TabsTrigger>
          <TabsTrigger value="engineer" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            {language === 'ar' ? 'مهندس' : 'Engineer'}
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {language === 'ar' ? 'شركة' : 'Company'}
          </TabsTrigger>
        </TabsList>

        {/* Client Registration */}
        <TabsContent value="client">
          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit(onSubmitClient)} className="space-y-4">
              {/* Full Name */}
              <FormField
                control={clientForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Enter your full name'}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' ? '2-100 حرف' : '2-100 characters'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={clientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone and Country Code */}
              <CountryPhoneInput 
                control={clientForm.control}
                errors={clientForm.formState.errors}
                required
                disabled={isLoading}
                label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              />

              {/* Password */}
              <FormField
                control={clientForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                          {...field}
                          className="pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' 
                        ? '8+ أحرف، حرف كبير، حرف صغير، رقم' 
                        : '8+ chars, uppercase, lowercase, number'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={clientForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                          {...field}
                          className="pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-black font-semibold hexagon-none rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جاري التسجيل...' : 'Registering...'}
                  </>
                ) : (
                  language === 'ar' ? 'تسجيل العميل' : 'Register Client'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Engineer Registration */}
        <TabsContent value="engineer">
          <Form {...engineerForm}>
            <form onSubmit={engineerForm.handleSubmit(onSubmitEngineer)} className="space-y-4">
              {/* Full Name */}
              <FormField
                control={engineerForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Enter your full name'}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' ? '2-100 حرف' : '2-100 characters'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specialization */}
              <FormField
                control={engineerForm.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {language === 'ar' ? 'التخصص' : 'Specialization'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'ar' ? 'أدخل التخصص' : 'Enter your specialization'}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' ? '2-100 حرف' : '2-100 characters'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* License Number */}
              <FormField
                control={engineerForm.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      {language === 'ar' ? 'رقم الترخيص' : 'License Number'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'ar' ? 'أدخل رقم الترخيص' : 'Enter license number'}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' ? '1-50 حرف (فريد)' : '1-50 characters (unique)'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={engineerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone and Country Code */}
              <CountryPhoneInput 
                control={engineerForm.control}
                errors={engineerForm.formState.errors}
                required
                disabled={isLoading}
                label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              />

              {/* Password */}
              <FormField
                control={engineerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                          {...field}
                          className="pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' 
                        ? '8+ أحرف، حرف كبير، حرف صغير، رقم' 
                        : '8+ chars, uppercase, lowercase, number'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={engineerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                          {...field}
                          className="pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جاري التسجيل...' : 'Registering...'}
                  </>
                ) : (
                  language === 'ar' ? 'تسجيل المهندس' : 'Register Engineer'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Company Registration */}
        <TabsContent value="company">
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-4">
              {/* Company Name */}
              <FormField
                control={companyForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {language === 'ar' ? 'اسم الشركة' : 'Company Name'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'ar' ? 'أدخل اسم الشركة' : 'Enter company name'}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' ? '2-200 حرف' : '2-200 characters'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Person Name */}
              <FormField
                control={companyForm.control}
                name="contactPersonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      {language === 'ar' ? 'اسم الشخص المسؤول' : 'Contact Person Name'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={language === 'ar' ? 'أدخل اسم الشخص المسؤول' : 'Enter contact person name'}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' ? '2-100 حرف' : '2-100 characters'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={companyForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone and Country Code */}
              <CountryPhoneInput 
                control={companyForm.control}
                errors={companyForm.formState.errors}
                required
                disabled={isLoading}
                label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              />

              {/* Password */}
              <FormField
                control={companyForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                          {...field}
                          className="pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {language === 'ar' 
                        ? '8+ أحرف، حرف كبير، حرف صغير، رقم' 
                        : '8+ chars, uppercase, lowercase, number'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={companyForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                          {...field}
                          className="pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جاري التسجيل...' : 'Registering...'}
                  </>
                ) : (
                  language === 'ar' ? 'تسجيل الشركة' : 'Register Company'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};


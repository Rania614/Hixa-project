/**
 * AuthModal Component
 * 
 * Handles login and registration forms.
 * Removed: partnerType localStorage logic, hasCompanyName, hasContactPersonInBio checks
 * 
 * Security:
 * - Only saves user.role from backend response to localStorage
 * - Updates AppContext with userRole after successful auth
 * - Does NOT use partnerType or other fields to determine role
 */

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Handshake, X, Wrench, Building, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { CountryPhoneInput } from '@/components/shared/CountryPhoneInput';
import { useForm } from 'react-hook-form';
import { UserRole } from '@/context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void; // Changed: no longer passes partnerType
  role: 'client' | 'partner' | null;
  initialMode?: 'login' | 'register';
  initialPartnerType?: 'engineer' | 'company' | null;
}

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, role, initialMode = 'login', initialPartnerType = null }: AuthModalProps) => {
  const { setIsAuthenticated, setUserRole, language } = useApp();
  // Start with initialMode (login or register)
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
      // Reset form fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setCompanyName('');
      setSpecialization('');
      setLicenseNumber('');
      // Set partner type from URL if provided, otherwise null
      // If mode is register and partnerType is provided, set it immediately
      if (initialMode === 'register' && initialPartnerType) {
        setPartnerType(initialPartnerType);
      } else {
        setPartnerType(null);
      }
      setShowPassword(false);
      setShowConfirmPassword(false);
      // Reset form
      reset();
    }
  }, [isOpen, initialMode, initialPartnerType]);
  
  const { control, watch, formState: { errors }, reset } = useForm();
  // partnerType is only used for UI form selection during registration, NOT for role determination
  const [partnerType, setPartnerType] = useState<'engineer' | 'company' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Watch phone and countryCode from form
  const phone = watch('phone');
  const countryCode = watch('countryCode');

  // Helper function to extract and normalize role from user data
  const extractRole = (userData: any): UserRole => {
    if (!userData || !userData.role) return null;
    
    const roleStr = userData.role.toLowerCase();
    if (roleStr === 'client' || roleStr === 'customer') return 'client';
    if (roleStr === 'engineer' || roleStr === 'partner') return 'engineer';
    if (roleStr === 'company') return 'company';
    if (roleStr === 'admin') return 'admin';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (isLogin) {
      // Login
      try {
        setLoading(true);
        const response = await http.post('/auth/login', { email, password });
        
        if (response.data && response.data.token) {
          // Save token
          localStorage.setItem('token', response.data.token);
          
          // Save user data from backend response
          const userData = response.data.user;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            // Extract role from backend response and update context
            const role = extractRole(userData);
            setUserRole(role);
          }
          
          // Set authenticated
          setIsAuthenticated(true);
          
          // Call onAuthSuccess - AuthPage will handle redirect based on role in context
          setTimeout(() => {
            onAuthSuccess();
          }, 100);
        } else {
          setError('Invalid response from server');
        }
      } catch (err: any) {
        console.error('Login failed:', err);
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || 
                           'Login failed. Please check your credentials.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Registration
      // Trim and validate fields
      const trimmedName = name?.trim() || '';
      const trimmedEmail = email?.trim() || '';
      const trimmedPassword = password?.trim() || '';
      const trimmedConfirmPassword = confirmPassword?.trim() || '';
      
      // Validate required fields
      if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
        setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
        return;
      }
      
      // Validate password match
      if (trimmedPassword !== trimmedConfirmPassword) {
        setError(language === 'ar' ? 'تأكيد كلمة المرور غير متطابق' : 'Passwords do not match');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError(language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format');
        return;
      }
      
      // Validate phone and countryCode
      if (!phone || !countryCode) {
        setError(language === 'ar' ? 'رقم الهاتف ورمز الدولة مطلوبان' : 'Phone number and country code are required');
        return;
      }

      try {
        setLoading(true);
        
        // Determine the correct endpoint and prepare data based on role and partnerType (UI only)
        let endpoint = '';
        let registrationData: any = {
          email: trimmedEmail,
          password: trimmedPassword,
          confirmPassword: trimmedConfirmPassword, // Backend requires confirmPassword
          phone: phone,
          countryCode: countryCode,
        };

        if (role === 'client') {
          // Client registration - Backend expects: fullName, email, password, confirmPassword
          endpoint = '/auth/register/client';
          // Ensure name is provided and not empty (minimum 2 characters)
          if (!trimmedName || trimmedName.length < 2) {
            setError(language === 'ar' ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Full name must be at least 2 characters');
            setLoading(false);
            return;
          }
          if (trimmedName.length > 100) {
            setError(language === 'ar' ? 'الاسم يجب ألا يتجاوز 100 حرف' : 'Full name must not exceed 100 characters');
            setLoading(false);
            return;
          }
          registrationData.fullName = trimmedName;
          
          // Validate password strength (8+ chars, uppercase, lowercase, number)
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          if (!passwordRegex.test(trimmedPassword)) {
            setError(language === 'ar' 
              ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير، حرف صغير، ورقم' 
              : 'Password must be at least 8 characters and contain uppercase, lowercase, and a number');
            setLoading(false);
            return;
          }
          
          // Normalize email to lowercase
          registrationData.email = trimmedEmail.toLowerCase();
        } else if (role === 'partner') {
          if (partnerType === 'engineer') {
            // Engineer registration - Backend expects: fullName, specialization, licenseNumber, email, password, confirmPassword
            endpoint = '/auth/register/engineer';
            // Ensure name is provided and not empty
            if (!trimmedName || trimmedName.length === 0) {
              setError('Full name is required');
              setLoading(false);
              return;
            }
            registrationData.fullName = trimmedName;
            
            // Check if specialization is required
            const trimmedSpecialization = specialization?.trim() || '';
            if (!trimmedSpecialization) {
              setError('Specialization is required');
              setLoading(false);
              return;
            }
            registrationData.specialization = trimmedSpecialization;
            
            // Check if licenseNumber is required
            const trimmedLicenseNumber = licenseNumber?.trim() || '';
            if (!trimmedLicenseNumber) {
              setError('License number is required');
              setLoading(false);
              return;
            }
            registrationData.licenseNumber = trimmedLicenseNumber;
          } else if (partnerType === 'company') {
            // Company registration
            endpoint = '/auth/register/company';
            // Ensure name and companyName are provided
            if (!trimmedName || trimmedName.length === 0) {
              setError('Contact person name is required');
              setLoading(false);
              return;
            }
            if (!companyName?.trim()) {
              setError('Company name is required');
              setLoading(false);
              return;
            }
            // Backend expects: companyName and contactPersonName
            registrationData.companyName = companyName.trim();
            registrationData.contactPersonName = trimmedName;
          } else {
            setError('Please select a partner type');
            setLoading(false);
            return;
          }
        } else {
          setError('Invalid role');
          setLoading(false);
          return;
        }
        
        const response = await http.post(endpoint, registrationData);
        
        if (response.data && response.data.token) {
          // Save token
          localStorage.setItem('token', response.data.token);
          
          // Save user data from backend response
          const userData = response.data.user;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            // Extract role from backend response and update context
            const role = extractRole(userData);
            setUserRole(role);
          }
          
          // Set authenticated
          setIsAuthenticated(true);
          
          // Call onAuthSuccess - AuthPage will handle redirect based on role in context
          setTimeout(() => {
            onAuthSuccess();
          }, 100);
        } else {
          setError(language === 'ar' ? 'تم التسجيل بنجاح لكن لم يتم استلام رمز الوصول' : 'Registration successful but no token received');
        }
      } catch (err: any) {
        console.error('❌ Registration failed:', err);
        
        // Extract error message
        let errorMessage = '';
        
        if (err.response?.status === 400) {
          const errorData = err.response?.data;
          if (errorData?.errors) {
            const errorMessages: string[] = [];
            Object.keys(errorData.errors).forEach((key) => {
              const fieldError = errorData.errors[key];
              if (fieldError?.message) {
                errorMessages.push(fieldError.message);
              } else if (typeof fieldError === 'string') {
                errorMessages.push(fieldError);
              }
            });
            errorMessage = errorMessages.length > 0 
              ? errorMessages.join(', ') 
              : errorData.message || errorData.error || (language === 'ar' ? 'خطأ في التحقق. يرجى التحقق من جميع الحقول المطلوبة.' : 'Validation error. Please check all required fields.');
          } else {
            errorMessage = errorData?.message || 
                          errorData?.error || 
                          (language === 'ar' ? 'بيانات غير صالحة. يرجى التحقق من جميع الحقول المطلوبة والمحاولة مرة أخرى.' : 'Invalid data. Please check all required fields and try again.');
          }
        } else if (err.response?.status === 409) {
          errorMessage = err.response?.data?.message || 
                        (language === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already exists');
        } else if (err.response?.status === 429) {
          errorMessage = err.response?.data?.message || 
                        (language === 'ar' ? 'تم تجاوز عدد محاولات الدخول المسموح بها، يرجى المحاولة لاحقاً' : 'Too many requests. Please try again later.');
        } else {
          errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message || 
                        (language === 'ar' ? 'فشل التسجيل. يرجى المحاولة مرة أخرى.' : 'Registration failed. Please try again.');
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegisterClick = () => {
    setIsLogin(false);
    if (role === 'partner') {
      setPartnerType(null); // Reset partner type selection for UI
    }
  };

  const selectPartnerType = (type: 'engineer' | 'company') => {
    setPartnerType(type);
  };

  const handleBack = () => {
    if (!isLogin && role === 'partner' && !partnerType) {
      // If on partner type selection, go back to login/register choice
      setIsLogin(true);
    } else if (!isLogin && partnerType) {
      // If on registration form, go back to partner type selection
      setPartnerType(null);
    } else {
      // Otherwise, close the modal
      onClose();
    }
  };

  // ... existing JSX code continues (keep all the form UI) ...
  // Note: partnerType is still used for UI to show engineer/company registration forms
  // but it's NOT used to determine role - role comes from backend response

  // Rest of the component JSX remains the same - only the auth logic changed
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{isLogin ? (language === 'ar' ? 'تسجيل الدخول' : 'Login') : (language === 'ar' ? 'التسجيل' : 'Register')}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {isLogin 
            ? (language === 'ar' ? 'أدخل بيانات الدخول الخاصة بك' : 'Enter your login credentials')
            : (language === 'ar' ? 'قم بإنشاء حساب جديد' : 'Create a new account')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Partner type selection UI (only for registration, UI only) */}
        {!isLogin && role === 'partner' && !partnerType && (
          <div className="space-y-4 mb-4">
            <p className="text-sm font-medium">{language === 'ar' ? 'اختر نوع الحساب' : 'Select account type'}</p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => selectPartnerType('engineer')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <Wrench className="h-6 w-6 mb-2" />
                {language === 'ar' ? 'مهندس' : 'Engineer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => selectPartnerType('company')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <Building className="h-6 w-6 mb-2" />
                {language === 'ar' ? 'شركة' : 'Company'}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="text-sm font-medium mb-2 block">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
              required
              disabled={loading}
            />
          </div>

          {/* Password field */}
          <div>
            <label className="text-sm font-medium mb-2 block">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Registration-specific fields */}
          {!isLogin && (
            <>
              {/* Confirm Password (registration only) */}
              <div>
                <label className="text-sm font-medium mb-2 block">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Name field */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {role === 'client' 
                    ? (language === 'ar' ? 'الاسم الكامل' : 'Full Name')
                    : role === 'partner' && partnerType === 'company'
                    ? (language === 'ar' ? 'اسم الشخص المسؤول' : 'Contact Person Name')
                    : (language === 'ar' ? 'الاسم الكامل' : 'Full Name')
                  }
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل الاسم' : 'Enter name'}
                  required
                  disabled={loading}
                />
              </div>

              {/* Company Name (for company registration only) */}
              {role === 'partner' && partnerType === 'company' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{language === 'ar' ? 'اسم الشركة' : 'Company Name'}</label>
                  <Input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل اسم الشركة' : 'Enter company name'}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* Specialization (for engineer registration only) */}
              {role === 'partner' && partnerType === 'engineer' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{language === 'ar' ? 'التخصص' : 'Specialization'}</label>
                  <Input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل التخصص' : 'Enter specialization'}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* License Number (for engineer registration only) */}
              {role === 'partner' && partnerType === 'engineer' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{language === 'ar' ? 'رقم الترخيص' : 'License Number'}</label>
                  <Input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل رقم الترخيص' : 'Enter license number'}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              {/* Phone and Country Code */}
              <CountryPhoneInput 
                control={control} 
                countryCodeName="countryCode"
                phoneName="phone"
                label={language === 'ar' ? 'رقم الجوال' : 'Phone Number'}
                required={true}
                errors={errors}
              />
            </>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (!isLogin && role === 'partner' && !partnerType)}
            className="w-full"
          >
            {loading 
              ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...')
              : isLogin 
              ? (language === 'ar' ? 'تسجيل الدخول' : 'Login')
              : (language === 'ar' ? 'التسجيل' : 'Register')
            }
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin 
                ? (language === 'ar' ? 'ليس لديك حساب؟ سجل الآن' : "Don't have an account? Register")
                : (language === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Login')
              }
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

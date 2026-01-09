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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (partnerType?: 'engineer' | 'company') => void;
  role: 'client' | 'partner' | null;
  initialMode?: 'login' | 'register';
}

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, role, initialMode = 'login' }: AuthModalProps) => {
  const { setIsAuthenticated, language } = useApp();
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
      setPartnerType(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
      // Reset form
      reset();
    }
  }, [isOpen, initialMode]);
  const { control, watch, formState: { errors }, reset } = useForm();
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
          
          // Set authenticated FIRST to ensure ProtectedRoute allows access
          setIsAuthenticated(true);
          
          // Save user data if available
          const userData = response.data.user;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Save partnerType if it's a company or engineer
            const userRole = userData.role || '';
            const bio = userData.bio || '';
            const hasCompanyName = userData.companyName !== undefined && userData.companyName !== null;
            const hasContactPersonInBio = bio && bio.includes('Contact Person:');
            
            // Check if it's a company (companies may have role: "client" in database)
            if (userRole === 'company' || 
                userRole === 'Company' ||
                userData.isCompany === true ||
                hasCompanyName ||
                hasContactPersonInBio) {
              localStorage.setItem('partnerType', 'company');
              onAuthSuccess('company');
              return;
            }
            
            // Check if it's an engineer
            if (userRole === 'engineer' || 
                userRole === 'Engineer' ||
                userRole === 'partner' ||
                userData.isEngineer === true) {
              localStorage.setItem('partnerType', 'engineer');
              onAuthSuccess('engineer');
              return;
            }
          }
          
          // Call onAuthSuccess without partnerType - AuthPage will determine from user data
          onAuthSuccess();
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
        
        // Determine the correct endpoint and prepare data based on role
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
          // Backend expects 'fullName' not 'name'
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
            // Backend expects 'fullName' not 'name'
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
            // Backend expects only: companyName and contactPersonName (NOT name)
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

        // Log registration data for debugging
        console.log('📤 Registration data:', { 
          endpoint, 
          registrationData,
          hasName: !!registrationData.name,
          hasEmail: !!registrationData.email,
          hasPassword: !!registrationData.password,
          hasSpecialization: !!registrationData.specialization,
          hasLicenseNumber: !!registrationData.licenseNumber,
        });
        
        const response = await http.post(endpoint, registrationData);
        
        if (response.data && response.data.token) {
          // Save token
          localStorage.setItem('token', response.data.token);
          
          // Save user data if available
          const userData = response.data.user;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
          
          // Set authenticated FIRST to ensure ProtectedRoute allows access
          setIsAuthenticated(true);
          
          // Save partnerType in localStorage if it's a partner registration
          if (role === 'partner' && partnerType) {
            localStorage.setItem('partnerType', partnerType);
          }
          
          // Call onAuthSuccess which will navigate to appropriate dashboard
          // Pass partnerType to help with routing
          console.log('✅ Registration successful, redirecting with partnerType:', partnerType);
          onAuthSuccess(partnerType);
        } else {
          setError(language === 'ar' ? 'تم التسجيل بنجاح لكن لم يتم استلام رمز الوصول' : 'Registration successful but no token received');
        }
      } catch (err: any) {
        
        // Extract error message from various possible locations
        let errorMessage = '';
        
        if (err.response?.status === 400) {
          // Bad Request - usually validation error
          const errorData = err.response?.data;
          
          // Check for validation errors
          if (errorData?.errors) {
            // Handle multiple validation errors
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
          // Conflict - Email already exists
          errorMessage = err.response?.data?.message || 
                        (language === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already exists');
        } else if (err.response?.status === 429) {
          // Too Many Requests - Rate limiting
          errorMessage = err.response?.data?.message || 
                        (language === 'ar' ? 'تم تجاوز عدد محاولات الدخول المسموح بها، يرجى المحاولة لاحقاً' : 'Too many requests. Please try again later.');
        } else {
          errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.response?.data?.errors?.fullName?.message ||
                        err.response?.data?.errors?.name?.message ||
                        err.response?.data?.errors?.email?.message ||
                        err.response?.data?.errors?.password?.message ||
                        err.response?.data?.errors?.confirmPassword?.message ||
                        err.response?.data?.errors?.specialization?.message ||
                        err.response?.data?.errors?.licenseNumber?.message ||
                        (err.response?.data?.errors && (Object.values(err.response.data.errors)[0] as any)?.message) ||
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
      setPartnerType(null); // Reset partner type selection
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md max-h-[90vh] glass-card relative flex flex-col">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={handleBack}
          variant="ghost"
          className="absolute top-4 left-4 flex items-center gap-1 z-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <CardHeader className="text-center flex-shrink-0">
          <div className="mx-auto mb-4 w-16 h-16 bg-gold/10 flex items-center justify-center hexagon">
            {role === 'client' ? (
              <User className="h-8 w-8 text-gold" />
            ) : role === 'partner' && partnerType === 'engineer' ? (
              <Wrench className="h-8 w-8 text-gold" />
            ) : role === 'partner' && partnerType === 'company' ? (
              <Building className="h-8 w-8 text-gold" />
            ) : (
              <Handshake className="h-8 w-8 text-gold" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {role === 'client' 
              ? 'LOG IN' 
              : role === 'partner' && partnerType === 'engineer'
              ? 'Engineer Registration'
              : role === 'partner' && partnerType === 'company'
              ? 'Company Registration'
              : role === 'partner'
              ? 'Partner Portal'
              : 'Platform Access'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to your account' 
              : role === 'partner' && !partnerType
              ? 'Select your partner type'
              : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="overflow-y-auto flex-1">
          {isLogin ? (
            <>
              <div className="flex gap-2 mb-6">
                <Button
                  variant="default"
                  className="bg-gold hover:bg-gold-dark"
                  size="sm"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegisterClick}
                  size="sm"
                >
                  Register
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-secondary/50"
                    autoComplete="email"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-secondary/50 pr-10"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </>
          ) : (
            role === 'partner' && !partnerType ? (
              // Partner type selection
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Please select your partner type to continue registration
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    onClick={() => selectPartnerType('engineer')}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Wrench className="h-8 w-8 text-gold" />
                    <span className="font-semibold">Engineer</span>
                    <span className="text-xs text-muted-foreground">Individual professional</span>
                  </Button>
                  <Button
                    onClick={() => selectPartnerType('company')}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Building className="h-8 w-8 text-gold" />
                    <span className="font-semibold">Company</span>
                    <span className="text-xs text-muted-foreground">Business organization</span>
                  </Button>
                </div>
              </div>
            ) : (
              // Registration form
              <>
                <div className="flex gap-2 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsLogin(true)}
                    size="sm"
                  >
                    Login
                  </Button>
                  <Button
                    variant="default"
                    className="bg-gold hover:bg-gold-dark"
                    size="sm"
                  >
                    Register
                  </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {role === 'partner' && partnerType === 'engineer' ? (
                    // Engineer registration form
                    <>
                      <div>
                        <label htmlFor="engineerName" className="block text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <Input
                          id="engineerName"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="bg-secondary/50"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="specialization" className="block text-sm font-medium mb-2">
                          Specialization
                        </label>
                        <Input
                          id="specialization"
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g., Civil Engineer, Electrical Engineer"
                          className="bg-secondary/50"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="licenseNumber" className="block text-sm font-medium mb-2">
                          License Number
                        </label>
                        <Input
                          id="licenseNumber"
                          type="text"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          placeholder="Professional license number"
                          className="bg-secondary/50"
                          required
                        />
                      </div>
                    </>
                  ) : role === 'partner' && partnerType === 'company' ? (
                    // Company registration form
                    <>
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                          Company Name
                        </label>
                        <Input
                          id="companyName"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Your company name"
                          className="bg-secondary/50"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="contactName" className="block text-sm font-medium mb-2">
                          Contact Person Name
                        </label>
                        <Input
                          id="contactName"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name of contact person"
                          className="bg-secondary/50"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    // Client registration form
                    <div>
                      <label htmlFor="clientName" className="block text-sm font-medium mb-2">
                        {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <Input
                        id="clientName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Your full name'}
                        className="bg-secondary/50"
                        required
                        minLength={2}
                        maxLength={100}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' ? 'من 2 إلى 100 حرف' : '2 to 100 characters'}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="regEmail" className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <Input
                      id="regEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-secondary/50"
                      autoComplete="email"
                      required
                    />
                  </div>
                  
                  <CountryPhoneInput
                    control={control}
                    countryCodeName="countryCode"
                    phoneName="phone"
                    label="Phone Number"
                    errors={errors}
                    required={true}
                  />
                  
                  <div>
                    <label htmlFor="regPassword" className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <Input
                        id="regPassword"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={language === 'ar' ? 'أنشئ كلمة مرور' : 'Create a password'}
                        className="bg-secondary/50 pr-10"
                        autoComplete="new-password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? (language === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (language === 'ar' ? 'إظهار كلمة المرور' : 'Show password')}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {role === 'client' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' 
                          ? 'يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير، حرف صغير، ورقم' 
                          : 'Must be at least 8 characters with uppercase, lowercase, and a number'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                        className="bg-secondary/50 pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? (language === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (language === 'ar' ? 'إظهار كلمة المرور' : 'Show password')}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};
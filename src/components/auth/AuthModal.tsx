import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Handshake, X, Wrench, Building, ArrowLeft } from 'lucide-react';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  role: 'client' | 'partner' | null;
  initialMode?: 'login' | 'register';
}

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, role, initialMode = 'login' }: AuthModalProps) => {
  const { setIsAuthenticated } = useApp();
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
    }
  }, [isOpen, initialMode]);
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
          
          // Set authenticated
          setIsAuthenticated(true);
          
          // Call onAuthSuccess which will navigate to appropriate dashboard
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
      
      if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (trimmedPassword !== trimmedConfirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        setLoading(true);
        
        // Determine the correct endpoint and prepare data based on role
        let endpoint = '';
        let registrationData: any = {
          email: trimmedEmail,
          password: trimmedPassword,
          confirmPassword: trimmedConfirmPassword,
        };

        if (role === 'client') {
          // Client registration
          endpoint = '/auth/register/client';
          // Ensure name is provided and not empty
          if (!trimmedName || trimmedName.length === 0) {
            setError('Full name is required');
            setLoading(false);
            return;
          }
          registrationData.name = trimmedName;
          if (companyName?.trim()) {
            registrationData.companyName = companyName.trim();
          }
        } else if (role === 'partner') {
          if (partnerType === 'engineer') {
            // Engineer registration
            endpoint = '/auth/register/engineer';
            // Ensure name is provided and not empty
            if (!trimmedName || trimmedName.length === 0) {
              setError('Full name is required');
              setLoading(false);
              return;
            }
            registrationData.name = trimmedName;
            if (specialization?.trim()) {
              registrationData.specialization = specialization.trim();
            }
            if (licenseNumber?.trim()) {
              registrationData.licenseNumber = licenseNumber.trim();
            }
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
        console.log('Registration data:', { endpoint, registrationData });
        
        const response = await http.post(endpoint, registrationData);
        
        if (response.data && response.data.token) {
          // Save token
          localStorage.setItem('token', response.data.token);
          
          // Set authenticated
          setIsAuthenticated(true);
          
          // Call onAuthSuccess which will navigate to appropriate dashboard
          onAuthSuccess();
        } else {
          setError('Registration successful but no token received');
        }
      } catch (err: any) {
        console.error('Registration failed:', err);
        console.error('Error response:', err.response?.data);
        
        // Extract error message from various possible locations
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.response?.data?.errors?.name?.message ||
                           err.response?.data?.errors?.email?.message ||
                           err.response?.data?.errors?.password?.message ||
                           (err.response?.data?.errors && Object.values(err.response.data.errors)[0]?.message) ||
                           err.message || 
                           'Registration failed. Please try again.';
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
      <Card className="w-full max-w-md glass-card relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={handleBack}
          variant="ghost"
          className="absolute top-4 left-4 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <CardHeader className="text-center">
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
        
        <CardContent>
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
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-secondary/50"
                    autoComplete="current-password"
                    required
                  />
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
                        Full Name
                      </label>
                      <Input
                        id="clientName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="bg-secondary/50"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="regEmail" className="block text-sm font-medium mb-2">
                      Email Address
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
                  
                  <div>
                    <label htmlFor="regPassword" className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <Input
                      id="regPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="bg-secondary/50"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="bg-secondary/50"
                      autoComplete="new-password"
                      required
                    />
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
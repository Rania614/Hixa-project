import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { businessCategories } from '@/constants/filters';

interface AddUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userForm: any;
    setUserForm: (form: any) => void;
    handleAddUser: (e: React.FormEvent) => void;
    adding: boolean;
    countries: { value: string; label: string }[];
    getCitiesForCountry: (countryCode: string) => any[];
}

export const AddUserModal = ({
    open,
    onOpenChange,
    userForm,
    setUserForm,
    handleAddUser,
    adding,
    countries,
    getCitiesForCountry,
}: AddUserModalProps) => {
    const { language } = useApp();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {language === 'en' ? 'Add New User' : 'إضافة مستخدم جديد'}
                    </DialogTitle>
                    <DialogDescription>
                        {language === 'en'
                            ? 'Fill in the information to create a new user account'
                            : 'املأ المعلومات لإنشاء حساب مستخدم جديد'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {userForm.role !== 'company' && (
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    {language === 'en' ? 'Name' : 'الاسم'} *
                                </Label>
                                <Input
                                    id="name"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    required={userForm.role !== 'company'}
                                    placeholder={language === 'en' ? 'Full name' : 'الاسم الكامل'}
                                />
                            </div>
                        )}
                        {userForm.role === 'company' && <div />}

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                {language === 'en' ? 'Email' : 'البريد الإلكتروني'} *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={userForm.email}
                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                required
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {language === 'en' ? 'Password' : 'كلمة المرور'} *
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={userForm.password}
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                required
                                placeholder={language === 'en' ? 'Password' : 'كلمة المرور'}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                {language === 'en' ? 'Phone' : 'الهاتف'}
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={userForm.phone}
                                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                                placeholder={language === 'en' ? 'Phone number' : 'رقم الهاتف'}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                {language === 'en' ? 'Role' : 'الدور'} *
                            </Label>
                            <Select
                                value={userForm.role}
                                onValueChange={(value: 'engineer' | 'client' | 'company') => {
                                    setUserForm({
                                        ...userForm,
                                        role: value,
                                        specialization: '',
                                        nationalId: '',
                                        companyName: '',
                                        contactPersonName: '',
                                        city: '',
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="engineer">{language === 'en' ? 'Engineer' : 'مهندس'}</SelectItem>
                                    <SelectItem value="client">{language === 'en' ? 'Client' : 'عميل'}</SelectItem>
                                    <SelectItem value="company">{language === 'en' ? 'Company' : 'شركة'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">
                                {language === 'en' ? 'Status' : 'الحالة'}
                            </Label>
                            <Select
                                value={userForm.status}
                                onValueChange={(value: any) => setUserForm({ ...userForm, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{language === 'en' ? 'Active' : 'نشط'}</SelectItem>
                                    <SelectItem value="pending">{language === 'en' ? 'Pending' : 'قيد الانتظار'}</SelectItem>
                                    <SelectItem value="suspended">{language === 'en' ? 'Suspended' : 'معلق'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Role-specific fields */}
                    {userForm.role === 'engineer' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="specialization">
                                    {language === 'en' ? 'Specialization' : 'التخصص'} *
                                </Label>
                                <Select
                                    value={userForm.specialization || undefined}
                                    onValueChange={(value) => setUserForm({ ...userForm, specialization: value })}
                                >
                                    <SelectTrigger id="specialization">
                                        <SelectValue placeholder={language === 'en' ? 'Select specialization' : 'اختر التخصص'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {businessCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nationalId">
                                    {language === 'en' ? 'License Number' : 'رقم الترخيص'} *
                                </Label>
                                <Input
                                    id="nationalId"
                                    value={userForm.nationalId}
                                    onChange={(e) => setUserForm({ ...userForm, nationalId: e.target.value })}
                                    required
                                    placeholder={language === 'en' ? 'License number' : 'رقم الترخيص'}
                                />
                            </div>
                        </div>
                    )}

                    {userForm.role === 'company' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">
                                    {language === 'en' ? 'Company Name' : 'اسم الشركة'} *
                                </Label>
                                <Input
                                    id="companyName"
                                    value={userForm.companyName}
                                    onChange={(e) => setUserForm({ ...userForm, companyName: e.target.value })}
                                    required
                                    placeholder={language === 'en' ? 'Company name' : 'اسم الشركة'}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPersonName">
                                    {language === 'en' ? 'Contact Person' : 'الشخص المسؤول'} *
                                </Label>
                                <Input
                                    id="contactPersonName"
                                    value={userForm.contactPersonName}
                                    onChange={(e) => setUserForm({ ...userForm, contactPersonName: e.target.value })}
                                    required
                                    placeholder={language === 'en' ? 'Contact person name' : 'اسم الشخص المسؤول'}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">
                                {language === 'en' ? 'Country' : 'الدولة'}
                            </Label>
                            <Select
                                value={userForm.country}
                                onValueChange={(value) => setUserForm({ ...userForm, country: value, city: '' })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={language === 'en' ? 'Select country' : 'اختر الدولة'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.value} value={country.value}>
                                            {country.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">
                                {language === 'en' ? 'City' : 'المدينة'}
                            </Label>
                            <Select
                                value={userForm.city}
                                onValueChange={(value) => setUserForm({ ...userForm, city: value })}
                                disabled={!userForm.country}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={language === 'en' ? 'Select city' : 'اختر المدينة'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getCitiesForCountry(userForm.country).map((city) => (
                                        <SelectItem key={city.value} value={city.value}>
                                            {city.label[language]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            {language === 'en' ? 'Cancel' : 'إلغاء'}
                        </Button>
                        <Button
                            type="submit"
                            className="bg-cyan hover:bg-cyan-dark"
                            disabled={adding}
                        >
                            {adding ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {language === 'en' ? 'Adding...' : 'جاري الإضافة...'}
                                </>
                            ) : (
                                language === 'en' ? 'Add User' : 'إضافة مستخدم'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

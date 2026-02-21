import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Phone, MapPin, UserCheck, Edit } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ViewUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    viewingUser: any;
    loadingUser: boolean;
    getRoleLabel: (role: string) => string;
    getStatusBadge: (status: string) => React.ReactNode;
    getUserId: (user: any) => string;
    handleEditUser: (id: string) => void;
}

export const ViewUserModal = ({
    open,
    onOpenChange,
    viewingUser,
    loadingUser,
    getRoleLabel,
    getStatusBadge,
    getUserId,
    handleEditUser,
}: ViewUserModalProps) => {
    const { language } = useApp();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {language === 'en' ? 'User Details' : 'تفاصيل المستخدم'}
                    </DialogTitle>
                    <DialogDescription>
                        {language === 'en'
                            ? 'View user information and details'
                            : 'عرض معلومات وتفاصيل المستخدم'}
                    </DialogDescription>
                </DialogHeader>

                {loadingUser ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan" />
                    </div>
                ) : viewingUser ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b">
                            <div className="w-16 h-16 rounded-full bg-cyan flex items-center justify-center text-white font-semibold text-xl">
                                {viewingUser.avatar ? (
                                    <img
                                        src={typeof viewingUser.avatar === 'string' ? viewingUser.avatar : viewingUser.avatar?.url}
                                        alt={viewingUser.name || viewingUser.fullName || viewingUser.contactPersonName || 'User'}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl">
                                        {(viewingUser.name || viewingUser.fullName || viewingUser.contactPersonName || 'U').charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="text-xl font-semibold flex items-center gap-2">
                                    {viewingUser.name || viewingUser.fullName || viewingUser.contactPersonName || 'N/A'}
                                    {viewingUser.verified && (
                                        <UserCheck className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">{viewingUser.email}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">{language === 'en' ? 'Role' : 'الدور'}</Label>
                                    <div className="mt-1 font-medium">{getRoleLabel(viewingUser.role)}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">{language === 'en' ? 'Status' : 'الحالة'}</Label>
                                    <div className="mt-1">{getStatusBadge(viewingUser.status)}</div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 text-sm">{language === 'en' ? 'Contact Information' : 'معلومات الاتصال'}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">{language === 'en' ? 'Email' : 'البريد الإلكتروني'}</Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {viewingUser.email}
                                        </div>
                                    </div>
                                    {viewingUser.phone && (
                                        <div>
                                            <Label className="text-muted-foreground">{language === 'en' ? 'Phone' : 'الهاتف'}</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {viewingUser.countryCode && <span className="text-muted-foreground">{viewingUser.countryCode}</span>}
                                                {viewingUser.phone}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 text-sm">{language === 'en' ? 'Personal Information' : 'المعلومات الشخصية'}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {(viewingUser.name || viewingUser.fullName) && (
                                        <div>
                                            <Label className="text-muted-foreground">{language === 'en' ? 'Full Name' : 'الاسم الكامل'}</Label>
                                            <div className="mt-1 font-medium">{viewingUser.name || viewingUser.fullName}</div>
                                        </div>
                                    )}
                                    {viewingUser.nationalId && (
                                        <div>
                                            <Label className="text-muted-foreground">{language === 'en' ? 'National ID' : 'الهوية الوطنية'}</Label>
                                            <div className="mt-1">{viewingUser.nationalId}</div>
                                        </div>
                                    )}
                                    {viewingUser.country && (
                                        <div>
                                            <Label className="text-muted-foreground">{language === 'en' ? 'Country' : 'الدولة'}</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {viewingUser.country}
                                            </div>
                                        </div>
                                    )}
                                    {viewingUser.city && (
                                        <div>
                                            <Label className="text-muted-foreground">{language === 'en' ? 'City' : 'المدينة'}</Label>
                                            <div className="mt-1">{viewingUser.city}</div>
                                        </div>
                                    )}
                                    {viewingUser.location && (
                                        <div className="col-span-2">
                                            <Label className="text-muted-foreground">{language === 'en' ? 'Location' : 'الموقع'}</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                {viewingUser.location}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {viewingUser.role === 'company' && (viewingUser.companyName || viewingUser.contactPersonName) && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3 text-sm">{language === 'en' ? 'Company Information' : 'معلومات الشركة'}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {viewingUser.companyName && (
                                            <div>
                                                <Label className="text-muted-foreground">{language === 'en' ? 'Company Name' : 'اسم الشركة'}</Label>
                                                <div className="mt-1 font-medium">{viewingUser.companyName}</div>
                                            </div>
                                        )}
                                        {viewingUser.contactPersonName && (
                                            <div>
                                                <Label className="text-muted-foreground">{language === 'en' ? 'Contact Person' : 'الشخص المسؤول'}</Label>
                                                <div className="mt-1">{viewingUser.contactPersonName}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {viewingUser.role === 'engineer' && (viewingUser.specialization || (Array.isArray(viewingUser.specializations) && viewingUser.specializations.length > 0) || viewingUser.licenseNumber) && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3 text-sm">{language === 'en' ? 'Professional Information' : 'المعلومات المهنية'}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(viewingUser.specialization || (Array.isArray(viewingUser.specializations) && viewingUser.specializations.length > 0)) && (
                                            <div>
                                                <Label className="text-muted-foreground">{language === 'en' ? 'Specialization' : 'التخصص'}</Label>
                                                <div className="mt-1 font-medium">
                                                    {viewingUser.specialization
                                                        ? viewingUser.specialization
                                                        : Array.isArray(viewingUser.specializations)
                                                            ? viewingUser.specializations.join(', ')
                                                            : '—'}
                                                </div>
                                            </div>
                                        )}
                                        {viewingUser.licenseNumber && (
                                            <div>
                                                <Label className="text-muted-foreground">{language === 'en' ? 'License Number' : 'رقم الرخصة'}</Label>
                                                <div className="mt-1">{viewingUser.licenseNumber}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {viewingUser.bio && (
                                <div className="border-t pt-4">
                                    <Label className="text-muted-foreground">{language === 'en' ? 'Bio' : 'نبذة'}</Label>
                                    <div className="mt-1 text-sm">{viewingUser.bio}</div>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 text-sm">{language === 'en' ? 'Account Information' : 'معلومات الحساب'}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {(viewingUser.joinDate || viewingUser.createdAt) && (
                                        <div>
                                            <Label className="text-muted-foreground">{language === 'en' ? 'Join Date' : 'تاريخ الانضمام'}</Label>
                                            <div className="mt-1">
                                                {viewingUser.joinDate
                                                    ? new Date(viewingUser.joinDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA')
                                                    : viewingUser.createdAt
                                                        ? new Date(viewingUser.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA')
                                                        : 'N/A'}
                                            </div>
                                        </div>
                                    )}
                                    {viewingUser.verified !== undefined && (
                                        <div>
                                            <Label className="text-muted-foreground">{language === 'en' ? 'Verified' : 'متحقق'}</Label>
                                            <div className="mt-1">
                                                {viewingUser.verified ? (
                                                    <Badge className="bg-green-500/20 text-green-500">
                                                        {language === 'en' ? 'Yes' : 'نعم'}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-gray-500/20 text-gray-500">
                                                        {language === 'en' ? 'No' : 'لا'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {language === 'en' ? 'Close' : 'إغلاق'}
                    </Button>
                    {viewingUser && (
                        <Button
                            type="button"
                            className="bg-cyan hover:bg-cyan-dark"
                            onClick={() => {
                                const userId = getUserId(viewingUser);
                                if (userId) {
                                    onOpenChange(false);
                                    handleEditUser(userId);
                                }
                            }}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {language === 'en' ? 'Edit User' : 'تعديل المستخدم'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface EditUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editForm: any;
    setEditForm: (form: any) => void;
    handleUpdateUser: (e: React.FormEvent) => void;
    updating: boolean;
}

export const EditUserModal = ({
    open,
    onOpenChange,
    editForm,
    setEditForm,
    handleUpdateUser,
    updating,
}: EditUserModalProps) => {
    const { language } = useApp();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {language === 'en' ? 'Edit User' : 'تعديل المستخدم'}
                    </DialogTitle>
                    <DialogDescription>
                        {language === 'en'
                            ? 'Update user information and account settings'
                            : 'تحديث معلومات المستخدم وإعدادات الحساب'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">
                                {language === 'en' ? 'Name' : 'الاسم'}
                            </Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">
                                {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                            </Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">
                                {language === 'en' ? 'Phone' : 'الهاتف'}
                            </Label>
                            <Input
                                id="edit-phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-location">
                                {language === 'en' ? 'Location' : 'الموقع'}
                            </Label>
                            <Input
                                id="edit-location"
                                value={editForm.location}
                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">
                                {language === 'en' ? 'Role' : 'الدور'}
                            </Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(value: any) => setEditForm({ ...editForm, role: value })}
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
                            <Label htmlFor="edit-status">
                                {language === 'en' ? 'Status' : 'الحالة'}
                            </Label>
                            <Select
                                value={editForm.status}
                                onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
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

                    {editForm.role === 'company' && (
                        <div className="space-y-2">
                            <Label htmlFor="edit-companyName">
                                {language === 'en' ? 'Company Name' : 'اسم الشركة'}
                            </Label>
                            <Input
                                id="edit-companyName"
                                value={editForm.companyName}
                                onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                            />
                        </div>
                    )}

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
                            disabled={updating}
                        >
                            {updating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {language === 'en' ? 'Updating...' : 'جاري التحديث...'}
                                </>
                            ) : (
                                language === 'en' ? 'Update User' : 'تحديث المستخدم'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

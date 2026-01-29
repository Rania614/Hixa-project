import {
    MoreHorizontal,
    UserCheck,
    Edit,
    UserX,
    Trash2,
    Phone,
    MapPin,
    Loader2,
    Briefcase,
    Building2,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/context/AppContext';

interface User {
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    joinDate?: string;
    avatar?: any;
    verified?: boolean;
    location?: string;
    companyName?: string;
}

interface UserTableProps {
    users: User[];
    loading: boolean;
    selectedUsers: string[];
    toggleUserSelection: (id: string) => void;
    toggleAllUsersSelection: () => void;
    handleViewUser: (id: string) => void;
    handleEditUser: (id: string) => void;
    updateUserStatus: (id: string) => void;
    deleteUser: (id: string) => void;
    getUserId: (user: User) => string;
    isUserActive: (user: User) => boolean;
    roleLabel: string;
}

export const UserTable = ({
    users,
    loading,
    selectedUsers,
    toggleUserSelection,
    toggleAllUsersSelection,
    handleViewUser,
    handleEditUser,
    updateUserStatus,
    deleteUser,
    getUserId,
    isUserActive,
    roleLabel,
}: UserTableProps) => {
    const { language } = useApp();

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: { en: string; ar: string }; className: string }> = {
            active: {
                label: { en: 'Active', ar: 'نشط' },
                className: 'bg-green-500/20 text-green-500'
            },
            pending: {
                label: { en: 'Pending', ar: 'قيد الانتظار' },
                className: 'bg-yellow-500/20 text-yellow-500'
            },
            suspended: {
                label: { en: 'Suspended', ar: 'معلق' },
                className: 'bg-red-500/20 text-red-500'
            },
            inactive: {
                label: { en: 'Inactive', ar: 'غير نشط' },
                className: 'bg-gray-500/20 text-gray-500'
            },
        };

        const statusInfo = statusMap[status] || statusMap.active;
        return (
            <Badge className={statusInfo.className}>
                {statusInfo.label[language as 'en' | 'ar']}
            </Badge>
        );
    };

    const getRoleIcon = (role: string) => {
        if (role === 'engineer') return Briefcase;
        if (role === 'company') return Building2;
        return Users;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan" />
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? `No ${roleLabel.toLowerCase()} found` : `لا يوجد ${roleLabel}`}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground w-12">
                            <Checkbox
                                checked={selectedUsers.length === users.length && users.length > 0}
                                onCheckedChange={toggleAllUsersSelection}
                            />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            {language === 'en' ? roleLabel : roleLabel}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            {language === 'en' ? 'Contact' : 'التواصل'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            {language === 'en' ? 'Status' : 'الحالة'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            {language === 'en' ? 'Join Date' : 'تاريخ الانضمام'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            {language === 'en' ? 'Actions' : 'الإجراءات'}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => {
                        const RoleIcon = getRoleIcon(user.role);
                        const userId = getUserId(user);
                        return (
                            <tr key={userId || `user-${index}`} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-4 px-4">
                                    <Checkbox
                                        checked={selectedUsers.includes(userId)}
                                        onCheckedChange={() => toggleUserSelection(userId)}
                                    />
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan flex items-center justify-center text-white font-semibold">
                                            {user.avatar ? (
                                                <img
                                                    src={typeof user.avatar === 'string' ? user.avatar : user.avatar?.url}
                                                    alt={user.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <RoleIcon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {user.role === 'company' ? (user.companyName || user.name) : user.name}
                                                {user.verified && (
                                                    <UserCheck className="h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="space-y-1">
                                        {user.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                {user.phone}
                                            </div>
                                        )}
                                        {user.location && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                {user.location}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {getStatusBadge(user.status)}
                                </td>
                                <td className="py-4 px-4 text-muted-foreground">
                                    {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-4 px-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => userId && handleViewUser(userId)}>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                {language === 'en' ? 'View Details' : 'عرض التفاصيل'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => userId && handleEditUser(userId)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                {language === 'en' ? 'Edit' : 'تعديل'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => userId && updateUserStatus(userId)}>
                                                {isUserActive(user) ? (
                                                    <>
                                                        <UserX className="h-4 w-4 mr-2" />
                                                        {language === 'en' ? 'Deactivate' : 'تعطيل'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        {language === 'en' ? 'Activate' : 'تفعيل'}
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => userId && deleteUser(userId)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                {language === 'en' ? 'Delete' : 'حذف'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

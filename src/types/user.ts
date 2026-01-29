export interface User {
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    email: string;
    phone?: string;
    countryCode?: string;
    role: 'engineer' | 'client' | 'company' | 'admin';
    status: 'active' | 'pending' | 'suspended' | 'inactive';
    joinDate?: string;
    createdAt?: string;
    avatar?: any;
    companyName?: string;
    contactPersonName?: string;
    location?: string;
    verified?: boolean;
    specialization?: string;
    licenseNumber?: string;
    bio?: string;
    country?: string;
    city?: string;
    nationalId?: string;
}

export const getUserId = (user: User): string => {
    return user._id || user.id || '';
};

export const isUserActive = (user: User | any): boolean => {
    if (user.status === 'active') return true;
    if (user.status === 'inactive' || user.status === 'suspended' || user.status === 'pending') return false;
    if (user.isActive !== undefined) return user.isActive === true;
    return true;
};

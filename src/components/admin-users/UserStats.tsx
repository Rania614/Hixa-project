import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { useApp } from '@/context/AppContext';

interface UserStatsProps {
    statistics: {
        total: number;
        engineers: { total: number; active: number; pending: number; suspended: number };
        clients: { total: number; active: number; pending: number; suspended: number };
        companies: { total: number; active: number; pending: number; suspended: number };
    };
    activeTab: 'engineers' | 'clients' | 'companies';
}

export const UserStats = ({ statistics, activeTab }: UserStatsProps) => {
    const { language } = useApp();

    const getCurrentStats = () => {
        if (activeTab === 'engineers') return statistics.engineers;
        if (activeTab === 'clients') return statistics.clients;
        return statistics.companies;
    };

    const currentStats = getCurrentStats();

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'en' ? 'Total Users' : 'إجمالي المستخدمين'}
                    </CardTitle>
                    <HexagonIcon size="sm" className="text-cyan">
                        <Users className="h-5 w-5 text-cyan" />
                    </HexagonIcon>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{statistics.total}</div>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'en' ? 'Active' : 'نشط'}
                    </CardTitle>
                    <HexagonIcon size="sm" className="text-green-500">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </HexagonIcon>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{currentStats.active}</div>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'en' ? 'Pending' : 'قيد الانتظار'}
                    </CardTitle>
                    <HexagonIcon size="sm" className="text-yellow-500">
                        <Clock className="h-5 w-5 text-yellow-500" />
                    </HexagonIcon>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{currentStats.pending}</div>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {language === 'en' ? 'Suspended' : 'معلقون'}
                    </CardTitle>
                    <HexagonIcon size="sm" className="text-red-500">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                    </HexagonIcon>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{currentStats.suspended}</div>
                </CardContent>
            </Card>
        </div>
    );
};

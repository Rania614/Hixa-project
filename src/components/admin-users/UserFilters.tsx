import { Search, Filter, Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface UserFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    countryFilter: string[];
    setCountryFilter: (val: string[] | ((prev: string[]) => string[])) => void;
    countriesMeta: { key: string; value: string }[];
    categoryFilter: string[];
    setCategoryFilter: (val: string[] | ((prev: string[]) => string[])) => void;
    businessScopesMeta: string[];
    statusFilter: string;
    setStatusFilter: (val: any) => void;
    selectedUsersCount: number;
    handleBulkDelete: () => void;
    onAddUser: () => void;
}

export const UserFilters = ({
    searchTerm,
    setSearchTerm,
    countryFilter,
    setCountryFilter,
    countriesMeta,
    categoryFilter,
    setCategoryFilter,
    businessScopesMeta,
    statusFilter,
    setStatusFilter,
    selectedUsersCount,
    handleBulkDelete,
    onAddUser,
}: UserFiltersProps) => {
    const { language } = useApp();

    return (
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={language === 'en' ? "Search..." : "البحث..."}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Country Filter */}
            <div className="w-full md:w-64">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                        >
                            <div className="flex gap-1 overflow-hidden">
                                {countryFilter.length > 0 ? (
                                    countryFilter.map((val) => (
                                        <Badge key={val} variant="secondary" className="rounded-sm px-1 font-normal">
                                            {countriesMeta.find((c) => c.key === val)?.value || val}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">
                                        {language === 'en' ? 'Select Countries' : 'اختر الدول'}
                                    </span>
                                )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                        <Command>
                            <CommandInput placeholder={language === 'en' ? "Search country..." : "البحث عن دولة..."} />
                            <CommandList>
                                <CommandEmpty>{language === 'en' ? "No country found." : "لم يتم العثور على دولة."}</CommandEmpty>
                                <CommandGroup>
                                    {countriesMeta.map((country) => (
                                        <CommandItem
                                            key={country.key}
                                            onSelect={() => {
                                                setCountryFilter((prev) =>
                                                    prev.includes(country.key)
                                                        ? prev.filter((v) => v !== country.key)
                                                        : [...prev, country.key]
                                                );
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    countryFilter.includes(country.key)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <span>{country.value}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                        >
                            <div className="flex gap-1 overflow-hidden">
                                {categoryFilter.length > 0 ? (
                                    categoryFilter.map((val) => (
                                        <Badge key={val} variant="secondary" className="rounded-sm px-1 font-normal">
                                            {val}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">
                                        {language === 'en' ? 'Select Specializations' : 'اختر التخصصات'}
                                    </span>
                                )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                        <Command>
                            <CommandInput placeholder={language === 'en' ? "Search category..." : "البحث عن تخصص..."} />
                            <CommandList>
                                <CommandEmpty>{language === 'en' ? "No category found." : "لم يتم العثور على تخصص."}</CommandEmpty>
                                <CommandGroup>
                                    {businessScopesMeta.map((category) => (
                                        <CommandItem
                                            key={category}
                                            onSelect={() => {
                                                setCategoryFilter((prev) =>
                                                    prev.includes(category)
                                                        ? prev.filter((v) => v !== category)
                                                        : [...prev, category]
                                                );
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    categoryFilter.includes(category)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <span>{category}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Filter' : 'فلترة'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                        {language === 'en' ? 'All' : 'الكل'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                        {language === 'en' ? 'Active' : 'نشط'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                        {language === 'en' ? 'Pending' : 'قيد الانتظار'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                        {language === 'en' ? 'Suspended' : 'معلق'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {selectedUsersCount > 0 && (
                <Button
                    variant="destructive"
                    onClick={handleBulkDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {language === 'en'
                        ? `Delete (${selectedUsersCount})`
                        : `حذف (${selectedUsersCount})`}
                </Button>
            )}

            <Button
                className="bg-cyan hover:bg-cyan-dark"
                onClick={onAddUser}
            >
                <Plus className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Add User' : 'إضافة مستخدم'}
            </Button>
        </div>
    );
};

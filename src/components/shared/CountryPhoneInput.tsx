import React, { useEffect } from "react";
import { Controller, Control, FieldErrors, useWatch } from "react-hook-form";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface CountryOption {
  value: string; // ISO code (e.g., "EG", "SA")
  label: string; // Country name
  dialCode: string; // Phone dial code (e.g., "+20", "+966")
  nameEn?: string; // English name
  nameAr?: string; // Arabic name
}

interface CountryPhoneInputProps {
  control: Control<any>;
  countryCodeName: string; // Field name for country code
  phoneName: string; // Field name for phone number
  cityName?: string; // Field name for city (optional)
  label?: string;
  className?: string;
  errors?: FieldErrors;
  required?: boolean;
  disabled?: boolean;
}

// Generate country options with flags
const getCountryOptions = (language: "ar" | "en" = "en"): CountryOption[] => {
  const countries: { [key: string]: { name: { en: string; ar: string }; dialCode: string } } = {
    EG: { name: { en: "Egypt", ar: "مصر" }, dialCode: "+20" },
    SA: { name: { en: "Saudi Arabia", ar: "السعودية" }, dialCode: "+966" },
    AE: { name: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" }, dialCode: "+971" },
    KW: { name: { en: "Kuwait", ar: "الكويت" }, dialCode: "+965" },
    QA: { name: { en: "Qatar", ar: "قطر" }, dialCode: "+974" },
    BH: { name: { en: "Bahrain", ar: "البحرين" }, dialCode: "+973" },
    OM: { name: { en: "Oman", ar: "عمان" }, dialCode: "+968" },
    JO: { name: { en: "Jordan", ar: "الأردن" }, dialCode: "+962" },
    LB: { name: { en: "Lebanon", ar: "لبنان" }, dialCode: "+961" },
    IQ: { name: { en: "Iraq", ar: "العراق" }, dialCode: "+964" },
    US: { name: { en: "United States", ar: "الولايات المتحدة" }, dialCode: "+1" },
    GB: { name: { en: "United Kingdom", ar: "المملكة المتحدة" }, dialCode: "+44" },
    FR: { name: { en: "France", ar: "فرنسا" }, dialCode: "+33" },
    DE: { name: { en: "Germany", ar: "ألمانيا" }, dialCode: "+49" },
    IT: { name: { en: "Italy", ar: "إيطاليا" }, dialCode: "+39" },
    ES: { name: { en: "Spain", ar: "إسبانيا" }, dialCode: "+34" },
    CA: { name: { en: "Canada", ar: "كندا" }, dialCode: "+1" },
    AU: { name: { en: "Australia", ar: "أستراليا" }, dialCode: "+61" },
    IN: { name: { en: "India", ar: "الهند" }, dialCode: "+91" },
    CN: { name: { en: "China", ar: "الصين" }, dialCode: "+86" },
    JP: { name: { en: "Japan", ar: "اليابان" }, dialCode: "+81" },
    KR: { name: { en: "South Korea", ar: "كوريا الجنوبية" }, dialCode: "+82" },
    BR: { name: { en: "Brazil", ar: "البرازيل" }, dialCode: "+55" },
    MX: { name: { en: "Mexico", ar: "المكسيك" }, dialCode: "+52" },
    ZA: { name: { en: "South Africa", ar: "جنوب أفريقيا" }, dialCode: "+27" },
    NG: { name: { en: "Nigeria", ar: "نيجيريا" }, dialCode: "+234" },
    KE: { name: { en: "Kenya", ar: "كينيا" }, dialCode: "+254" },
    TR: { name: { en: "Turkey", ar: "تركيا" }, dialCode: "+90" },
    RU: { name: { en: "Russia", ar: "روسيا" }, dialCode: "+7" },
  };

  return Object.entries(countries).map(([code, data]) => ({
    value: code,
    label: `${data.name[language]} (${code})`,
    dialCode: data.dialCode,
    nameEn: data.name.en,
    nameAr: data.name.ar,
  }));
};

// Will be initialized with language
let countryOptions: CountryOption[] = [];

// Get dial code for a country code
const getDialCode = (countryCode: string): string => {
  const country = countryOptions.find((opt) => opt.value === countryCode);
  return country?.dialCode || "+966";
};

// Get country code from phone number (if it starts with a dial code)
const getCountryFromPhone = (phone: string): string | null => {
  if (!phone || !phone.startsWith("+")) return null;
  
  for (const option of countryOptions) {
    if (phone.startsWith(option.dialCode)) {
      return option.value;
    }
  }
  return null;
};

// Cities by country with translations
interface CityOption {
  en: string;
  ar: string;
}

const citiesByCountry: { [key: string]: CityOption[] } = {
  SA: [
    { en: "Riyadh", ar: "الرياض" },
    { en: "Jeddah", ar: "جدة" },
    { en: "Dammam", ar: "الدمام" },
    { en: "Mecca", ar: "مكة المكرمة" },
    { en: "Medina", ar: "المدينة المنورة" },
    { en: "Khobar", ar: "الخبر" },
    { en: "Abha", ar: "أبها" },
    { en: "Tabuk", ar: "تبوك" },
    { en: "Taif", ar: "الطائف" },
    { en: "Buraydah", ar: "بريدة" },
    { en: "Khamis Mushait", ar: "خميس مشيط" },
    { en: "Hail", ar: "حائل" },
    { en: "Najran", ar: "نجران" },
    { en: "Al Jubail", ar: "الجبيل" },
    { en: "Yanbu", ar: "ينبع" },
  ],
  EG: [
    { en: "Cairo", ar: "القاهرة" },
    { en: "Alexandria", ar: "الإسكندرية" },
    { en: "Giza", ar: "الجيزة" },
    { en: "Shubra El Kheima", ar: "شبرا الخيمة" },
    { en: "Port Said", ar: "بورسعيد" },
    { en: "Suez", ar: "السويس" },
    { en: "Luxor", ar: "الأقصر" },
    { en: "Aswan", ar: "أسوان" },
    { en: "Mansoura", ar: "المنصورة" },
    { en: "Tanta", ar: "طنطا" },
    { en: "Ismailia", ar: "الإسماعيلية" },
    { en: "Zagazig", ar: "الزقازيق" },
  ],
  AE: [
    { en: "Dubai", ar: "دبي" },
    { en: "Abu Dhabi", ar: "أبو ظبي" },
    { en: "Sharjah", ar: "الشارقة" },
    { en: "Al Ain", ar: "العين" },
    { en: "Ajman", ar: "عجمان" },
    { en: "Ras Al Khaimah", ar: "رأس الخيمة" },
    { en: "Fujairah", ar: "الفجيرة" },
    { en: "Umm Al Quwain", ar: "أم القيوين" },
  ],
  KW: [
    { en: "Kuwait City", ar: "مدينة الكويت" },
    { en: "Al Ahmadi", ar: "الأحمدي" },
    { en: "Hawalli", ar: "حولي" },
    { en: "Al Farwaniyah", ar: "الفروانية" },
    { en: "Al Jahra", ar: "الجهراء" },
    { en: "Mubarak Al-Kabeer", ar: "مبارك الكبير" },
  ],
  QA: [
    { en: "Doha", ar: "الدوحة" },
    { en: "Al Rayyan", ar: "الريان" },
    { en: "Al Wakrah", ar: "الوكرة" },
    { en: "Al Khor", ar: "الخور" },
    { en: "Dukhan", ar: "دخان" },
    { en: "Mesaieed", ar: "مسيعيد" },
  ],
  BH: [
    { en: "Manama", ar: "المنامة" },
    { en: "Riffa", ar: "الرفاع" },
    { en: "Muharraq", ar: "المحرق" },
    { en: "Hamad Town", ar: "مدينة حمد" },
    { en: "A'ali", ar: "عالي" },
    { en: "Isa Town", ar: "مدينة عيسى" },
  ],
  OM: [
    { en: "Muscat", ar: "مسقط" },
    { en: "Seeb", ar: "السيب" },
    { en: "Salalah", ar: "صلالة" },
    { en: "Bawshar", ar: "بوشر" },
    { en: "Sohar", ar: "صحار" },
    { en: "Sur", ar: "صور" },
  ],
  JO: [
    { en: "Amman", ar: "عمان" },
    { en: "Zarqa", ar: "الزرقاء" },
    { en: "Irbid", ar: "إربد" },
    { en: "Aqaba", ar: "العقبة" },
    { en: "Madaba", ar: "مادبا" },
    { en: "Mafraq", ar: "المفرق" },
  ],
  LB: [
    { en: "Beirut", ar: "بيروت" },
    { en: "Tripoli", ar: "طرابلس" },
    { en: "Sidon", ar: "صيدا" },
    { en: "Tyre", ar: "صور" },
    { en: "Byblos", ar: "جبيل" },
    { en: "Zahle", ar: "زحلة" },
  ],
  IQ: [
    { en: "Baghdad", ar: "بغداد" },
    { en: "Basra", ar: "البصرة" },
    { en: "Mosul", ar: "الموصل" },
    { en: "Erbil", ar: "أربيل" },
    { en: "Najaf", ar: "النجف" },
    { en: "Karbala", ar: "كربلاء" },
  ],
};

const getCitiesForCountry = (countryCode: string, language: "ar" | "en" = "en"): { value: string; label: string }[] => {
  const cities = citiesByCountry[countryCode] || [];
  return cities.map((city) => ({
    value: city.en, // Store English name as value for consistency
    label: language === "ar" ? city.ar : city.en,
  }));
};

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  control,
  countryCodeName,
  phoneName,
  cityName,
  label,
  className,
  errors,
  required = false,
  disabled = false,
}) => {
  const { language } = useApp();
  const countryError = errors?.[countryCodeName];
  const phoneError = errors?.[phoneName];
  const cityError = errors?.[cityName];
  const selectedCountryCode = useWatch({ control, name: countryCodeName }) || "SA";
  const phoneValue = useWatch({ control, name: phoneName });

  // Initialize country options with current language
  countryOptions = getCountryOptions(language);

  const formatOptionLabel = ({ value, label, nameEn, nameAr }: CountryOption) => {
    const displayName = language === "ar" ? (nameAr || label.split(" (")[0]) : (nameEn || label.split(" (")[0]);
    return (
      <div className="flex items-center gap-2.5">
        <ReactCountryFlag
          countryCode={value}
          svg
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "2px",
          }}
          title={value}
        />
        <span className="text-sm">{displayName}</span>
      </div>
    );
  };

  const formatSelectedValue = (country: CountryOption | undefined) => {
    if (!country) return null;
    const displayName = language === "ar" ? (country.nameAr || country.label.split(" (")[0]) : (country.nameEn || country.label.split(" (")[0]);
    return (
      <div className="flex items-center gap-2.5">
        <ReactCountryFlag
          countryCode={country.value}
          svg
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "2px",
          }}
          title={country.value}
        />
        <span className="text-sm text-hexa-text-dark">{displayName}</span>
      </div>
    );
  };

  const availableCities = getCitiesForCountry(selectedCountryCode, language);
  const isRTL = language === "ar";

  return (
    <div className={cn("space-y-2 w-full max-w-md", className, isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      {label && (
        <Label className="text-hexa-text-dark text-sm font-medium block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="space-y-2.5 w-full">
        {/* 1. Country Select - الأساس */}
        <div className="space-y-1">
          <Label className="text-hexa-text-dark text-xs font-medium block">
            {language === "en" ? "Country" : "الدولة"}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Controller
            name={countryCodeName}
            control={control}
            rules={{ required: required ? "Country is required" : false }}
            render={({ field }) => {
              const selectedCountry = countryOptions.find(
                (opt) => opt.value === field.value
              ) || countryOptions.find((opt) => opt.value === "SA");

              return (
                <div>
                  <Select
                    options={countryOptions}
                    formatOptionLabel={formatOptionLabel}
                    value={selectedCountry}
                    onChange={(option) => {
                      field.onChange(option?.value || "SA");
                      // Reset city when country changes
                      if (cityName) {
                        control._formValues[cityName] = "";
                        control._subjects.values.next({ ...control._formValues });
                      }
                    }}
                    isSearchable
                    placeholder={language === "en" ? "Select country" : "اختر الدولة"}
                    isDisabled={disabled}
                    classNamePrefix="react-select"
                    classNames={{
                      control: (state) =>
                        cn(
                          "!min-h-[40px] !h-10 !bg-hexa-bg !border-hexa-border !rounded-md !px-2.5",
                          isRTL ? "!pr-2.5 !pl-8" : "!pl-2.5 !pr-8",
                          "hover:!border-hexa-secondary !transition-colors",
                          state.isFocused && "!border-hexa-secondary !ring-2 !ring-hexa-secondary/20 !shadow-none",
                          countryError && "!border-red-500"
                        ),
                      menu: () => "!bg-hexa-card !border-hexa-border !rounded-md !shadow-lg !mt-1 !z-50",
                      menuList: () => "!py-1 !max-h-[300px]",
                      option: (state) =>
                        cn(
                          "!px-3 !py-2.5 !text-hexa-text-dark !cursor-pointer !text-sm",
                          state.isFocused && "!bg-hexa-secondary/20",
                          state.isSelected && "!bg-hexa-secondary !text-black !font-medium"
                        ),
                      input: () => "!text-hexa-text-dark !text-sm !py-0",
                      placeholder: () => "!text-hexa-text-light !text-sm",
                      singleValue: () => "!text-hexa-text-dark !text-sm !flex !items-center !gap-2 !m-0",
                      indicatorSeparator: () => "!bg-transparent !w-0",
                      dropdownIndicator: () => cn(
                        "!text-hexa-text-light hover:!text-hexa-secondary !p-0 !cursor-pointer !absolute",
                        "!top-1/2 !-translate-y-1/2",
                        isRTL ? "!left-2" : "!right-2"
                      ),
                    }}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "var(--hexa-bg)",
                        borderColor: state.isFocused ? "var(--hexa-secondary)" : "var(--hexa-border)",
                        boxShadow: state.isFocused ? "0 0 0 2px rgba(var(--hexa-secondary-rgb), 0.2)" : "none",
                        minHeight: "40px",
                        height: "40px",
                        cursor: "pointer",
                        paddingRight: isRTL ? "10px" : "32px",
                        paddingLeft: isRTL ? "32px" : "10px",
                        position: "relative",
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        cursor: "pointer",
                        color: "var(--hexa-text-light)",
                        position: "absolute",
                        right: isRTL ? "auto" : "8px",
                        left: isRTL ? "8px" : "auto",
                        top: "50%",
                        transform: "translateY(-50%)",
                        padding: "0",
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        position: "absolute",
                        right: isRTL ? "auto" : "0",
                        left: isRTL ? "0" : "auto",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "var(--hexa-text-dark)",
                        margin: "0",
                      }),
                    }}
                  />
                  {countryError && (
                    <p className="text-xs text-red-500 mt-1">
                      {countryError.message as string}
                    </p>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* 2. Phone Input - يتأثر بالدولة */}
        <div className="space-y-1">
          <Label className="text-hexa-text-dark text-xs font-medium block">
            {language === "en" ? "Phone Number" : "رقم الهاتف"}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Controller
            name={phoneName}
            control={control}
            rules={{
              required: required ? "Phone number is required" : false,
            }}
            render={({ field }) => {
              const dialCode = getDialCode(selectedCountryCode);
              const currentValue = field.value || dialCode;

              return (
                <div>
                  <PhoneInput
                    country={selectedCountryCode.toLowerCase()}
                    value={currentValue}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    disabled={disabled}
                    inputClass={cn(
                      "!w-full !h-10 !bg-hexa-bg !border-hexa-border !text-hexa-text-dark !rounded-md",
                      isRTL 
                        ? "!text-sm !px-2.5 !pl-14 focus:!border-hexa-secondary focus:!ring-2 focus:!ring-hexa-secondary/20 focus:!outline-none"
                        : "!text-sm !px-2.5 !pr-14 focus:!border-hexa-secondary focus:!ring-2 focus:!ring-hexa-secondary/20 focus:!outline-none",
                      "hover:!border-hexa-secondary/50 !transition-all",
                      phoneError && "!border-red-500"
                    )}
                    buttonClass={cn(
                      "!bg-hexa-bg !border-hexa-border hover:!border-hexa-secondary !transition-all",
                      "!h-10 !min-w-[55px] !absolute !flex !items-center !justify-center",
                      isRTL
                        ? "!rounded-l-md !rounded-r-none !left-0 !border-r"
                        : "!rounded-r-md !rounded-l-none !right-0 !border-l",
                      phoneError && "!border-red-500"
                    )}
                    containerClass="!w-full !relative !flex !items-stretch"
                    dropdownClass="!bg-hexa-card !border-hexa-border !rounded-md !shadow-lg !z-50 !mt-1"
                    searchClass="!bg-hexa-bg !border-hexa-border !text-hexa-text-dark !rounded-md !mb-2 !px-3 !py-2"
                    countryCodeEditable={false}
                    preferredCountries={["sa", "eg", "ae", "kw", "qa", "bh", "om", "jo"]}
                    enableSearch
                    disableSearchIcon
                    specialLabel=""
                    inputProps={{
                      type: "tel",
                      autoComplete: "tel",
                    }}
                    inputStyle={{
                      width: "100%",
                      height: "40px",
                      fontSize: "13px",
                      paddingLeft: isRTL ? "60px" : "12px",
                      paddingRight: isRTL ? "12px" : "60px",
                    }}
                    buttonStyle={{
                      height: "40px",
                      minWidth: "55px",
                      position: "absolute",
                      right: isRTL ? "auto" : "0",
                      left: isRTL ? "0" : "auto",
                      top: "0",
                      borderLeft: isRTL ? "none" : "1px solid var(--hexa-border)",
                      borderRight: isRTL ? "1px solid var(--hexa-border)" : "none",
                      borderTopRightRadius: isRTL ? "0" : "6px",
                      borderBottomRightRadius: isRTL ? "0" : "6px",
                      borderTopLeftRadius: isRTL ? "6px" : "0",
                      borderBottomLeftRadius: isRTL ? "6px" : "0",
                    }}
                    containerStyle={{
                      position: "relative",
                      display: "flex",
                      alignItems: "stretch",
                    }}
                  />
                  {phoneError ? (
                    <p className="text-xs text-red-500 mt-1">
                      {phoneError.message as string}
                    </p>
                  ) : (
                    <p className="text-xs text-hexa-text-light mt-1">
                      {language === "en" 
                        ? `Example: ${getDialCode(selectedCountryCode)} 5X XXX XXXX` 
                        : `مثال: ${getDialCode(selectedCountryCode)} 5X XXX XXXX`}
                    </p>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* 3. City Select - dependent على الدولة */}
        {cityName && (
          <div className="space-y-1">
            <Label className="text-hexa-text-dark text-xs font-medium block">
              {language === "en" ? "City" : "المدينة"}
            </Label>
            <Controller
              name={cityName}
              control={control}
              render={({ field }) => {
                // Find the selected city label based on current value
                const selectedCity = availableCities.find(city => city.value === field.value);
                const displayValue = selectedCity ? selectedCity.label : "";

                return (
                  <div>
                    {availableCities.length > 0 ? (
                      <ShadcnSelect
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={disabled || !selectedCountryCode}
                      >
                        <SelectTrigger className="h-10 bg-hexa-bg border-hexa-border text-hexa-text-dark hover:border-hexa-secondary focus:border-hexa-secondary focus:ring-2 focus:ring-hexa-secondary/20 cursor-pointer w-full text-sm px-2.5">
                          <div className="flex items-center gap-2 w-full">
                            <MapPin className="w-3.5 h-3.5 text-hexa-text-light flex-shrink-0" />
                            <SelectValue placeholder={language === "en" ? "Search and select city..." : "ابحث واختر المدينة..."} className="flex-1 text-sm">
                              {displayValue}
                            </SelectValue>
                          </div>
                        </SelectTrigger>
                      <SelectContent className="bg-hexa-card border-hexa-border max-h-[300px]">
                        {availableCities.map((city) => (
                          <SelectItem
                            key={city.value}
                            value={city.value}
                            className="text-hexa-text-dark focus:bg-hexa-secondary/20 focus:text-hexa-text-dark cursor-pointer"
                          >
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </ShadcnSelect>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center gap-2 h-11 px-3 bg-hexa-bg border border-hexa-border rounded-md text-hexa-text-light">
                        <MapPin className="w-4 h-4 text-hexa-text-light flex-shrink-0" />
                        <span className="text-sm">
                          {language === "en" ? "Select country first" : "اختر الدولة أولاً"}
                        </span>
                      </div>
                    </div>
                  )}
                  {cityError && (
                    <p className="text-xs text-red-500 mt-1">
                      {cityError.message as string}
                    </p>
                  )}
                </div>
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};


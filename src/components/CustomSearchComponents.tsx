import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Search,
  Plus,
  Minus,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  getCountryList, 
  getCityList, 
  Country,
  City,
  CountryListResponse,
  CityListResponse
} from "@/services/hotelCodeApi";

interface DestinationPickerProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DestinationPicker = ({
  value,
  onChange,
  isOpen,
  onOpenChange,
}: DestinationPickerProps) => {
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic country and city selection
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [currentStep, setCurrentStep] = useState<'country' | 'city'>('country');
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');

  // Load countries on component mount
  useEffect(() => {
    if (isOpen && countries.length === 0) {
      loadCountries();
    }
  }, [isOpen]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      console.log('🌍 Loading countries...');
      
      const response: CountryListResponse = await getCountryList();
      
      if (response.Status.Code === '200' && response.CountryList) {
        setCountries(response.CountryList);
        console.log('✅ Countries loaded:', response.CountryList.length);
      } else {
        console.error('❌ Failed to load countries:', response.Status.Description);
      }
    } catch (error) {
      console.error('❌ Error loading countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const handleCountrySelect = async (country: Country) => {
    try {
      setSelectedCountry(country);
      setSelectedCity(null);
      setCurrentStep('city');
      setCitySearchTerm(''); // Clear city search when switching to city selection
      
      console.log('🌍 Country selected:', country.Name, 'Code:', country.Code);
      
      setLoadingCities(true);
      console.log('🏙️ Loading cities for country:', country.Code);
      
      const response: CityListResponse = await getCityList(country.Code);
      
      if (response.Status.Code === '200' && response.CityList) {
        setCities(response.CityList);
        console.log('✅ Cities loaded:', response.CityList.length);
      } else {
        console.error('❌ Failed to load cities:', response.Status.Description);
      }
    } catch (error) {
      console.error('❌ Error loading cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    const destinationValue = `${city.CityName}, ${selectedCountry?.Name}`;
    setInputValue(destinationValue);
    onChange(destinationValue);
    onOpenChange(false);
    console.log('🏙️ City selected:', city.CityName, 'Code:', city.CityCode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleDestinationSelect = (destination: string) => {
    setInputValue(destination);
    onChange(destination);
    onOpenChange(false);
  };

  const handleBackToCountries = () => {
    setCurrentStep('country');
    setSelectedCountry(null);
    setSelectedCity(null);
    setCities([]);
    setCountrySearchTerm('');
  };

  // Filter countries based on search term
  const filteredCountries = countries.filter(country => 
    country.Name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.Code.toLowerCase().includes(countrySearchTerm.toLowerCase())
  ).sort((a, b) => {
    // Prioritize exact matches and matches that start with the search term
    const aName = a.Name.toLowerCase();
    const bName = b.Name.toLowerCase();
    const searchTerm = countrySearchTerm.toLowerCase();
    
    if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
    if (!aName.startsWith(searchTerm) && bName.startsWith(searchTerm)) return 1;
    if (aName.includes(searchTerm) && !bName.includes(searchTerm)) return -1;
    if (!aName.includes(searchTerm) && bName.includes(searchTerm)) return 1;
    return aName.localeCompare(bName);
  });

  // Filter cities based on search term
  const filteredCities = cities.filter(city => 
    city.CityName.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
    city.CityCode.toLowerCase().includes(citySearchTerm.toLowerCase())
  ).sort((a, b) => {
    // Prioritize exact matches and matches that start with the search term
    const aName = a.CityName.toLowerCase();
    const bName = b.CityName.toLowerCase();
    const searchTerm = citySearchTerm.toLowerCase();
    
    if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
    if (!aName.startsWith(searchTerm) && bName.startsWith(searchTerm)) return 1;
    if (aName.includes(searchTerm) && !bName.includes(searchTerm)) return -1;
    if (!aName.includes(searchTerm) && bName.includes(searchTerm)) return 1;
    return aName.localeCompare(bName);
  });

  return (
    <div className="relative">
      <div
        className="flex flex-col items-start space-y-1 cursor-pointer p-4 hover:bg-muted/50 rounded-lg transition-all duration-200 min-w-[200px] group"
        onClick={() => onOpenChange(!isOpen)}
      >
        <Label className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          Where
        </Label>
        <div
          className={cn(
            "text-base font-normal transition-colors truncate w-full",
            value ? "text-foreground font-medium" : "text-muted-foreground"
          )}
        >
          {value || "Search destinations"}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-4">
            <div className="space-y-3">
              {/* Header with back button for city selection */}
              {currentStep === 'city' && (
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToCountries}
                    className="p-1 h-auto"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </Button>
                  <div>
                    <div className="font-medium text-sm">Select City</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedCountry?.Name} ({selectedCountry?.Code})
                    </div>
                  </div>
                </div>
              )}

              {/* Country Selection */}
              {currentStep === 'country' && (
              <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select Country</h4>
                  
                  {/* Search input for countries */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                      placeholder="Search countries..."
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm"
                />
              </div>
                  
                  {loadingCountries ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Loading countries...
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredCountries.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          No countries found matching "{countrySearchTerm}"
                        </div>
                      ) : (
                        filteredCountries.map((country) => (
                  <button
                          key={country.Code}
                          onClick={() => handleCountrySelect(country)}
                    className="flex items-center space-x-3 w-full p-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
                  >
                    <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                            <div className="font-medium text-sm">{country.Name}</div>
                            <div className="text-xs text-muted-foreground">{country.Code}</div>
                          </div>
                        </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* City Selection */}
              {currentStep === 'city' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select City</h4>
                  
                  {/* Search input for cities */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cities..."
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm"
                    />
                  </div>
                  
                  {loadingCities ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Loading cities...
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredCities.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          No cities found matching "{citySearchTerm}"
                        </div>
                      ) : (
                        filteredCities.map((city) => (
                        <button
                          key={city.CityCode}
                          onClick={() => handleCitySelect(city)}
                          className="flex items-center space-x-3 w-full p-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
                        >
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5" />
                      </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{city.CityName}</div>
                            <div className="text-xs text-muted-foreground">{city.CityCode}</div>
                    </div>
                        </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: "checkin" | "checkout";
  minDate?: Date;
}

export const DatePicker = ({
  date,
  onDateChange,
  isOpen,
  onOpenChange,
  type,
  minDate,
}: DatePickerProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    onOpenChange(false);
  };

  return (
    <div className="relative">
      <div
        className="flex flex-col items-start space-y-1 cursor-pointer p-4 hover:bg-muted/50 rounded-lg transition-all duration-200 min-w-[140px] group"
        onClick={() => onOpenChange(!isOpen)}
      >
        <Label className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {type === "checkin" ? "Check in" : "Check out"}
        </Label>
        <div
          className={cn(
            "text-base font-normal transition-colors",
            date ? "text-foreground font-medium" : "text-muted-foreground"
          )}
        >
          {date ? format(date, "MMM d, yyyy") : "Add dates"}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (date < today) return true;
              if (minDate && date <= minDate) return true;
              return false;
            }}
            initialFocus
            className="rounded-lg border-0 pointer-events-auto"
          />
        </div>
      )}
    </div>
  );
};

interface GuestSelectorProps {
  adults: number;
  children: number;
  rooms: number; // New prop for number of rooms
  onAdultsChange: (count: number) => void;
  onChildrenChange: (count: number) => void;
  onRoomsChange: (count: number) => void; // New prop for changing room count
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GuestSelector = ({
  adults,
  children,
  rooms, // Destructure new rooms prop
  onAdultsChange,
  onChildrenChange,
  onRoomsChange, // Destructure new onRoomsChange prop
  isOpen,
  onOpenChange,
}: GuestSelectorProps) => {
  const totalGuests = adults + children;
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        className="flex flex-col items-start space-y-1 cursor-pointer p-4 hover:bg-muted/50 rounded-lg transition-all duration-200 min-w-[140px] group"
        onClick={() => onOpenChange(!isOpen)}
      >
        <Label className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          Guests
        </Label>
        <div
          className={cn(
            "text-base font-normal transition-colors",
            totalGuests > 0
              ? "text-foreground font-medium"
              : "text-muted-foreground"
          )}
        >
          {totalGuests > 0 || rooms > 0
            ? `${
                totalGuests > 0
                  ? `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`
                  : ""
              }${totalGuests > 0 && rooms > 0 ? ", " : ""}${
                rooms > 0 ? `${rooms} room${rooms > 1 ? "s" : ""}` : ""
              }`
            : "Add guests"}
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Adults</div>
                  <div className="text-xs text-muted-foreground">
                    Ages 13 or above
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-200"
                    onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {adults}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-200"
                    onClick={() => onAdultsChange(adults + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Children</div>
                  <div className="text-xs text-muted-foreground">Ages 2-12</div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-200"
                    onClick={() => onChildrenChange(Math.max(0, children - 1))}
                    disabled={children <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {children}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-200"
                    onClick={() => onChildrenChange(children + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Rooms Selector */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Rooms</div>
                  <div className="text-xs text-muted-foreground">
                    Number of rooms
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-200"
                    onClick={() => onRoomsChange(Math.max(1, rooms - 1))}
                    disabled={rooms <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {rooms}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:scale-110 transition-transform duration-200"
                    onClick={() => onRoomsChange(rooms + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SearchButtonProps {
  onSearch: () => void;
  expanded: boolean;
}

export const SearchButton = ({ onSearch, expanded }: SearchButtonProps) => {
  return (
    <Button
      onClick={onSearch}
      className={cn(
        "bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105",
        expanded
          ? "px-12 py-4 rounded-full text-lg font-semibold h-auto min-w-[120px]"
          : "p-4 rounded-full h-auto min-w-[60px]"
      )}
    >
      <Search
        className={cn("transition-all", expanded ? "h-6 w-6 mr-3" : "h-6 w-6")}
      />
      {expanded && "Search"}
    </Button>
  );
};

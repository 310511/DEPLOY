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

interface RoomGuests {
  adults: number;
  children: number;
  childrenAges: number[];
}

interface GuestSelectorProps {
  adults: number;
  children: number;
  rooms: number;
  childrenAges?: number[];
  roomGuests?: RoomGuests[];
  onAdultsChange: (count: number) => void;
  onChildrenChange: (count: number) => void;
  onRoomsChange: (count: number) => void;
  onChildrenAgesChange?: (ages: number[]) => void;
  onRoomGuestsChange?: (roomGuests: RoomGuests[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GuestSelector = ({
  adults,
  children,
  rooms,
  childrenAges = [],
  roomGuests = [],
  onAdultsChange,
  onChildrenChange,
  onRoomsChange,
  onChildrenAgesChange,
  onRoomGuestsChange,
  isOpen,
  onOpenChange,
}: GuestSelectorProps) => {
  const totalGuests = adults + children;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localChildrenAges, setLocalChildrenAges] = useState<number[]>(childrenAges);
  const [showRoomDistribution, setShowRoomDistribution] = useState(false);
  const [localRoomGuests, setLocalRoomGuests] = useState<RoomGuests[]>(
    roomGuests.length > 0 ? roomGuests : Array(rooms).fill({ adults: 1, children: 0, childrenAges: [] })
  );

  // Update children ages array when children count changes
  useEffect(() => {
    if (children > localChildrenAges.length) {
      const newAges = [...localChildrenAges, ...Array(children - localChildrenAges.length).fill(0)];
      setLocalChildrenAges(newAges);
    } else if (children < localChildrenAges.length) {
      setLocalChildrenAges(localChildrenAges.slice(0, children));
    }
  }, [children]);

  // Update room guests when rooms count changes
  useEffect(() => {
    if (rooms > localRoomGuests.length) {
      setLocalRoomGuests([...localRoomGuests, ...Array(rooms - localRoomGuests.length).fill({ adults: 1, children: 0, childrenAges: [] })]);
    } else if (rooms < localRoomGuests.length) {
      setLocalRoomGuests(localRoomGuests.slice(0, rooms));
    }
  }, [rooms]);

  const handleChildAgeChange = (index: number, age: number) => {
    const newAges = [...localChildrenAges];
    newAges[index] = age;
    setLocalChildrenAges(newAges);
    onChildrenAgesChange?.(newAges);
  };

  const handleRoomGuestChange = (roomIndex: number, field: 'adults' | 'children', value: number) => {
    const newRoomGuests = [...localRoomGuests];
    newRoomGuests[roomIndex] = { ...newRoomGuests[roomIndex], [field]: value };
    setLocalRoomGuests(newRoomGuests);
    onRoomGuestsChange?.(newRoomGuests);
  };

  const handleRoomChildAgeChange = (roomIndex: number, childIndex: number, age: number) => {
    const newRoomGuests = [...localRoomGuests];
    const newChildrenAges = [...(newRoomGuests[roomIndex].childrenAges || [])];
    newChildrenAges[childIndex] = age;
    newRoomGuests[roomIndex] = { ...newRoomGuests[roomIndex], childrenAges: newChildrenAges };
    setLocalRoomGuests(newRoomGuests);
    onRoomGuestsChange?.(newRoomGuests);
  };

  return (
    <div className="relative">
      <div
        className="flex flex-col items-start space-y-1 cursor-pointer p-4 hover:bg-muted/50 rounded-lg transition-all duration-200 min-w-[140px] group"
        onClick={() => onOpenChange(!isOpen)}
      >
        <Label className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          Guests
        </Label>
        <div className="text-base font-normal text-muted-foreground transition-colors">
          Enter details
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-4">
            <div className="space-y-6">
              {/* Rooms Selector - Only functional control */}
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

              {/* Room Details - Always show Room 1 */}
              <div className="border-t pt-4">
                <div className="text-xs font-medium text-muted-foreground mb-3">Room Details</div>
                <div className="p-3 bg-primary/5 rounded-lg space-y-3">
                  <div className="font-medium text-sm text-primary">Room 1</div>
                  
                  {/* Adults for Room 1 */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Adults</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => handleRoomGuestChange(0, 'adults', Math.max(1, (localRoomGuests[0]?.adults || 1) - 1))}
                        disabled={(localRoomGuests[0]?.adults || 1) <= 1}
                      >
                        <Minus className="h-2 w-2" />
                      </Button>
                      <span className="w-6 text-center text-xs font-medium">
                        {localRoomGuests[0]?.adults || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => handleRoomGuestChange(0, 'adults', (localRoomGuests[0]?.adults || 1) + 1)}
                      >
                        <Plus className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Children for Room 1 */}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Children</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => handleRoomGuestChange(0, 'children', Math.max(0, (localRoomGuests[0]?.children || 0) - 1))}
                        disabled={(localRoomGuests[0]?.children || 0) <= 0}
                      >
                        <Minus className="h-2 w-2" />
                      </Button>
                      <span className="w-6 text-center text-xs font-medium">
                        {localRoomGuests[0]?.children || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => handleRoomGuestChange(0, 'children', (localRoomGuests[0]?.children || 0) + 1)}
                      >
                        <Plus className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Children ages for Room 1 */}
                  {(localRoomGuests[0]?.children || 0) > 0 && (
                    <div className="space-y-2 pt-2 border-t border-primary/20">
                      <div className="text-xs font-medium text-muted-foreground">Children Ages</div>
                      {Array.from({ length: localRoomGuests[0]?.children || 0 }).map((_, childIndex) => (
                        <div key={childIndex} className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">
                            Age {childIndex + 1}
                          </Label>
                          <select
                            value={localRoomGuests[0]?.childrenAges?.[childIndex] || 0}
                            onChange={(e) => handleRoomChildAgeChange(0, childIndex, parseInt(e.target.value))}
                            className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value={0}>Age</option>
                            {Array.from({ length: 11 }, (_, i) => i + 2).map((age) => (
                              <option key={age} value={age}>
                                {age}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Rooms (Room 2, Room 3, etc.) */}
              {rooms > 1 && (
                <div className="border-t pt-4 space-y-3">
                  {Array.from({ length: rooms - 1 }).map((_, index) => {
                    const roomIndex = index + 1; // Start from Room 2
                    return (
                      <div key={roomIndex} className="p-3 bg-muted/30 rounded-lg space-y-3">
                        <div className="font-medium text-sm text-primary">Room {roomIndex + 1}</div>
                        
                        {/* Adults per room */}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Adults</Label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => handleRoomGuestChange(roomIndex, 'adults', Math.max(1, (localRoomGuests[roomIndex]?.adults || 1) - 1))}
                              disabled={(localRoomGuests[roomIndex]?.adults || 1) <= 1}
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">
                              {localRoomGuests[roomIndex]?.adults || 1}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => handleRoomGuestChange(roomIndex, 'adults', (localRoomGuests[roomIndex]?.adults || 1) + 1)}
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>

                        {/* Children per room */}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Children</Label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => handleRoomGuestChange(roomIndex, 'children', Math.max(0, (localRoomGuests[roomIndex]?.children || 0) - 1))}
                              disabled={(localRoomGuests[roomIndex]?.children || 0) <= 0}
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">
                              {localRoomGuests[roomIndex]?.children || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() => handleRoomGuestChange(roomIndex, 'children', (localRoomGuests[roomIndex]?.children || 0) + 1)}
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>

                        {/* Children ages per room */}
                        {(localRoomGuests[roomIndex]?.children || 0) > 0 && (
                          <div className="space-y-2 pt-2 border-t border-muted">
                            <div className="text-xs font-medium text-muted-foreground">Children Ages</div>
                            {Array.from({ length: localRoomGuests[roomIndex]?.children || 0 }).map((_, childIndex) => (
                              <div key={childIndex} className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">
                                  Age {childIndex + 1}
                                </Label>
                                <select
                                  value={localRoomGuests[roomIndex]?.childrenAges?.[childIndex] || 0}
                                  onChange={(e) => handleRoomChildAgeChange(roomIndex, childIndex, parseInt(e.target.value))}
                                  className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                  <option value={0}>Age</option>
                                  {Array.from({ length: 11 }, (_, i) => i + 2).map((age) => (
                                    <option key={age} value={age}>
                                      {age}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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

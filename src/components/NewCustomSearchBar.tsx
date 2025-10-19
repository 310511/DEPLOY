import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DestinationPicker,
  DatePicker,
  GuestSelector,
  SearchButton,
} from "./CustomSearchComponents";

interface Props {
  isSticky?: boolean;
}

const NewCustomSearchBar = ({ isSticky = false }: Props) => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  
  // Set default dates to reasonable values (1 week from now, 3 days stay)
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() + 7); // 1 week from now
  
  const defaultEndDate = new Date();
  defaultEndDate.setDate(defaultEndDate.getDate() + 10); // 3 days later
  
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultEndDate);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [roomGuests, setRoomGuests] = useState<Array<{adults: number; children: number; childrenAges: number[]}>>([]);
  const [showDestinations, setShowDestinations] = useState(false);
  const [showCheckinPicker, setShowCheckinPicker] = useState(false);
  const [showCheckoutPicker, setShowCheckoutPicker] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const clickedInsideSearch =
        searchBarRef.current?.contains(target as Node) ?? false;

      if (!clickedInsideSearch) {
        setShowDestinations(false);
        setShowCheckinPicker(false);
        setShowCheckoutPicker(false);
        setShowGuests(false);
        setIsExpanded(false);
        setActiveField(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams({
      destination: destination || "Riyadh",
      guests: (adults + children).toString(),
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString(),
    });

    // Add children ages if there are children
    if (children > 0 && childrenAges.length > 0) {
      params.set("childrenAges", childrenAges.join(","));
    }

    // Add room guest distribution if available
    if (roomGuests.length > 0) {
      params.set("roomGuests", JSON.stringify(roomGuests));
    }

    // Format dates in local timezone (YYYY-MM-DD) to avoid timezone shift issues
    if (startDate) {
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      params.set("checkIn", `${year}-${month}-${day}`);
    }
    if (endDate) {
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      params.set("checkOut", `${year}-${month}-${day}`);
    }

    navigate(`/search?${params.toString()}`);
  };

  const handleFieldFocus = (field: string) => {
    setIsExpanded(true);
    setActiveField(field);

    // Close all other dropdowns
    setShowDestinations(false);
    setShowCheckinPicker(false);
    setShowCheckoutPicker(false);
    setShowGuests(false);

    // Open the relevant dropdown
    switch (field) {
      case "destination":
        setShowDestinations(true);
        break;
      case "checkin":
        setShowCheckinPicker(true);
        break;
      case "checkout":
        setShowCheckoutPicker(true);
        break;
      case "guests":
        setShowGuests(true);
        break;
    }
  };

  const handleSearchClick = () => {
    if (!isExpanded) {
      handleFieldFocus("destination");
    } else {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      <div
        ref={searchBarRef}
        className={`bg-background border border-border rounded-full shadow-search transition-all duration-300 ${
          isExpanded ? "scale-105 shadow-card-hover" : "hover:shadow-card-hover"
        } ${isSticky ? "scale-90" : ""} backdrop-blur-sm mx-0`}
      >
        <div className="flex items-center px-6 pr-4">
          {/* Where */}
          <div className="flex-1">
            <DestinationPicker
              value={destination}
              onChange={setDestination}
              isOpen={showDestinations}
              onOpenChange={(open) => {
                setShowDestinations(open);
                if (open) handleFieldFocus("destination");
              }}
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border"></div>

          {/* Check in */}
          <div className="flex-1">
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              isOpen={showCheckinPicker}
              onOpenChange={(open) => {
                setShowCheckinPicker(open);
                if (open) handleFieldFocus("checkin");
              }}
              type="checkin"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border"></div>

          {/* Check out */}
          <div className="flex-1">
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              isOpen={showCheckoutPicker}
              onOpenChange={(open) => {
                setShowCheckoutPicker(open);
                if (open) handleFieldFocus("checkout");
              }}
              type="checkout"
              minDate={startDate}
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border"></div>

          {/* Who */}
          <div className="flex-1">
            <GuestSelector
              adults={adults}
              children={children}
              rooms={rooms}
              childrenAges={childrenAges}
              roomGuests={roomGuests}
              onAdultsChange={setAdults}
              onChildrenChange={setChildren}
              onRoomsChange={setRooms}
              onChildrenAgesChange={setChildrenAges}
              onRoomGuestsChange={setRoomGuests}
              isOpen={showGuests}
              onOpenChange={(open) => {
                setShowGuests(open);
                if (open) handleFieldFocus("guests");
              }}
            />
          </div>

          {/* Search Button */}
          <div className="p-1">
            <SearchButton onSearch={handleSearchClick} expanded={isExpanded} />
          </div>

          {/* Animated Video in the blank space */}
          <div className="flex items-center ml-2">
            <video
              src="/animated-video.mp4"
              alt="Animated Search Element"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "110px", height: "85px", objectFit: "contain" }}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCustomSearchBar;

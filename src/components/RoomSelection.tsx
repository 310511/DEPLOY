import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HotelResult } from '@/services/hotelApi';

interface RoomSelectionProps {
  hotel: HotelResult;
  onRoomSelect: (bookingCode: string, roomDetails: any) => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({ hotel, onRoomSelect }) => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleRoomSelect = (bookingCode: string, roomDetails: any) => {
    setSelectedRoom(bookingCode);
    onRoomSelect(bookingCode, roomDetails);
  };

  // If no rooms data, show a message
  if (!hotel.Rooms || hotel.Rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Rooms Available</CardTitle>
          <CardDescription>
            No room information available for this hotel. You may need to contact the hotel directly.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select a Room</CardTitle>
          <CardDescription>
            Choose from available rooms for {hotel.HotelName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hotel.Rooms.map((room, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all ${
                selectedRoom === room.BookingCode 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleRoomSelect(room.BookingCode || `room-${index}`, room)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {room.RoomType || `Room ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {room.MealType || 'Meal type not specified'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {room.Refundable && (
                        <Badge variant="secondary">Refundable</Badge>
                      )}
                      {room.CancellationPolicy && (
                        <Badge variant="outline">Free Cancellation</Badge>
                      )}
                    </div>
                    {room.CancellationPolicy && (
                      <p className="text-xs text-gray-500">
                        {room.CancellationPolicy}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {room.Currency} {room.Price || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">per night</div>
                  </div>
                </div>
                {room.BookingCode && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                    Booking Code: {room.BookingCode}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomSelection;

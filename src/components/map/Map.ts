import { RoomNum, type MapObjectType } from "./IMap";

export class Map 
{

    
    /**
     * Returns the room location for the requested map object.
     */
    public static getRoomLocation(type: MapObjectType): number {
        return RoomNum[type];
    }

    /**
     * Sets the room location for the requested map object.
     */
    public setRoomLocation(type: MapObjectType, roomNumber: number): void {
        RoomNum[type] = roomNumber;
        return;
    }
}
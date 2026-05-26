import type { MapObjectType } from "./IMap";

export class Map 
{
    /**
     * Returns the room location for the requested map object.
     */
    public static getRoomLocation(type: MapObjectType): number {
        localStorage.getItem(type)
        return 0;
    }

    /**
     * Sets the room location for the requested map object.
     */
    public setRoomLocation(type: MapObjectType, roomNumber: number): void {
        return;
    }
}
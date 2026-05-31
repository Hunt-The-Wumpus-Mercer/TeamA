// define cave room directions that a user can navigate or shoot
export const CaveRoomDirections = {
    EAST: 'east',
    NORTH_EAST: 'north_east',
    SOUTH_EAST: 'south_east',
    WEST: 'west',
    SOUTH_WEST: 'south_west',
    NORTH_WEST: 'north_west'
};

export type CaveRoomDirections = typeof CaveRoomDirections[keyof typeof CaveRoomDirections];
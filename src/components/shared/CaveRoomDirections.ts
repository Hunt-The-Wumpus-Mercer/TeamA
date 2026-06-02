// define cave room directions that a user can navigate or shoot
export const CaveRoomDirections = {
    NORTH: 'north',
    NORTH_WEST: 'north_west',
    NORTH_EAST: 'north_east',
    SOUTH: 'south',
    SOUTH_EAST: 'south_east',
    SOUTH_WEST: 'south_west',
};

export type CaveRoomDirections = typeof CaveRoomDirections[keyof typeof CaveRoomDirections];
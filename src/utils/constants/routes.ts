
const createPath = (path: string) => `${path}`;

export const routesPaths = {
    ROOT: createPath('/'),
    AUTH: createPath('/auth'),
    BRIDGE: createPath('/bridge'),
    CREATE_TOKEN: createPath('/create-token'),
    LAUNCH_PAD: createPath('/launch-pads'),
    CREATE_LAUNCH_PAD: createPath('/launch-pads/create'),
} as const;
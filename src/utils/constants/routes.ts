
const createPath = (path: string) => `${path}`;

export const routesPaths = {
    ROOT: createPath('/'),
    AUTH: createPath('/auth'),
    BRIDGE: createPath('/bridge'),
    CREATE_TOKEN: createPath('/create-token'),
    LAUNCHPAD: createPath('/launchpads'),
    CREATE_LAUNCHPAD: createPath('/launchpads/create'),
    LAUNCHPAD_DETAIL: (id: string) => createPath(`/launchpads/${id}`),
    LAUNCHPAD_DETAIL_PATTERN: createPath('/launchpads/:id'),
} as const;
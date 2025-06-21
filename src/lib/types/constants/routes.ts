
const createPath = (path: string) => `${path}`;

export const routesPaths = {
    ROOT: createPath('/'),
    AUTH: createPath('/auth'),
} as const;
export function getPathString(location: cloud.Location): string {
    return [location.scope, ...location.path].join('/');
};

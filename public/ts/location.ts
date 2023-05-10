// TODO: namepsace 만들기

export function getPathString(location: cloud.Location): string {
    return [location.scope, ...location.path].join('/');
};

export function getDownloadUrl(location: cloud.Location, file: cloud.File): string {
    return `/storage/${getPathString(location)}/${file.name}`;
};
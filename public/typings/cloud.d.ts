import { Socket } from 'socket.io-client';

declare global {
    namespace cloud {
        type EntityType = 'file' | 'directory';
        type FileState = 'normal' | 'uploading' | 'pending';

        interface Location {
            scope: string;
            path: string[];
        }

        interface Entity {
            type: cloud.EntityType;
            name: string;
            state: cloud.FileState;
        }

        interface Directory extends cloud.Entity {
            createdTime: number;
        }

        interface File extends cloud.Entity {
            createdTime: number;
            size: number;
            uploaded: number;
        }

        type Item = cloud.File | cloud.Directory;

        interface Meta {
            items: cloud.Item[];
        }

        namespace protocol {
            interface Error {
                message?: string;
            }

            namespace socketio {
                interface Query {
                    room: string;
                }
            }

            namespace storage {
                interface Response {
                    error?: cloud.protocol.Error;
                }

                interface GetRequest {

                }

                interface GetResponse extends Response {
                    items: cloud.Item[];
                }

                interface PostRequest {
                    entity: Entity;
                }

                interface PostResponse extends Response {

                }

                interface PutRequest {
                    type: cloud.EntityType;
                    entity: cloud.Entity;
                    newFilename: string;
                }

                interface PutResponse extends Response {

                }

                interface DeleteRequest {

                }

                interface DeleteResponse extends Response {

                }
            }
        }
    }
}


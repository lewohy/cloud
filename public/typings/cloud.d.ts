namespace cloud {
    type EntityType = 'file' | 'directory';
    type FileState = 'normal' | 'uploading' | 'pending';

    interface Location {
        scope: string;
        path: string[];
    }

    interface Entity {
        type: EntityType;
        name: string;
        state: cloud.FileState;
    }

    interface Directory extends Entity {
        createdTime: number;
    }

    interface File extends Entity {
        size: number;
        uploaded: number;
        createdTime: number;
    }

    interface Meta {
        entities: cloud.Entity[];
    }

    namespace protocol {
        interface Result {
            successed: boolean;
            message?: string;
        }

        namespace storage {
            interface GetRequest {
                
            }

            interface GetStorageResponse {
                result: Result;
                entities?: Array<File | Directory>;
            }
            
            interface PostRequest {
                entity: Entity;
            }

            interface PostResponse {
                result: Result;
            }

            interface DeleteRequest {
                
            }

            interface DeleteResponse {
                result: Result;
            }

            interface PutRequest {
                type: cloud.EntityType;
                entity: cloud.Entity;
                newFilename: string;
            }

            interface PutResponse {
                result: Result;
            }
        }
    }
}

interface A {
    
}

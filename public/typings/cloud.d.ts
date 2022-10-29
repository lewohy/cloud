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
        size: number;
        uploaded: number;
        createdTime: number;
    }

    type Item = cloud.File | cloud.Directory;

    interface Meta {
        items: cloud.Item[];
    }

    namespace protocol {
        interface Result {
            successed: boolean;
            message?: string;
        }

        namespace storage {
            interface GetRequest {
                
            }

            interface GetResponse {
                result: cloud.protocol.Result;
                items?: cloud.Item[];
            }
            
            interface PostRequest {
                entity: Entity;
            }

            interface PostResponse {
                result: cloud.protocol.Result;
            }

            interface DeleteRequest {
                
            }

            interface DeleteResponse {
                result: cloud.protocol.Result;
            }

            interface PutRequest {
                type: cloud.EntityType;
                entity: cloud.Entity;
                newFilename: string;
            }

            interface PutResponse {
                result: cloud.protocol.Result;
            }
        }
    }
}

interface A {
    
}

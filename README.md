# Cloud

## 설치 및 실행

```sh
git clone https://github.com/lewohy/cloud.git && \
cd cloud && \ 
yarn install && \
yarn run dev
```

## 설정

### 기본값

```json
{
    "port": 58001,
    "log": {
        "base": "logs",
        "debug": "[debug]-YYYY-MM-DD HH mm ss.log"
    },
    "path": {
        "storage": {
            "name": "storage",
            "contents": {
                "name": "contents"
            },
            "temp": {
                "name": "temp"
            },
            "meta": {
                "name": "meta.json"
            }
        },
        "preference": {
            "name": "preference",
            "share": {
                "name": "share.json"
            }
        }
    }
}
```

### `port`

- 타입: `string`

사용할 포트

### `log.base`

- 타입: `string`

로그 파일이 생성될 베이스 폴더

### `log.debug`

- 타입: `string`

로그 파일의 형식

### `path.storage.name`

- 타입: `string`

클라우드 서버가 저장소로 사용하게 될 최상위 디렉토리 경로

### `path.storage.content.name`

- 타입: `string`

업로드한 파일의 베이스폴더

### `path.storage.temp.name`

- 타입: `string`

파일 업로드 중에 사용될 임시 파일의 베이스폴더

### `path.storage.meta.name`

- 타입: `string`

파일의 메타데이터를 저장할 json파일 이름

### `path.preference.name`

- 타입: `string`

클라우드 서버가 실행 중에 필요한 설정들을 저장할 파일의 베이스 폴더

### `path.preference.share.name`

- 타입: `string`

파일 공유시에 해시값-경로가 저장될 json파일의 이름

# @jjoriping/eslint-plugin

수년 동안 코딩해 오면서 정립된 제 코딩 스타일을 가능한 한 재현하고 있는 ESLint 플러그인입니다.

## 설정 방법
ESLint 설정 파일에 다음을 추가합니다.
- 배열 `plugins`에 `@jjoriping/eslint-plugin` 추가
- 배열 `extends`에 `plugin:@jjoriping/eslint-plugin/all` 추가
- `parserOptions.project`를 적절한 값(예: `./tsconfig.json`)으로 설정

## 참고
- 이 플러그인은 단지 제 스타일을 ESLint로 나타내고 싶다는 지극히 개인적인 이유로 개발되었으며,
  결코 이 코딩 스타일이 여느 스타일들에 비해 합리적이라고 생각하고 배포하는 것이 아닙니다.
- 이 플러그인은 아래 ESLint 패키지에서 정의한 규칙들을 추가로 쓰고 있습니다.
  완벽한 재현을 위해서는 `plugins` 또는 `extends`에 있는 아래 패키지와 관련된 값들을 지워야 합니다.
  - `@typescript-eslint/eslint-plugin`
  - `eslint-plugin-import`
  - `eslint-plugin-react`
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-unicorn`
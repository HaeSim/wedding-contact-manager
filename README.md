# 결혼식 연락처 관리 시스템

결혼식 초대를 위한 연락처를 관리하고 필터링하는 웹 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Next.js 15.2.4
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI
- **상태 관리**: React Hooks (useState, useEffect)
- **데이터 저장**: localStorage

## 프로젝트 구조

```
├── app/                    # Next.js 앱 라우팅
│   ├── options/           # 옵션 설정 페이지
│   ├── results/           # 필터링 결과 페이지
│   ├── review/            # 연락처 검토 페이지
│   ├── upload/            # 파일 업로드 페이지
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 레이아웃 컴포넌트
│   └── page.tsx           # 메인 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # UI 컴포넌트
│   ├── bottom-nav.tsx    # 하단 네비게이션
│   └── theme-provider.tsx # 테마 제공자
├── lib/                   # 유틸리티 함수
│   ├── csv-parser.ts     # CSV 파싱 로직
│   └── utils.ts          # 기타 유틸리티
└── public/               # 정적 파일
```

## 주요 기능

### 1. 연락처 업로드

- CSV 파일 형식 지원
- 필수 필드: 이름, 전화번호
- 선택 필드: 친밀도, 그룹
- 파일 파싱 및 데이터 검증

### 2. 연락처 검토

- 업로드된 연락처 목록 표시
- 초대 여부 관리
- 친밀도 및 그룹 정보 수정

### 3. 필터링 및 내보내기

- 다양한 조건으로 연락처 필터링
- 초대 여부, 친밀도, 그룹별 필터링
- 필터링된 결과 내보내기

### 4. 대시보드

- 전체 연락처 통계
- 초대 현황
- 친밀도 및 그룹 정보 입력 현황
- 진행률 표시

## 데이터 구조

```typescript
interface Contact {
  name: string;
  phone: string;
  contact: string;
  intimacy: string;
  group: string;
  invited: boolean;
}

interface ContactSummary {
  total: number;
  invited: number;
  notInvited: number;
  withIntimacy: number;
  withGroup: number;
}
```

## 주요 로직

### 1. CSV 파싱

- CSV 파일을 라인별로 분리
- 각 라인을 콤마 또는 탭으로 구분
- 필수 필드 검증
- 데이터 정규화

### 2. 데이터 저장

- localStorage를 사용한 데이터 영구 저장
- JSON 형식으로 직렬화/역직렬화
- 데이터 무결성 검증

### 3. 통계 계산

- 실시간 통계 업데이트
- 진행률 계산
- 필터링된 결과 집계

## UI/UX 특징

- 모던하고 깔끔한 디자인
- 직관적인 네비게이션
- 반응형 레이아웃
- 진행 상황 시각화
- 사용자 친화적인 인터페이스

## 개발 가이드

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm run dev
```

3. 빌드

```bash
npm run build
```

4. 프로덕션 실행

```bash
npm start
```

# Amway 챔피언팀 공식 웹사이트

React + Vite + TypeScript(프론트) / Node.js + Express + Prisma + SQLite(백엔드)로 구성된 회사 소개·제품 노출·고객 게시판·관리자 제품 관리 웹사이트입니다.

## 폴더 구조

```
amway-champion/
├── client/   # 프론트엔드 (React + Vite + TS + Tailwind + react-router)
└── server/   # 백엔드 (Express + Prisma + SQLite)
```

## 1. 백엔드 실행 (server)

```bash
cd server
npm install
npx prisma migrate dev --name init   # DB 스키마 생성
npm run prisma:seed                  # 시드 데이터 삽입 (제품/게시글/관리자 계정)
npm run dev                          # http://localhost:4000
```

- 관리자 계정: `admin` / `admin1234`
- `.env` 파일에 `DATABASE_URL`, `SESSION_SECRET`, `CLIENT_ORIGIN`, `PORT`가 설정되어 있습니다. 배포 시 `SESSION_SECRET`을 반드시 변경하세요.

## 2. 프론트엔드 실행 (client)

새 터미널에서:

```bash
cd client
npm install
npm run dev                          # http://localhost:5173
```

Vite dev 서버는 `/api` 요청을 `http://localhost:4000`으로 프록시합니다 (`vite.config.ts` 참고). 브라우저에서 `http://localhost:5173` 접속 후 이용하세요.

## 3. 빌드

```bash
# 프론트엔드 프로덕션 빌드
cd client && npm run build   # dist/ 생성

# 백엔드는 별도 빌드 과정 없이 Node.js로 바로 실행
cd server && npm start
```

## API 요약

| Method | Endpoint | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | /api/products | 제품 목록 | - |
| GET | /api/products/:id | 제품 상세 | - |
| POST | /api/products | 제품 생성 | 관리자 |
| PUT | /api/products/:id | 제품 수정 | 관리자 |
| DELETE | /api/products/:id | 제품 삭제 | 관리자 |
| GET | /api/posts?boardType=FREE\|MEMBER | 게시글 목록 (게시판별) | MEMBER는 로그인 필요 |
| GET | /api/posts/:id | 게시글 상세 | 글이 MEMBER 게시판이면 로그인 필요 |
| POST | /api/posts | 게시글 작성 | MEMBER 게시판은 로그인 필요 (FREE는 비회원도 가능) |
| PUT | /api/posts/:id | 게시글 수정 | 작성자 본인(+관리자), 비회원 글은 비밀번호 |
| DELETE | /api/posts/:id | 게시글 삭제 | 작성자 본인(+관리자), 비회원 글은 비밀번호 |
| GET | /api/posts/:postId/comments | 댓글 목록 | 글이 MEMBER 게시판이면 로그인 필요 |
| POST | /api/posts/:postId/comments | 댓글 작성 | MEMBER 게시판은 로그인 필요 (FREE는 비회원도 가능) |
| DELETE | /api/posts/:postId/comments/:commentId | 댓글 삭제 | 작성자 본인(+관리자). 비회원 댓글은 관리자만 |
| GET | /api/posts/:postId/reactions | 이모지 반응 집계 조회 | 글이 MEMBER 게시판이면 로그인 필요 |
| POST | /api/posts/:postId/reactions | 이모지 반응 토글 | 로그인 필요 |
| POST | /api/auth/login | 관리자 로그인 | - |
| POST | /api/auth/logout | 로그아웃 | 관리자 |
| GET | /api/auth/me | 로그인 상태 확인 | 관리자 |
| POST | /api/members/register | 일반 회원가입 | - |
| POST | /api/members/login | 일반 회원 로그인 | - |
| POST | /api/members/logout | 일반 회원 로그아웃 | - |
| GET | /api/members/me | 회원 로그인 상태 확인 | - |

## 라우트

- 공개: `/`, `/about`, `/products`, `/products/:id`, `/board`(→`/board/free`), `/board/free`, `/board/members`, `/board/free/new`, `/board/members/new`, `/board/:id`, `/login`, `/signup`
- 관리자: `/admin/login`, `/admin`, `/admin/products` (비로그인 접근 시 `/admin/login`으로 리다이렉트)

## 일반 회원(방문자) 로그인

일반 방문자를 위한 회원가입/로그인 기능이 추가되었습니다 (기존 관리자 로그인과는 별개입니다).

- 로그인/회원가입은 **선택사항**입니다 — 로그인하지 않아도 제품·게시판 등 모든 공개 페이지를 그대로 이용할 수 있습니다.
- 홈 화면(`/`) 히어로 영역에 로그인/회원가입 카드가 바로 노출되며, 상단 네비게이션 바 오른쪽에서도 로그인 상태를 확인하고 로그인/로그아웃할 수 있습니다.
- 별도 페이지로 `/login`, `/signup`도 제공됩니다.
- 회원 정보는 `Member` 테이블(이메일 unique, 이름, bcrypt 해시 비밀번호)에 저장됩니다. 비밀번호는 6자 이상이어야 합니다.

**⚠️ 기존에 이미 `npx prisma migrate dev`를 한 번 실행하셨다면, `Member` 테이블을 추가하기 위해 마이그레이션을 다시 한 번 실행해야 합니다.**

```bash
cd server
npx prisma migrate dev --name add_member
npm run dev   # 서버 재시작
```

기존 제품/게시글/관리자 데이터는 그대로 유지되며, `Member` 테이블만 새로 추가됩니다.

## 게시판 (자유 게시판 / 회원 전용 게시판)

고객 게시판이 두 종류로 나뉩니다.

- **자유 게시판** (`/board/free`) — 비회원도 글을 쓸 수 있습니다. 로그인하지 않고 글을 쓸 때는 작성자 이름과 비밀번호(4자 이상)를 함께 입력하며, 이 비밀번호로 나중에 글을 수정·삭제할 수 있습니다. 로그인한 회원은 이름/비밀번호 입력 없이 계정 이름으로 바로 작성됩니다.
- **회원 전용 게시판** (`/board/members`) — 로그인한 회원만 글 목록을 보고 작성할 수 있습니다. 비로그인 상태에서 접근하면 로그인 안내 화면이 표시됩니다.

**글 수정/삭제 권한**: 회원이 작성한 글은 본인(또는 관리자)만 수정·삭제할 수 있습니다. 비회원이 작성한 글(자유 게시판)은 작성 시 입력한 비밀번호를 입력해야 수정·삭제할 수 있습니다 (관리자는 비밀번호 없이 항상 가능).

**댓글**: 게시글 상세 페이지에서 댓글을 남길 수 있습니다. 자유 게시판 글에는 비회원도 이름을 입력하고 댓글을 달 수 있고, 회원 전용 게시판 글에는 로그인해야 댓글을 달 수 있습니다. 댓글 삭제는 작성자 본인(회원)과 관리자만 가능하며, 비회원이 남긴 댓글은 관리자만 삭제할 수 있습니다.

**이모지 반응**: 게시글마다 👍❤️😂😮😢👏 6가지 정해진 이모지로 반응을 남길 수 있습니다. 반응은 로그인한 회원만 남길 수 있고, 같은 이모지를 다시 누르면 취소(토글)됩니다.

**시드 데이터**: `npm run prisma:seed` 실행 시 자유 게시판 글 3개(수정/삭제 테스트용 비밀번호: `1234`), 데모 회원 계정(`member@example.com` / `member1234`), 그 회원이 작성한 회원 전용 게시판 글 2개와 댓글·반응 예시가 함께 생성됩니다.

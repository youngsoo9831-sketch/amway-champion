const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const products = [
  {
    name: "뉴트리라이트 데일리 멀티비타민",
    price: 45000,
    summary: "매일 챙기는 균형 잡힌 종합 비타민·미네랄",
    description:
      "뉴트리라이트 데일리는 자체 재배한 원료를 기반으로 만든 종합 비타민·미네랄 보충제입니다. 바쁜 일상 속에서도 균형 잡힌 영양 섭취를 돕습니다.",
    imageUrl: "https://picsum.photos/seed/nutrilite-daily/600/450",
  },
  {
    name: "뉴트리라이트 비타민C 플러스",
    price: 32000,
    summary: "천연 아세로라 유래 고함량 비타민C",
    description:
      "천연 아세로라 체리에서 추출한 비타민C에 바이오플라보노이드를 더해 흡수율을 높인 제품입니다.",
    imageUrl: "https://picsum.photos/seed/nutrilite-vitc/600/450",
  },
  {
    name: "뉴트리라이트 오메가3",
    price: 58000,
    summary: "혈행 개선에 도움을 주는 고순도 오메가3",
    description:
      "EPA·DHA 함유 오메가3로 혈행 개선과 두뇌 건강 관리에 도움을 줍니다.",
    imageUrl: "https://picsum.photos/seed/nutrilite-omega3/600/450",
  },
  {
    name: "아이쿡 스테인리스 프라이팬 세트",
    price: 189000,
    summary: "5중 구조로 열전도가 균일한 프리미엄 팬 세트",
    description:
      "아이쿡(iCook) 스테인리스 조리기구는 다중 접합 구조로 열이 골고루 전달되어 적은 기름으로도 건강한 조리가 가능합니다.",
    imageUrl: "https://picsum.photos/seed/icook-pan/600/450",
  },
  {
    name: "아이쿡 냄비 3종 세트",
    price: 259000,
    summary: "한 세트로 끝내는 인덕션 겸용 냄비 구성",
    description:
      "국·찌개부터 볶음 요리까지 활용할 수 있는 냄비 3종 세트로, 인덕션을 포함한 모든 열원에서 사용 가능합니다.",
    imageUrl: "https://picsum.photos/seed/icook-pot/600/450",
  },
  {
    name: "이스프링 정수 시스템",
    price: 890000,
    summary: "가정용 프리미엄 언더싱크 정수 시스템",
    description:
      "이스프링(eSpring) 정수 시스템은 UV 살균과 정밀 필터링으로 깨끗한 물을 공급하는 헬스케어 가전입니다.",
    imageUrl: "https://picsum.photos/seed/espring/600/450",
  },
  {
    name: "아트리스트리 스튜디오 쿠션 파운데이션",
    price: 68000,
    summary: "촉촉한 커버력의 프리미엄 쿠션 파운데이션",
    description:
      "아트리스트리(Artistry) 스튜디오 쿠션은 가볍게 밀착되면서도 뛰어난 커버력을 제공하는 뷰티 제품입니다.",
    imageUrl: "https://picsum.photos/seed/artistry-cushion/600/450",
  },
  {
    name: "SA8 프리미엄 액체세제",
    price: 24000,
    summary: "고농축 저잔여 액체 세탁 세제",
    description:
      "SA8 프리미엄 액체세제는 고농축 포뮬러로 적은 양으로도 뛰어난 세정력을 발휘하며, 헹굼 후 잔여물이 적습니다.",
    imageUrl: "https://picsum.photos/seed/sa8-liquid/600/450",
  },
  {
    name: "홈 케어 다목적 클리너",
    price: 18000,
    summary: "주방·욕실 어디에나 쓰는 다목적 세정제",
    description:
      "생분해성 성분을 사용한 다목적 클리너로 주방, 욕실 등 집안 곳곳의 표면을 안전하게 세정합니다.",
    imageUrl: "https://picsum.photos/seed/homecare-cleaner/600/450",
  },
  {
    name: "사틴ique 모이스처 샴푸",
    price: 29000,
    summary: "두피부터 모발 끝까지 촉촉하게",
    description:
      "사틴nique(Satinique) 모이스처 샴푸는 손상된 모발에 수분을 공급하고 부드러운 마무리감을 선사합니다.",
    imageUrl: "https://picsum.photos/seed/satinique-shampoo/600/450",
  },
  {
    name: "지앤에이치 바디워시",
    price: 21000,
    summary: "은은한 향의 순한 저자극 바디워시",
    description:
      "피부 자극을 최소화한 저자극 포뮬러로 온 가족이 안심하고 사용할 수 있는 목욕용품입니다.",
    imageUrl: "https://picsum.photos/seed/gh-bodywash/600/450",
  },
  {
    name: "뉴트리라이트 프로틴 파우더",
    price: 62000,
    summary: "식물성 단백질로 채우는 건강한 한 끼",
    description:
      "대두 및 완두 단백질을 기반으로 한 식물성 프로틴 파우더로 운동 전후 영양 보충에 적합합니다.",
    imageUrl: "https://picsum.photos/seed/nutrilite-protein/600/450",
  },
];

// 자유 게시판 - 비회원 작성 글 (수정/삭제 테스트용 비밀번호: 1234)
const freeBoardPosts = [
  {
    title: "챔피언팀 웹사이트 오픈을 축하드립니다!",
    author: "관리자",
    content:
      "안녕하세요, Amway 챔피언팀 공식 웹사이트가 새롭게 오픈했습니다. 제품 소개와 고객 게시판을 통해 더 편리하게 소통할 수 있게 되었습니다. 많은 관심 부탁드립니다.",
  },
  {
    title: "뉴트리라이트 비타민C 후기 남겨요",
    author: "김영희",
    content:
      "매일 아침 뉴트리라이트 비타민C를 챙겨 먹은 지 한 달이 넘었는데 확실히 컨디션이 좋아진 것 같아요. 다음에는 오메가3도 함께 구매해보려고 합니다.",
  },
  {
    title: "아이쿡 프라이팬 세트 문의드립니다",
    author: "박철수",
    content:
      "아이쿡 프라이팬 세트를 구매하고 싶은데 인덕션에서도 사용 가능한지 궁금합니다. 그리고 방문 상담도 가능한지 답변 부탁드려요.",
  },
];

const DEMO_GUEST_PASSWORD = "1234";

async function main() {
  console.log("🌱 시드 데이터 생성을 시작합니다...");

  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.member.deleteMany();

  await prisma.product.createMany({ data: products });
  console.log(`✅ 제품 ${products.length}개 생성 완료`);

  const guestPasswordHash = await bcrypt.hash(DEMO_GUEST_PASSWORD, 10);
  await prisma.post.createMany({
    data: freeBoardPosts.map((p) => ({
      ...p,
      boardType: "FREE",
      guestPasswordHash,
    })),
  });
  console.log(`✅ 자유 게시판 글 ${freeBoardPosts.length}개 생성 완료 (수정/삭제 비밀번호: ${DEMO_GUEST_PASSWORD})`);

  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  await prisma.admin.create({
    data: {
      username: "admin",
      passwordHash: adminPasswordHash,
    },
  });
  console.log("✅ 관리자 계정 생성 완료 (admin / admin1234)");

  // 데모 회원 계정 + 회원 전용 게시판 글/댓글/반응
  const memberPasswordHash = await bcrypt.hash("member1234", 10);
  const demoMember = await prisma.member.create({
    data: {
      email: "member@example.com",
      name: "홍길동",
      passwordHash: memberPasswordHash,
    },
  });
  console.log("✅ 데모 회원 계정 생성 완료 (member@example.com / member1234)");

  const memberPost = await prisma.post.create({
    data: {
      boardType: "MEMBER",
      title: "회원 전용 게시판 첫 글입니다",
      author: demoMember.name,
      content:
        "회원님들만 볼 수 있는 게시판이에요. 자유롭게 이야기 나눠주세요! 댓글과 이모지 반응도 남겨보세요.",
      authorMemberId: demoMember.id,
    },
  });

  await prisma.post.create({
    data: {
      boardType: "MEMBER",
      title: "이번 달 신제품 후기 공유해요",
      author: demoMember.name,
      content:
        "최근에 구매한 뉴트리라이트 프로틴 파우더 후기입니다. 맛도 괜찮고 든든해서 만족스러워요.",
      authorMemberId: demoMember.id,
    },
  });

  await prisma.comment.create({
    data: {
      postId: memberPost.id,
      content: "환영합니다! 앞으로 자주 이용할게요 :)",
      author: demoMember.name,
      authorMemberId: demoMember.id,
    },
  });

  await prisma.reaction.create({
    data: { postId: memberPost.id, memberId: demoMember.id, emoji: "LIKE" },
  });

  console.log("✅ 회원 전용 게시판 글/댓글/반응 생성 완료");

  console.log("🎉 시드 데이터 생성이 완료되었습니다.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

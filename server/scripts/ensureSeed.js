// 배포 환경에서 DB가 비어있을 때만 자동으로 시드 데이터를 채워주는 스크립트.
// (무료 호스팅은 재배포/재시작 시 디스크가 초기화될 수 있어, 매번 빈 사이트로
//  뜨는 것을 방지하기 위해 사용한다. 기존 데이터가 있으면 아무 것도 하지 않는다.)
const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminCount = await prisma.admin.count();
  const productCount = await prisma.product.count();
  await prisma.$disconnect();

  if (adminCount === 0 && productCount === 0) {
    console.log("🌱 데이터베이스가 비어있어 시드 데이터를 생성합니다...");
    execSync("node prisma/seed.js", { stdio: "inherit" });
  } else {
    console.log("✅ 기존 데이터가 있어 시드 단계를 건너뜁니다.");
  }
}

main().catch((err) => {
  console.error("시드 확인 중 오류가 발생했습니다:", err);
  // 시드 실패로 서버 전체가 죽지 않도록 종료 코드는 0으로 둔다.
  process.exit(0);
});

const VALUES = [
  {
    title: "정직과 신뢰",
    desc: "검증된 Amway 제품과 투명한 정보 제공으로 고객의 신뢰를 최우선으로 생각합니다.",
  },
  {
    title: "건강한 삶",
    desc: "뉴트리라이트를 중심으로 한 영양 솔루션으로 고객의 건강한 하루를 지원합니다.",
  },
  {
    title: "지속가능성",
    desc: "환경을 생각하는 제품과 소비 습관을 함께 만들어갑니다.",
  },
  {
    title: "함께 성장",
    desc: "챔피언팀은 고객, 파트너와 함께 성장하는 것을 목표로 합니다.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold text-accent-600">About Us</p>
        <h1 className="section-title mt-2">챔피언팀 소개</h1>
        <p className="mt-4 text-gray-600">
          Amway 챔피언팀은 뉴트리라이트, 아이쿡, 아트리스트리 등 Amway의
          다양한 제품을 소개하고, 고객 한 분 한 분에게 맞는 건강하고
          지속가능한 라이프스타일을 제안하는 독립 사업자 팀입니다.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-xl font-bold text-gray-900">우리의 이야기</h2>
          <p className="mt-3 text-gray-600">
            챔피언팀은 오랜 시간 Amway와 함께하며 수많은 고객에게 건강한
            변화를 안내해 왔습니다. 제품에 대한 깊은 이해와 진심 어린 상담을
            바탕으로, 고객이 자신에게 꼭 맞는 제품을 찾을 수 있도록
            돕습니다.
          </p>
          <p className="mt-3 text-gray-600">
            이 웹사이트는 챔피언팀의 제품 소개와 고객과의 소통을 위해
            운영되는 공식 채널입니다. 궁금한 점은 언제든 고객 게시판을
            통해 남겨주세요.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">핵심 가치</h2>
          <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div key={value.title} className="card p-5">
                <dt className="font-semibold text-primary-900">
                  {value.title}
                </dt>
                <dd className="mt-1.5 text-sm text-gray-600">{value.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

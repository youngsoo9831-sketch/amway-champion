require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Amway 챔피언팀 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

// 씨드페이 결제결과 비동기 통보(webhook) 수신 엔드포인트.
// 등록 경로: 씨드페이 가맹점 관리자 → 가맹점정보 → 결제환경 설정 → 결제결과 통보관리
//   URL: https://<배포도메인>/api/payment/webhook
// 씨드페이는 이 엔드포인트에 3.35.204.59 에서 접속하므로, 방화벽을 쓴다면 해당 IP를 인바운드 허용해야 한다.
// 200이 아닌 응답을 주면 씨드페이가 재전송을 시도하므로, 처리 후 반드시 200을 반환한다.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const payload = req.body || {};

  // TODO: Supabase 연결 후 payload(resultCd, tid, orderId, amount, mbsReserved 등)를 주문 테이블에 반영
  console.log("[seedpay:webhook]", JSON.stringify(payload));

  res.status(200).send("OK");
};

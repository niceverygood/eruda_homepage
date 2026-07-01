const { getPool } = require("./_db");

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
  const { orderId: orderNumber, resultCd, trxStCd } = payload;

  console.log("[seedpay:webhook]", JSON.stringify(payload));

  if (!orderNumber) {
    res.status(200).send("OK");
    return;
  }

  const pool = getPool();

  try {
    const orderRes = await pool.query("select id from orders where order_number = $1", [orderNumber]);
    const order = orderRes.rows[0];
    if (!order) {
      res.status(200).send("OK");
      return;
    }

    // 결제 취소 통보(trxStCd 존재)와 승인 통보(resultCd)를 구분해서 반영
    if (trxStCd) {
      await pool.query(
        "update orders set status = 'cancelled', updated_at = now() where id = $1",
        [order.id],
      );
      await pool.query(
        "update payments set status = 'cancelled', cancelled_at = now(), raw_response = $2, updated_at = now() where order_id = $1",
        [order.id, JSON.stringify(payload)],
      );
    } else if (resultCd) {
      const approved = resultCd === "0000";
      await pool.query(
        `update payments set
           status = $2, raw_response = $3, updated_at = now(),
           approved_at = case when $2 = 'approved' then now() else approved_at end
         where order_id = $1`,
        [order.id, approved ? "approved" : "failed", JSON.stringify(payload)],
      );
      await pool.query("update orders set status = $2, updated_at = now() where id = $1", [
        order.id,
        approved ? "paid" : "failed",
      ]);
    }
  } catch (err) {
    console.error("[seedpay:webhook] error", err);
  }

  res.status(200).send("OK");
};

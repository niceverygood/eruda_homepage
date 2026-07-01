const crypto = require("crypto");
const { getPool } = require("./_db");

// SeedPay 결제창(SDK)이 결제 완료 후 돌아오는 returnUrl.
// 여기서 씨드페이 승인 API(/payment/v1/approval)를 서버 사이드로 호출해 최종 승인 처리한다.
//
// 주의: hashString 공식은 씨드페이 공식 문서에 "tid + mId + ediDate + amount + orderId + 가맹점KEY"
// 조합이라고만 나와있고 구체적 해시 알고리즘(SHA256 여부, 인코딩)은 명시되어 있지 않다.
// 아래는 국내 PG 표준 관례(SHA256 hex)를 가정한 best-effort 구현이며,
// 실제 승인 시도해보면서 검증/수정이 필요하다.
const buildHashString = (tid, mId, ediDate, amount, orderId, key) =>
  crypto.createHash("sha256").update(`${tid}${mId}${ediDate}${amount}${orderId}${key}`).digest("hex");

module.exports = async (req, res) => {
  const params = { ...req.query, ...(req.body || {}) };
  const { tid, ediDate, orderId: orderNumber, amount, payData, mbsReserved } = params;

  const mId = process.env.SEEDPAY_MID;
  const key = process.env.SEEDPAY_KEY;
  const baseUrl = process.env.SEEDPAY_BASE_URL || "https://devpay.seedpayments.co.kr";

  if (!mId || !key) {
    res.status(500).send("SeedPay 환경변수(SEEDPAY_MID/SEEDPAY_KEY)가 설정되지 않았습니다.");
    return;
  }

  if (!tid || !ediDate || !orderNumber || !amount || !payData) {
    res.redirect(302, "/?payment=fail&reason=missing_params");
    return;
  }

  const pool = getPool();

  try {
    const orderRes = await pool.query(
      "select id, amount, status from orders where order_number = $1",
      [orderNumber],
    );
    const order = orderRes.rows[0];
    if (!order) {
      res.redirect(302, "/?payment=fail&reason=order_not_found");
      return;
    }
    if (Number(order.amount) !== Number(amount)) {
      // 금액 위변조 의심 — 승인 진행하지 않음
      await pool.query("update orders set status = 'failed', updated_at = now() where id = $1", [order.id]);
      res.redirect(302, "/?payment=fail&reason=amount_mismatch");
      return;
    }

    const hashString = buildHashString(tid, mId, ediDate, amount, orderNumber, key);

    const approvalRes = await fetch(`${baseUrl}/payment/v1/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nonce: crypto.randomUUID(),
        tid,
        ediDate,
        mId,
        amount,
        hashString,
        payData,
        mbsReserved,
      }),
    });

    const result = await approvalRes.json();
    const approved = result.resultCd === "0000";

    await pool.query(
      `update payments set
         status = $2,
         pg_transaction_id = $3,
         raw_response = $4,
         approved_at = case when $2 = 'approved' then now() else approved_at end,
         failed_at = case when $2 = 'failed' then now() else failed_at end,
         failed_reason = case when $2 = 'failed' then $5 else failed_reason end,
         updated_at = now()
       where order_id = $1`,
      [order.id, approved ? "approved" : "failed", tid, JSON.stringify(result), result.resultMsg || result.resultCd],
    );

    await pool.query("update orders set status = $2, updated_at = now() where id = $1", [
      order.id,
      approved ? "paid" : "failed",
    ]);

    if (approved) {
      res.redirect(302, `/?payment=success&orderId=${encodeURIComponent(orderNumber)}`);
    } else {
      res.redirect(302, `/?payment=fail&reason=${encodeURIComponent(result.resultMsg || result.resultCd)}`);
    }
  } catch (err) {
    res.redirect(302, "/?payment=fail&reason=server_error");
  }
};

const crypto = require("crypto");

// SeedPay 결제창(SDK)이 결제 완료 후 돌아오는 returnUrl.
// 여기서 씨드페이 승인 API(/payment/v1/approval)를 서버 사이드로 호출해 최종 승인 처리한다.
//
// 주의: hashString 공식은 씨드페이 공식 문서에 "tid + mId + ediDate + amount + orderId + 가맹점KEY"
// 조합이라고만 나와있고 구체적 해시 알고리즘(SHA256 여부, 인코딩)은 명시되어 있지 않다.
// 아래는 국내 PG 표준 관례(SHA256 hex)를 가정한 best-effort 구현이며,
// 개발계 테스트 MID로 실제 승인 시도해보면서 검증/수정이 필요하다.
const buildHashString = (tid, mId, ediDate, amount, orderId, key) =>
  crypto.createHash("sha256").update(`${tid}${mId}${ediDate}${amount}${orderId}${key}`).digest("hex");

module.exports = async (req, res) => {
  const params = { ...req.query, ...(req.body || {}) };
  const { tid, ediDate, orderId, amount, payData, mbsReserved } = params;

  const mId = process.env.SEEDPAY_MID;
  const key = process.env.SEEDPAY_KEY;
  const baseUrl = process.env.SEEDPAY_BASE_URL || "https://devpay.seedpayments.co.kr";

  if (!mId || !key) {
    res.status(500).send("SeedPay 환경변수(SEEDPAY_MID/SEEDPAY_KEY)가 설정되지 않았습니다.");
    return;
  }

  if (!tid || !ediDate || !orderId || !amount || !payData) {
    res.redirect(302, "/?payment=fail&reason=missing_params");
    return;
  }

  try {
    const hashString = buildHashString(tid, mId, ediDate, amount, orderId, key);

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

    if (result.resultCd === "0000") {
      // TODO: Supabase 연결 후 주문/결제 결과를 DB에 저장
      res.redirect(302, `/?payment=success&orderId=${encodeURIComponent(orderId)}`);
    } else {
      res.redirect(302, `/?payment=fail&reason=${encodeURIComponent(result.resultMsg || result.resultCd)}`);
    }
  } catch (err) {
    res.redirect(302, `/?payment=fail&reason=server_error`);
  }
};

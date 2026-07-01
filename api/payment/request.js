const crypto = require("crypto");
const { PRODUCTS } = require("./_catalog");

// 결제 요청 준비 엔드포인트.
// 프론트엔드가 상품 ID만 넘기면, 가격은 서버 카탈로그(_catalog.js)에서만 읽는다 —
// 클라이언트가 amount를 직접 보내지 않게 해서 결제창 호출 전 단계에서 금액 위변조를 막는다.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const mId = process.env.SEEDPAY_MID;
  if (!mId) {
    res.status(500).json({ error: "SEEDPAY_MID_NOT_CONFIGURED", message: "개발계 테스트 MID가 아직 .env에 설정되지 않았습니다." });
    return;
  }

  const { productId, customerName, customerEmail, customerMobilePhone, returnUrl } = req.body || {};
  const product = PRODUCTS[productId];
  if (!product) {
    res.status(400).json({ error: "INVALID_PRODUCT" });
    return;
  }
  if (!customerName || !customerEmail || !customerMobilePhone) {
    res.status(400).json({ error: "MISSING_CUSTOMER_INFO" });
    return;
  }

  const orderId = `IRUDA${Date.now()}${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

  res.status(200).json({
    method: "CARD",
    mId,
    amount: product.amount,
    orderId,
    orderName: product.name,
    returnUrl: returnUrl || `${req.headers.origin || ""}/api/payment/approve`,
    customerName,
    customerMobilePhone,
    customerEmail,
  });
};

const crypto = require("crypto");
const { getPool } = require("./_db");

// 결제 요청 준비 엔드포인트.
// 상품 가격은 Supabase products 테이블에서만 읽는다 — 클라이언트가 amount를 직접 보내지 않게 해서
// 결제창 호출 전 단계에서 금액 위변조를 막는다.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const mId = process.env.SEEDPAY_MID;
  if (!mId) {
    res.status(500).json({ error: "SEEDPAY_MID_NOT_CONFIGURED", message: "SeedPay MID가 아직 설정되지 않았습니다." });
    return;
  }

  const { productId, customerName, customerEmail, customerMobilePhone, returnUrl } = req.body || {};
  if (!productId || !customerName || !customerEmail || !customerMobilePhone) {
    res.status(400).json({ error: "MISSING_FIELDS" });
    return;
  }

  const pool = getPool();

  try {
    const productRes = await pool.query(
      "select id, name, price from products where slug = $1 and is_active = true",
      [productId],
    );
    const product = productRes.rows[0];
    if (!product) {
      res.status(400).json({ error: "INVALID_PRODUCT" });
      return;
    }

    const orderNumber = `IRUDA${Date.now()}${crypto.randomBytes(3).toString("hex")}`.toUpperCase();
    const origin = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : "");
    const resolvedReturnUrl = returnUrl || `${origin}/api/payment/approve`;

    const orderRes = await pool.query(
      `insert into orders
        (order_number, is_guest, buyer_name, buyer_phone, buyer_email, product_id, product_name_snapshot, amount, status)
       values ($1, true, $2, $3, $4, $5, $6, $7, 'pending')
       returning id`,
      [orderNumber, customerName, customerMobilePhone, customerEmail, product.id, product.name, product.price],
    );
    const orderRowId = orderRes.rows[0].id;

    const sdkPayload = {
      method: "CARD",
      mId,
      amount: product.price,
      orderId: orderNumber,
      orderName: product.name,
      returnUrl: resolvedReturnUrl,
      customerName,
      customerMobilePhone,
      customerEmail,
    };

    await pool.query(
      `insert into payments (order_id, pg_provider, method, amount, status, raw_request)
       values ($1, 'seedpay', 'card', $2, 'requested', $3)`,
      [orderRowId, product.price, JSON.stringify(sdkPayload)],
    );

    res.status(200).json(sdkPayload);
  } catch (err) {
    res.status(500).json({ error: "SERVER_ERROR", message: err.message });
  }
};

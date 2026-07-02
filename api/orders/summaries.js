const { getPool } = require("../payment/_db");

// 결제 완료된 주문에 한해, CTI 녹취에서 생성된 AI 통화 요약 목록을 반환한다.
// 요약 데이터는 CTI(시그널360) 녹취를 STT+AI 분석해 cti_call_summaries 에 적재한 것.
module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const orderNumber = req.query.orderId;
  if (!orderNumber) {
    res.status(400).json({ error: "MISSING_ORDER_ID" });
    return;
  }

  const pool = getPool();

  try {
    const orderRes = await pool.query(
      "select order_number, status, product_name_snapshot, buyer_name from orders where order_number = $1",
      [orderNumber],
    );
    const order = orderRes.rows[0];
    if (!order) {
      res.status(404).json({ error: "ORDER_NOT_FOUND" });
      return;
    }
    if (order.status !== "paid") {
      res.status(403).json({ error: "ORDER_NOT_PAID" });
      return;
    }

    const summariesRes = await pool.query(
      `select customer_masked_name, call_duration, call_quality,
              summary, needs_category, needs_detail, qa_result, analyzed_at
       from cti_call_summaries
       order by call_duration desc nulls last, analyzed_at desc
       limit 6`,
    );

    res.status(200).json({
      order: {
        orderNumber: order.order_number,
        productName: order.product_name_snapshot,
        buyerName: order.buyer_name,
      },
      items: summariesRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "SERVER_ERROR", message: err.message });
  }
};

const crypto = require("crypto");

// SOLAPI 문자 발송 헬퍼.
// 알림 실패가 결제 처리를 막으면 안 되므로, 호출부에서는 항상 await 후 결과만 로깅하고 무시한다.
function authHeader() {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha256", apiSecret).update(date + salt).digest("hex");
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

async function sendSms(to, text) {
  if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET || !process.env.SOLAPI_SENDER) {
    console.warn("[solapi] env not configured, skip sms");
    return;
  }
  try {
    const res = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: JSON.stringify({
        message: {
          to: String(to).replace(/[^0-9]/g, ""),
          from: process.env.SOLAPI_SENDER,
          text,
        },
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      console.error("[solapi] send failed", res.status, JSON.stringify(body));
    }
  } catch (err) {
    console.error("[solapi] send error", err);
  }
}

// 결제 완료 시 구매자 + 관리자에게 문자 발송
async function notifyPaid({ orderNumber, productName, amount, buyerName, buyerPhone }) {
  const won = new Intl.NumberFormat("ko-KR").format(amount);
  const tasks = [
    sendSms(
      buyerPhone,
      `[이루다] ${buyerName}님, 결제가 완료되었습니다.\n상품: ${productName}\n금액: ${won}원\n주문번호: ${orderNumber}`,
    ),
  ];
  if (process.env.ADMIN_PHONE) {
    tasks.push(
      sendSms(
        process.env.ADMIN_PHONE,
        `[이루다] 새 주문 결제완료\n${productName} ${won}원\n${buyerName} ${buyerPhone}\n주문번호: ${orderNumber}`,
      ),
    );
  }
  await Promise.all(tasks);
}

module.exports = { sendSms, notifyPaid };

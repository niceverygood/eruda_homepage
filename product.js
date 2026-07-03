// 상품 상세 페이지: URL ?id= 로 상품을 찾아 렌더링하고, SeedPay 결제를 진행한다.
// 데이터는 index.html 상품 카드와 동일한 내용의 단일 소스.

const PRODUCTS = {
  "analysis-general": {
    badge: "일반",
    badgeWarm: false,
    category: "보장 분석",
    target: "20~50대 일반 고객 타겟",
    name: "보장 분석 리모델링 (일반)",
    price: 90000,
    image: "assets/optimized/product-saving-premium.jpg",
    desc: "본인 보장 내역이 궁금해 직접 분석을 신청한 20~50대 고객 DB입니다. 가입 내역 점검 니즈가 확인된 상태라 첫 통화에서 상담 흐름을 잡기 쉽습니다.",
    bullets: ["현재 가입된 보장 내역 전체 분석", "과부족 보장 항목 리모델링 제안", "상담 우선순위 정리용 메모 제공"],
    fields: ["이름", "연락처", "나이/성별", "거주 지역", "신청 경로", "관심 항목", "상담 가능 시간"],
    script:
      "안녕하세요 고객님, 보장 분석 신청해 주셔서 연락드린 ○○○ 설계사입니다.\n남겨주신 내용 보니까 현재 가입하신 보험 보장이 잘 되어 있는지 궁금하셔서 신청 주셨더라고요.\n지금 갖고 계신 증권 기준으로 과한 부분은 줄이고 부족한 보장은 채우는 방향으로 정리해서 안내드릴게요. 통화 5분 정도 괜찮으실까요?",
    as: "부재, 오기입, 중복, 가망 없음 등 검수 기준 충족 시 재배정 지원",
  },
  "analysis-silver": {
    badge: "실버",
    badgeWarm: true,
    category: "보장 분석",
    target: "고령자·부모님 세대 실버 타겟",
    name: "보장 분석 리모델링 (실버)",
    price: 80000,
    image: "assets/optimized/product-silver-premium.jpg",
    desc: "부모님 또는 본인의 노후 보장을 점검하고 싶어 신청한 고령자 타겟 DB입니다. 건강 상태별 리모델링 포인트가 함께 제공돼 상담 준비가 수월합니다.",
    bullets: ["고령자·부모님 보장 내역 분석", "건강 상태별 리모델링 포인트 구성", "전담 CS 재배정 지원 포함"],
    fields: ["이름", "연락처", "나이/성별", "거주 지역", "신청 경로", "건강 관심사", "상담 가능 시간"],
    script:
      "안녕하세요 고객님, 보장 점검 신청 주셔서 연락드린 ○○○ 설계사입니다.\n요즘 나이 들수록 병원비 걱정이 크시잖아요. 신청서에 남겨주신 내용 기준으로, 지금 갖고 계신 보험에서 실제로 보장받을 수 있는 항목이 어디까지인지 알기 쉽게 정리해 드리려고 해요.\n어렵게 설명 안 드리고 꼭 필요한 것만 짚어드릴게요. 잠깐 통화 괜찮으세요?",
    as: "부재, 오기입, 중복, 가망 없음 등 검수 기준 충족 시 재배정 지원 (전담 CS 포함)",
  },
  "replan-silver": {
    badge: "실버",
    badgeWarm: true,
    category: "플랜 재설계",
    target: "보험료 조정 니즈가 확인된 실버 타겟",
    name: "보험료 플랜 재설계 (실버)",
    price: 70000,
    image: "assets/optimized/product-silver-max.jpg",
    desc: "매달 나가는 보험료가 부담돼 조정을 원하는 실버 고객 DB입니다. 보험료 절감이라는 명확한 니즈가 있어 상담 목적이 뚜렷하고, 월별 재구매 플랜 구성에 유리합니다.",
    bullets: ["실버 고객 보험료 부담 완화 설계", "월별 재구매 플랜 구성에 유리", "세분 타겟 옵션 선택 가능"],
    fields: ["이름", "연락처", "나이/성별", "거주 지역", "월 보험료 수준", "신청 경로", "상담 가능 시간"],
    script:
      "안녕하세요 고객님, 보험료 조정 상담 신청해 주셔서 연락드린 ○○○ 설계사입니다.\n매달 내시는 보험료가 부담되신다고 남겨주셨는데요, 보장은 최대한 유지하면서 보험료만 줄이는 방법이 있는지 지금 내역 기준으로 확인해 드릴게요.\n증권만 있으시면 5분 안에 비교해서 알려드릴 수 있습니다. 지금 통화 괜찮으실까요?",
    as: "부재, 오기입, 중복, 가망 없음 등 검수 기준 충족 시 재배정 지원",
  },
  "replan-general": {
    badge: "일반",
    badgeWarm: false,
    category: "플랜 재설계",
    target: "대량 캠페인·팀 운영에 맞는 일반 타겟",
    name: "보험료 플랜 재설계 (일반)",
    price: 80000,
    image: "assets/optimized/product-saving-max.jpg",
    desc: "보험료 재설계를 원하는 일반 고객 DB로, 대량 캠페인 운영과 팀 단위 배분에 최적화된 구성입니다. 유입 채널별 품질 체크를 거쳐 공급됩니다.",
    bullets: ["대량 캠페인 운영을 위한 구성", "유입 채널별 품질 체크", "팀 단위 배분에 최적화"],
    fields: ["이름", "연락처", "나이/성별", "거주 지역", "유입 채널", "관심 항목", "상담 가능 시간"],
    script:
      "안녕하세요 고객님, 보험료 재설계 신청 주셔서 연락드린 ○○○ 설계사입니다.\n지금 내고 계신 보험료가 적정한지 궁금하셔서 신청 주신 걸로 확인했는데요, 같은 보장 기준으로 보험료를 비교해 보면 조정 여지가 있는 경우가 많습니다.\n부담 없이 현재 상태 점검부터 도와드릴게요. 잠시 통화 가능하실까요?",
    as: "부재, 오기입, 중복, 가망 없음 등 검수 기준 충족 시 재배정 지원",
  },
};

const formatPrice = (value) => `${new Intl.NumberFormat("ko-KR").format(value)}원`;

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const product = PRODUCTS[productId];

if (!product) {
  window.location.replace("index.html#products");
} else {
  document.title = `${product.name} | 이루다`;

  const setText = (selector, text) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = text;
    });
  };

  setText("[data-pdp-crumb]", product.name);
  setText("[data-pdp-badge]", product.badge);
  setText("[data-pdp-badge2]", product.badge);
  setText("[data-pdp-category]", product.category);
  setText("[data-pdp-name]", product.name);
  setText("[data-pdp-name2]", product.name);
  setText("[data-pdp-target]", product.target);
  setText("[data-pdp-desc]", product.desc);
  setText("[data-pdp-price]", formatPrice(product.price));
  setText("[data-pdp-as]", product.as);
  setText("[data-pdp-as2]", `A/S 기준: ${product.as}`);

  if (product.badgeWarm) {
    document.querySelectorAll("[data-pdp-badge], [data-pdp-badge2]").forEach((el) => {
      el.classList.add("badge--warm");
    });
  }

  const image = document.querySelector("[data-pdp-image]");
  if (image) {
    image.src = product.image;
    image.alt = "";
  }

  const points = document.querySelector("[data-pdp-points]");
  points?.replaceChildren(
    ...product.bullets.map((bullet) => {
      const li = document.createElement("li");
      li.textContent = bullet;
      return li;
    }),
  );

  const fields = document.querySelector("[data-pdp-fields]");
  fields?.replaceChildren(
    ...product.fields.map((field) => {
      const li = document.createElement("li");
      li.textContent = field;
      return li;
    }),
  );

  const scriptBox = document.querySelector("[data-pdp-script]");
  scriptBox?.replaceChildren(
    ...product.script.split("\n").map((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      return p;
    }),
  );

  const related = document.querySelector("[data-pdp-related]");
  if (related) {
    const cards = Object.entries(PRODUCTS)
      .filter(([id]) => id !== productId)
      .map(([id, item]) => {
        const card = document.createElement("article");
        card.className = "product-card";

        const badge = document.createElement("span");
        badge.className = item.badgeWarm ? "badge badge--warm" : "badge";
        badge.textContent = item.badge;

        const title = document.createElement("h3");
        title.textContent = item.name;

        const list = document.createElement("ul");
        list.append(
          ...item.bullets.map((bullet) => {
            const li = document.createElement("li");
            li.textContent = bullet;
            return li;
          }),
        );

        const visual = document.createElement("img");
        visual.className = "product-visual";
        visual.src = item.image;
        visual.alt = "";
        visual.loading = "lazy";

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = formatPrice(item.price);

        const link = document.createElement("a");
        link.className = "button button--primary button--small product-buy";
        link.href = `product.html?id=${id}`;
        link.textContent = "구매하기";

        card.append(badge, title, list, visual, price, link);
        return card;
      });
    related.replaceChildren(...cards);
  }
}

let seedPayBootstrapInjected = false;

// seedpay.js 는 부트스트랩 스크립트라서, 로드 완료 후에도 코어 SDK를 비동기로
// 한 번 더 받아와야 window.SeedPay 가 생긴다. 주입 후 폴링으로 준비될 때까지 대기.
const loadSeedPaySdk = () =>
  new Promise((resolve, reject) => {
    const ready = () => window.SeedPay && typeof window.SeedPay.requestPayment === "function";

    if (ready()) {
      resolve();
      return;
    }

    if (!seedPayBootstrapInjected) {
      seedPayBootstrapInjected = true;
      const script = document.createElement("script");
      script.src = "https://js.seedpayments.co.kr/v1/seedpay.js";
      script.onerror = () => {
        seedPayBootstrapInjected = false;
      };
      document.head.appendChild(script);
    }

    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (ready()) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - startedAt > 10000) {
        clearInterval(timer);
        reject(new Error("결제 모듈 로딩에 실패했습니다. 새로고침 후 다시 시도해주세요."));
      }
    }, 100);
  });

const paymentForm = document.querySelector("[data-payment-form]");
const paymentError = document.querySelector("[data-payment-error]");
const paymentSubmit = document.querySelector("[data-payment-submit]");

paymentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!product) return;

  paymentError?.setAttribute("hidden", "");
  if (paymentSubmit) {
    paymentSubmit.disabled = true;
    paymentSubmit.textContent = "처리 중...";
  }

  const formData = new FormData(paymentForm);

  try {
    const requestRes = await fetch("/api/payment/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        customerName: formData.get("customerName"),
        customerEmail: formData.get("customerEmail"),
        customerMobilePhone: formData.get("customerMobilePhone"),
      }),
    });

    const contentType = requestRes.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("결제 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }

    const payload = await requestRes.json();
    if (!requestRes.ok) {
      throw new Error(payload.message || payload.error || "결제 요청에 실패했습니다.");
    }

    await loadSeedPaySdk();

    if (!window.SeedPay || typeof window.SeedPay.requestPayment !== "function") {
      throw new Error("SeedPay SDK를 불러오지 못했습니다.");
    }

    window.SeedPay.requestPayment(payload);
  } catch (error) {
    if (paymentError) {
      paymentError.textContent = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      paymentError.removeAttribute("hidden");
    }
  } finally {
    if (paymentSubmit) {
      paymentSubmit.disabled = false;
      paymentSubmit.textContent = "결제 진행";
    }
  }
});

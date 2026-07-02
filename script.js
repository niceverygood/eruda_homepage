document.documentElement.classList.add("js");

const topBar = document.querySelector("[data-top-bar]");
const closeTop = document.querySelector("[data-close-top]");
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

closeTop?.addEventListener("click", () => {
  topBar?.classList.add("is-hidden");
});

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu?.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  navToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

navMenu?.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement && navMenu.classList.contains("is-open")) {
    navMenu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "메뉴 열기");
  }
});

const formatNumber = (value) => new Intl.NumberFormat("ko-KR").format(value);

const animateCount = (element) => {
  const end = Number(element.dataset.count);
  if (!Number.isFinite(end) || element.dataset.done === "true") return;

  element.dataset.done = "true";
  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatNumber(Math.round(end * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      entry.target.querySelectorAll(".countup").forEach(animateCount);
    });
  },
  { rootMargin: "0px 0px 160px 0px", threshold: 0 },
);

document.querySelectorAll(".section-observe").forEach((section) => observer.observe(section));

document.querySelectorAll("[data-carousel-prev], [data-carousel-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const trackId = button.dataset.carouselPrev || button.dataset.carouselNext;
    const track = document.getElementById(trackId);
    if (!track) return;

    const direction = button.dataset.carouselPrev ? -1 : 1;
    const firstCard = track.querySelector(":scope > *");
    const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : 300;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || "18");

    track.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  });
});

document.querySelectorAll(".chip[data-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter || "all";
    document.querySelectorAll(".chip[data-filter]").forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");

    document.querySelectorAll(".product-card[data-category]").forEach((card) => {
      const categories = card.getAttribute("data-category") || "";
      const shouldShow = filter === "all" || categories.split(" ").includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const paymentModal = document.querySelector("[data-payment-modal]");
const paymentModalProduct = document.querySelector("[data-payment-modal-product]");
const paymentForm = document.querySelector("[data-payment-form]");
const paymentError = document.querySelector("[data-payment-error]");
const paymentSubmit = document.querySelector("[data-payment-submit]");

const productInfo = {
  "analysis-general": {
    badge: "일반",
    name: "보장 분석 리모델링 (일반)",
    price: "90,000원",
    desc: "본인 보장 내역이 궁금해 직접 분석을 신청한 20~50대 고객 DB입니다. 가입 내역 점검 니즈가 확인된 상태라 첫 통화에서 상담 흐름을 잡기 쉽습니다.",
    fields: ["이름", "연락처", "나이/성별", "거주 지역", "신청 경로", "관심 항목", "상담 가능 시간"],
    script:
      "안녕하세요 고객님, 보장 분석 신청해 주셔서 연락드린 ○○○ 설계사입니다.\n남겨주신 내용 보니까 현재 가입하신 보험 보장이 잘 되어 있는지 궁금하셔서 신청 주셨더라고요.\n지금 갖고 계신 증권 기준으로 과한 부분은 줄이고 부족한 보장은 채우는 방향으로 정리해서 안내드릴게요. 통화 5분 정도 괜찮으실까요?",
    as: "부재, 오기입, 중복, 가망 없음 등 검수 기준 충족 시 재배정 지원",
  },
  "analysis-silver": {
    badge: "실버",
    name: "보장 분석 리모델링 (실버)",
    price: "80,000원",
    desc: "부모님 또는 본인의 노후 보장을 점검하고 싶어 신청한 고령자 타겟 DB입니다. 건강 상태별 리모델링 포인트가 함께 제공돼 상담 준비가 수월합니다.",
    fields: ["이름", "연락처", "나이/성별", "거주 지역", "신청 경로", "건강 관심사", "상담 가능 시간"],
    script:
      "안녕하세요 고객님, 보장 점검 신청 주셔서 연락드린 ○○○ 설계사입니다.\n요즘 나이 들수록 병원비 걱정이 크시잖아요. 신청서에 남겨주신 내용 기준으로, 지금 갖고 계신 보험에서 실제로 보장받을 수 있는 항목이 어디까지인지 알기 쉽게 정리해 드리려고 해요.\n어렵게 설명 안 드리고 꼭 필요한 것만 짚어드릴게요. 잠깐 통화 괜찮으세요?",
    as: "부재, 오기입, 중복, 가망 없음 등 검수 기준 충족 시 재배정 지원 (전담 CS 포함)",
  },
  "replan-silver": {
    badge: "실버",
    name: "보험료 플랜 재설계 (실버)",
    price: "70,000원",
    desc: "매달 나가는 보험료가 부담돼 조정을 원하는 실버 고객 DB입니다. 보험료 절감이라는 명확한 니즈가 있어 상담 목적이 뚜렷하고, 월별 재구매 플랜 구성에 유리합니다.",
    fields: ["이름", "연락처", "나이/성별", "거주 지역", "월 보험료 수준", "신청 경로", "상담 가능 시간"],
    script:
      "안녕하세요 고객님, 보험료 조정 상담 신청해 주셔서 연락드린 ○○○ 설계사입니다.\n매달 내시는 보험료가 부담되신다고 남겨주셨는데요, 보장은 최대한 유지하면서 보험료만 줄이는 방법이 있는지 지금 내역 기준으로 확인해 드릴게요.\n증권만 있으시면 5분 안에 비교해서 알려드릴 수 있습니다. 지금 통화 괜찮으실까요?",
    as: "부재, 오기입, 중복, 가망 없음 등 검수 기준 충족 시 재배정 지원",
  },
  "replan-general": {
    badge: "일반",
    name: "보험료 플랜 재설계 (일반)",
    price: "80,000원",
    desc: "보험료 재설계를 원하는 일반 고객 DB로, 대량 캠페인 운영과 팀 단위 배분에 최적화된 구성입니다. 유입 채널별 품질 체크를 거쳐 공급됩니다.",
    fields: ["이름", "연락처", "나이/성별", "거주 지역", "유입 채널", "관심 항목", "상담 가능 시간"],
    script:
      "안녕하세요 고객님, 보험료 재설계 신청 주셔서 연락드린 ○○○ 설계사입니다.\n지금 내고 계신 보험료가 적정한지 궁금하셔서 신청 주신 걸로 확인했는데요, 같은 보장 기준으로 보험료를 비교해 보면 조정 여지가 있는 경우가 많습니다.\n부담 없이 현재 상태 점검부터 도와드릴게요. 잠시 통화 가능하실까요?",
    as: "부재, 오기입, 중복, 가망 없음 등 검수 기준 충족 시 재배정 지원",
  },
};

const infoStep = document.querySelector('[data-payment-step="info"]');
const formStep = document.querySelector('[data-payment-step="form"]');
const infoBadge = document.querySelector("[data-info-badge]");
const infoTitle = document.querySelector("[data-info-title]");
const infoPrice = document.querySelector("[data-info-price]");
const infoDesc = document.querySelector("[data-info-desc]");
const infoFields = document.querySelector("[data-info-fields]");
const infoScript = document.querySelector("[data-info-script]");
const infoAs = document.querySelector("[data-info-as]");

const showPaymentStep = (step) => {
  infoStep?.toggleAttribute("hidden", step !== "info");
  formStep?.toggleAttribute("hidden", step !== "form");
  paymentModal?.querySelector(".payment-modal__panel")?.scrollTo({ top: 0 });
};

const fillProductInfo = (productId, fallbackName) => {
  const info = productInfo[productId];
  if (infoBadge) infoBadge.textContent = info?.badge ?? "DB";
  if (infoTitle) infoTitle.textContent = info?.name ?? fallbackName;
  if (infoPrice) infoPrice.textContent = info?.price ?? "";
  if (infoDesc) infoDesc.textContent = info?.desc ?? "";
  if (infoAs) infoAs.textContent = info?.as ?? "";

  if (infoFields) {
    infoFields.replaceChildren(
      ...(info?.fields ?? []).map((field) => {
        const li = document.createElement("li");
        li.textContent = field;
        return li;
      }),
    );
  }

  if (infoScript) {
    infoScript.replaceChildren(
      ...(info?.script ?? "").split("\n").map((line) => {
        const p = document.createElement("p");
        p.textContent = line;
        return p;
      }),
    );
  }
};

let selectedProductId = null;
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

const openPaymentModal = (productId, productName) => {
  selectedProductId = productId;
  if (paymentModalProduct) paymentModalProduct.textContent = productName;
  paymentError?.setAttribute("hidden", "");
  paymentForm?.reset();
  fillProductInfo(productId, productName);
  showPaymentStep("info");
  paymentModal?.removeAttribute("hidden");
};

const closePaymentModal = () => {
  selectedProductId = null;
  paymentModal?.setAttribute("hidden", "");
};

document.querySelectorAll(".product-buy").forEach((button) => {
  button.addEventListener("click", () => {
    openPaymentModal(button.dataset.productId, button.dataset.productName || "");
  });
});

document.querySelectorAll("[data-payment-modal-close]").forEach((el) => {
  el.addEventListener("click", closePaymentModal);
});

document.querySelector("[data-payment-next]")?.addEventListener("click", () => {
  showPaymentStep("form");
});

document.querySelector("[data-payment-back]")?.addEventListener("click", () => {
  showPaymentStep("info");
});

paymentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedProductId) return;

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
        productId: selectedProductId,
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

const successModal = document.querySelector("[data-success-modal]");
const successOrder = document.querySelector("[data-success-order]");
const successList = document.querySelector("[data-success-list]");

document.querySelectorAll("[data-success-close]").forEach((el) => {
  el.addEventListener("click", () => successModal?.setAttribute("hidden", ""));
});

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
};

const renderSummaryCard = (item) => {
  const card = document.createElement("article");
  card.className = "summary-card";

  const meta = document.createElement("div");
  meta.className = "summary-card__meta";

  const needs = document.createElement("span");
  needs.className = "summary-card__needs";
  needs.textContent = item.needs_category || "분류중";
  meta.appendChild(needs);

  const who = document.createElement("span");
  who.className = "summary-card__who";
  const duration = formatDuration(item.call_duration);
  who.textContent = [item.customer_masked_name, duration && `통화 ${duration}`].filter(Boolean).join(" · ");
  meta.appendChild(who);

  if (item.qa_result === "pass") {
    const qa = document.createElement("span");
    qa.className = "summary-card__qa";
    qa.textContent = "검수 합격";
    meta.appendChild(qa);
  }

  const text = document.createElement("p");
  text.textContent = item.summary;

  card.append(meta, text);
  return card;
};

const showSummaryEmpty = (message) => {
  if (!successList) return;
  const p = document.createElement("p");
  p.className = "summary-empty";
  p.textContent = message;
  successList.replaceChildren(p);
};

const openSuccessModal = async (orderId) => {
  successModal?.removeAttribute("hidden");
  if (!orderId) {
    showSummaryEmpty("주문 정보를 확인할 수 없습니다.");
    return;
  }

  try {
    const res = await fetch(`/api/orders/summaries?orderId=${encodeURIComponent(orderId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    if (successOrder) {
      successOrder.textContent = `${payload.order.productName} · 주문번호 ${payload.order.orderNumber}`;
    }

    if (!payload.items.length) {
      showSummaryEmpty("통화 요약이 준비되는 대로 이 화면에서 확인하실 수 있습니다.");
      return;
    }
    successList?.replaceChildren(...payload.items.map(renderSummaryCard));
  } catch (error) {
    showSummaryEmpty("통화 요약을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
  }
};

const urlParams = new URLSearchParams(window.location.search);
const paymentStatus = urlParams.get("payment");
if (paymentStatus === "success") {
  openSuccessModal(urlParams.get("orderId"));
} else if (paymentStatus === "fail") {
  window.alert("결제에 실패했습니다. 다시 시도해주세요.");
}

const faqList = document.querySelector("[data-faq-list]");

faqList?.addEventListener("toggle", (event) => {
  const current = event.target;
  if (!(current instanceof HTMLDetailsElement) || !current.open) return;

  faqList.querySelectorAll("details").forEach((details) => {
    if (details !== current) details.open = false;
  });
}, true);

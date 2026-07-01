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

let selectedProductId = null;
let seedPaySdkLoaded = false;

const loadSeedPaySdk = () =>
  new Promise((resolve, reject) => {
    if (seedPaySdkLoaded && window.SeedPay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.seedpayments.co.kr/v1/seedpay.js";
    script.onload = () => {
      seedPaySdkLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("SEEDPAY_SDK_LOAD_FAILED"));
    document.head.appendChild(script);
  });

const openPaymentModal = (productId, productName) => {
  selectedProductId = productId;
  if (paymentModalProduct) paymentModalProduct.textContent = productName;
  paymentError?.setAttribute("hidden", "");
  paymentForm?.reset();
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

const paymentStatus = new URLSearchParams(window.location.search).get("payment");
if (paymentStatus === "success") {
  window.alert("결제가 완료되었습니다.");
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

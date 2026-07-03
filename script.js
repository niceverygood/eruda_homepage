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

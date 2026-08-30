const STORAGE_KEY = "expenses.data.v1";
const THEME_KEY = "expenses.theme.v1";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];

const CATEGORY_COLORS = {
  Food: "var(--cat-food)",
  Transport: "var(--cat-transport)",
  Shopping: "var(--cat-shopping)",
  Bills: "var(--cat-bills)",
  Entertainment: "var(--cat-entertainment)",
  Health: "var(--cat-health)",
  Other: "var(--cat-other)",
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let expenses = [];
let filters = { search: "", category: "", month: "" };

const els = {
  themeToggle: document.getElementById("themeToggle"),
  themeToggleLabel: document.querySelector(".theme-toggle-label"),
  greeting: document.getElementById("greeting"),
  overviewMeta: document.getElementById("overviewMeta"),
  totalSpent: document.getElementById("totalSpent"),
  monthSpent: document.getElementById("monthSpent"),
  expenseCount: document.getElementById("expenseCount"),
  topCategory: document.getElementById("topCategory"),
  form: document.getElementById("expenseForm"),
  amount: document.getElementById("amount"),
  description: document.getElementById("description"),
  category: document.getElementById("category"),
  date: document.getElementById("date"),
  formError: document.getElementById("formError"),
  search: document.getElementById("search"),
  filterCategory: document.getElementById("filterCategory"),
  filterMonth: document.getElementById("filterMonth"),
  clearFilters: document.getElementById("clearFilters"),
  expenseBody: document.getElementById("expenseBody"),
  emptyState: document.getElementById("emptyState"),
  emptyAddBtn: document.getElementById("emptyAddBtn"),
};

/* ---------- Storage ---------- */

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    expenses = raw ? JSON.parse(raw) : [];
  } catch {
    expenses = [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

/* ---------- Theme ---------- */

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", theme);
  els.themeToggle.setAttribute("aria-pressed", String(isDark));
  if (els.themeToggleLabel) {
    els.themeToggleLabel.textContent = isDark ? "Light" : "Dark";
  }
}

function initTheme() {
  const stored = getStoredTheme();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  applyTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

/* ---------- Helpers ---------- */

function formatAmount(value) {
  return "₹" + Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function monthKey(iso) {
  return iso.slice(0, 7);
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getTopCategory() {
  if (expenses.length === 0) return null;
  const totals = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  }
  let top = null;
  let maxAmount = 0;
  for (const [cat, amount] of Object.entries(totals)) {
    if (amount > maxAmount) {
      maxAmount = amount;
      top = cat;
    }
  }
  return top;
}

/* ---------- CRUD ---------- */

function addExpense(data) {
  const expense = {
    id: crypto.randomUUID(),
    description: data.description.trim(),
    amount: Number(data.amount),
    category: data.category,
    date: data.date,
  };
  expenses.push(expense);
  saveExpenses();
  renderAll();
}

function deleteExpense(id) {
  expenses = expenses.filter((e) => e.id !== id);
  saveExpenses();
  renderAll();
}

/* ---------- Filtering ---------- */

function filterExpenses() {
  const search = filters.search.trim().toLowerCase();
  return expenses
    .filter((e) => {
      if (search && !e.description.toLowerCase().includes(search)) return false;
      if (filters.category && e.category !== filters.category) return false;
      if (filters.month && monthKey(e.date) !== filters.month) return false;
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/* ---------- Totals ---------- */

function calculateTotals() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = currentMonthKey();
  const monthTotal = expenses
    .filter((e) => monthKey(e.date) === thisMonth)
    .reduce((sum, e) => sum + e.amount, 0);
  return { total, monthTotal, count: expenses.length };
}

/* ---------- Rendering ---------- */

function renderSummary() {
  const { total, monthTotal, count } = calculateTotals();
  els.totalSpent.textContent = formatAmount(total);
  els.monthSpent.textContent = formatAmount(monthTotal);
  els.expenseCount.textContent = String(count);
  els.overviewMeta.textContent = `${count} ${count === 1 ? "expense" : "expenses"} · ${monthLabel(currentMonthKey())}`;
  els.topCategory.textContent = getTopCategory() || "—";
}

function renderMonthOptions() {
  const keys = [...new Set(expenses.map((e) => monthKey(e.date)))].sort().reverse();
  const current = els.filterMonth.value;
  els.filterMonth.innerHTML =
    '<option value="">All months</option>' +
    keys.map((k) => `<option value="${k}">${monthLabel(k)}</option>`).join("");
  if (keys.includes(current)) els.filterMonth.value = current;
}

function makeCategoryTag(category) {
  const tag = document.createElement("span");
  tag.className = "category-tag";
  const dot = document.createElement("span");
  dot.className = "category-dot";
  dot.style.backgroundColor = CATEGORY_COLORS[category] || "var(--cat-other)";
  tag.appendChild(dot);
  tag.appendChild(document.createTextNode(category));
  return tag;
}

function renderExpenses() {
  const list = filterExpenses();
  els.expenseBody.innerHTML = "";

  if (list.length === 0) {
    els.emptyState.hidden = false;
    const hasAny = expenses.length > 0;
    const title = els.emptyState.querySelector(".empty-title");
    const hint = els.emptyState.querySelector(".empty-hint");
    if (hasAny) {
      title.textContent = "No matching expenses";
      hint.textContent = "Try adjusting your filters.";
      els.emptyAddBtn.hidden = true;
    } else {
      title.textContent = "No expenses yet";
      hint.textContent = "Your spending history will appear here.";
      els.emptyAddBtn.hidden = false;
    }
    return;
  }

  els.emptyState.hidden = true;

  const frag = document.createDocumentFragment();
  for (const e of list) {
    const tr = document.createElement("tr");

    const cat = document.createElement("td");
    cat.className = "col-cat cell-cat";
    cat.appendChild(makeCategoryTag(e.category));

    const desc = document.createElement("td");
    desc.className = "cell-desc";
    desc.textContent = e.description;

    const date = document.createElement("td");
    date.className = "col-date cell-date";
    date.textContent = formatDate(e.date);

    const amount = document.createElement("td");
    amount.className = "col-amount cell-amount";
    const amountSpan = document.createElement("span");
    amountSpan.className = "amount-cell";
    amountSpan.textContent = formatAmount(e.amount);
    amount.appendChild(amountSpan);

    const action = document.createElement("td");
    action.className = "col-action cell-action";
    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.setAttribute("aria-label", `Delete expense: ${e.description}`);
    del.addEventListener("click", () => deleteExpense(e.id));
    action.appendChild(del);

    const meta = document.createElement("td");
    meta.className = "cell-meta";
    meta.appendChild(makeCategoryTag(e.category));
    const sep = document.createElement("span");
    sep.textContent = "·";
    sep.className = "meta-sep";
    meta.appendChild(sep);
    meta.appendChild(document.createTextNode(formatDate(e.date)));

    tr.append(cat, desc, date, amount, action, meta);
    frag.appendChild(tr);
  }
  els.expenseBody.appendChild(frag);
}

function renderAll() {
  renderMonthOptions();
  renderSummary();
  renderExpenses();
}

/* ---------- Validation ---------- */

function showFormError(message) {
  els.formError.textContent = message;
  els.formError.hidden = false;
}

function clearFormError() {
  els.formError.hidden = true;
  els.formError.textContent = "";
}

function markInvalid(field, invalid) {
  field.classList.toggle("invalid", invalid);
}

function validateExpense(data) {
  let valid = true;
  const errors = [];

  if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
    markInvalid(els.amount.closest(".field"), true);
    errors.push("Enter an amount greater than 0.");
    valid = false;
  } else {
    markInvalid(els.amount.closest(".field"), false);
  }

  if (!data.description || !data.description.trim()) {
    markInvalid(els.description.closest(".field"), true);
    errors.push("Description is required.");
    valid = false;
  } else {
    markInvalid(els.description.closest(".field"), false);
  }

  if (!data.category) {
    markInvalid(els.category.closest(".field"), true);
    errors.push("Choose a category.");
    valid = false;
  } else {
    markInvalid(els.category.closest(".field"), false);
  }

  if (!data.date) {
    markInvalid(els.date.closest(".field"), true);
    errors.push("Pick a date.");
    valid = false;
  } else {
    markInvalid(els.date.closest(".field"), false);
  }

  if (!valid) showFormError(errors.join(" "));
  return valid;
}

/* ---------- Events ---------- */

function handleSubmit(e) {
  e.preventDefault();
  const data = {
    amount: els.amount.value,
    description: els.description.value,
    category: els.category.value,
    date: els.date.value,
  };

  if (!validateExpense(data)) return;

  clearFormError();
  addExpense(data);
  els.form.reset();
  els.date.value = new Date().toISOString().slice(0, 10);
  els.description.focus();
}

function handleFilterChange() {
  filters.search = els.search.value;
  filters.category = els.filterCategory.value;
  filters.month = els.filterMonth.value;
  renderExpenses();
}

function clearAllFilters() {
  els.search.value = "";
  els.filterCategory.value = "";
  els.filterMonth.value = "";
  filters = { search: "", category: "", month: "" };
  renderExpenses();
}

function focusForm() {
  els.description.focus();
  els.description.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ---------- Init ---------- */

function init() {
  initTheme();
  loadExpenses();

  els.greeting.textContent = getGreeting();
  els.date.value = new Date().toISOString().slice(0, 10);

  els.form.addEventListener("submit", handleSubmit);
  els.search.addEventListener("input", handleFilterChange);
  els.filterCategory.addEventListener("change", handleFilterChange);
  els.filterMonth.addEventListener("change", handleFilterChange);
  els.clearFilters.addEventListener("click", clearAllFilters);
  els.themeToggle.addEventListener("click", toggleTheme);
  els.emptyAddBtn.addEventListener("click", focusForm);

  renderAll();
}

init();

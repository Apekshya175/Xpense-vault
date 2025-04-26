document.addEventListener("DOMContentLoaded", () => {
  fetch("Savinggoal.php?action=get_saving_total")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        const total = parseFloat(data.total_saving).toFixed(2);
        const savingElem = document.getElementById("total-saving");
        if (savingElem) savingElem.textContent = `Rs.${total}`;
      }
    })
    .catch(console.error);
});

let transactions = [];
let filteredTransactions = [];
let chart;

document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.style.display =
        mobileMenu.style.display === "block" ? "none" : "block";
    });
  }

  const sidebarToggleBtn = document.getElementById("mobile-menu-btn");
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  const sidebar = document.getElementById("sidebar");
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
    });
  }
  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
    });
  }

  const applyFilterBtn = document.getElementById("apply-filter-btn");
  const clearFilterBtn = document.getElementById("clear-filter-btn");
  if (applyFilterBtn)
    applyFilterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      applyFilter();
    });
  if (clearFilterBtn)
    clearFilterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearFilter();
    });

  const transactionList = document.getElementById("transactions-table-body");
  if (transactionList) {
    transactionList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const transactionId = e.target.dataset.id;
        fetch("api.php", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: transactionId }),
        })
          .then((res) => res.json())
          .then((data) => {
            alert(data.message || data.error);
            fetchTransactions();
          })
          .catch((err) => console.error(err));
      }
    });
  }

  fetchTransactions();
});

function getTotalIncome() {
  return transactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
}

function getTotalExpense() {
  return transactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
}

function updateSummary() {
  const income = getTotalIncome();
  const expense = getTotalExpense();
  const incomeElem = document.getElementById("total-income");
  const expenseElem = document.getElementById("total-expense");
  const savingElem = document.getElementById("total-saving");
  const budgetElem = document.getElementById("total-budget");
  const budgetTable = document.getElementById("total-budget-table");

  if (incomeElem) incomeElem.textContent = `Rs.${income}`;
  if (expenseElem) expenseElem.textContent = `Rs.${expense}`;

  fetch("Savinggoal.php?action=get_saving_total")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) return;
      const saved = parseFloat(data.total_saving).toFixed(2);
      if (savingElem) savingElem.textContent = `Rs.${saved}`;
      const budget = income - expense - parseFloat(saved);
      if (budgetElem) budgetElem.textContent = `Rs.${budget}`;
      if (budgetTable) budgetTable.textContent = `Rs.${budget}`;
    })
    .catch(console.error);
}

function generateChart() {
  const ctx = document.getElementById("pieChart");
  if (!ctx) return;

  const inc = getTotalIncome();
  const exp = getTotalExpense();

  fetch("Savinggoal.php?action=get_saving_total")
    .then((res) => res.json())
    .then((data) => {
      const saved = data.success ? parseFloat(data.total_saving) : 0;

      const categories = ["Income", "Saved", "Expense"];
      const amounts = [inc, saved, exp];

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: "pie",
        data: { labels: categories, datasets: [{ data: amounts }] },
      });
    })
    .catch(console.error);
}

function renderTransactions() {
  const list = document.getElementById("transactions-table-body");
  if (!list) return;
  list.innerHTML = filteredTransactions
    .map(
      (tx) => `
    <tr>
      <td class="py-2 px-4 border">${tx.type}</td>
      <td class="py-2 px-4 border">${tx.expenseType}</td>
      <td class="py-2 px-4 border">${tx.amount}</td>
      <td class="py-2 px-4 border">${tx.date}</td>
      <td class="py-2 px-4 border"><button class="delete-btn text-red-500" data-id="${tx.id}">Delete</button></td>
    </tr>`
    )
    .join("");
}

function fetchTransactions() {
  fetch("api.php")
    .then((res) => res.json())
    .then((data) => {
      transactions = data;
      filteredTransactions = [...data];
      renderTransactions();
      updateSummary();
      generateChart();
    })
    .catch(console.error);
}

function applyFilter() {
  const date = document.getElementById("filterDate").value;
  filteredTransactions = date
    ? transactions.filter((tx) => tx.date === date)
    : [...transactions];
  renderTransactions();
  updateSummary();
  generateChart();
}

function clearFilter() {
  document.getElementById("filterDate").value = "";
  filteredTransactions = [...transactions];
  renderTransactions();
  updateSummary();
  generateChart();
}

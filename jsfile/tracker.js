// transactions.js - Specific to transactions.html

let transactions = [];
let filteredTransactions = [];
let chart;

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      if (
        mobileMenu.style.display === "none" ||
        mobileMenu.style.display === ""
      ) {
        mobileMenu.style.display = "block";
      } else {
        mobileMenu.style.display = "none";
      }
    });
  }

  // Sidebar Toggle (using dedicated buttons)
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

  // Filter Functionality
  const applyFilterBtn = document.getElementById("apply-filter-btn");
  const clearFilterBtn = document.getElementById("clear-filter-btn");
  if (applyFilterBtn) {
    applyFilterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      applyFilter();
    });
  }
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearFilter();
    });
  }

  // Delete Transaction via event delegation
  const transactionList = document.getElementById("transaction-list");
  if (transactionList) {
    transactionList.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("delete-btn")) {
        const transactionId = e.target.getAttribute("data-id");
        // API call to delete transaction
        fetch("api.php", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: transactionId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              alert(data.message);
              fetchTransactions();
            } else {
              alert(data.error || "Error deleting transaction");
            }
          })
          .catch((err) => console.error("Error deleting transaction:", err));
      }
    });
  }

  // --- Data and UI Functions ---

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

  function getTotalSaving() {
    return transactions
      .filter((tx) => tx.type === "Saving")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  }

  function updateSummary() {
    const totalIncome = getTotalIncome();
    const totalExpense = getTotalExpense();
    const totalSaving = getTotalSaving();
    const incomeElem = document.getElementById("total-income");
    const expenseElem = document.getElementById("total-expense");
    const savingElem = document.getElementById("total-saving");
    const totalBudgetElem = document.getElementById("total-budget");
    const totalBudgetElemtable = document.getElementById("total-budget-table");

    if (incomeElem) incomeElem.textContent = `$${totalIncome}`;
    if (expenseElem) expenseElem.textContent = `$${totalExpense}`;
    if (savingElem) savingElem.textContent = `$${totalSaving}`;

    const totalbudget = totalIncome - totalExpense - totalSaving;
    if (totalBudgetElem) {
      totalBudgetElem.textContent = `$${totalbudget}`;
    }
    if (totalBudgetElemtable) {
      totalBudgetElemtable.textContent = `$${totalbudget}`;
    }
  }

  function generateChart() {
    const pieChartCanvas = document.getElementById("pieChart");
    if (!pieChartCanvas) return;
    const categories = ["Income", "Saving", "Expense"];
    let amounts = [0, 0, 0];
    filteredTransactions.forEach((tx) => {
      if (tx.type === "Income") amounts[0] += parseFloat(tx.amount);
      else if (tx.type === "Saving") amounts[1] += parseFloat(tx.amount);
      else if (tx.type === "Expense") amounts[2] += parseFloat(tx.amount);
    });
    if (chart) chart.destroy();
    chart = new Chart(pieChartCanvas, {
      type: "pie",
      data: {
        labels: categories,
        datasets: [
          {
            data: amounts,
            backgroundColor: ["#4CAF50", "#2196F3", "#F44336"],
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: "#fff",
            font: { weight: "bold" },
            formatter: (value) => `$${value}`,
          },
        },
      },
    });
  }

  function renderTransactions() {
    if (!transactionList) return;
    transactionList.innerHTML = "";
    filteredTransactions.forEach((tx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="py-2 px-4 border">${tx.type}</td>
        <td class="py-2 px-4 border">${tx.expenseType}</td>
        <td class="py-2 px-4 border">${tx.amount}</td>
        <td class="py-2 px-4 border">${tx.date}</td>
        <td class="py-2 px-4 border">
          <button class="delete-btn text-red-500" data-id="${tx.id}">Delete</button>
        </td>
      `;
      transactionList.appendChild(row);
    });
  }

  function fetchTransactions() {
    fetch("api.php")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched transactions:", data);
        transactions = data;
        filteredTransactions = [...transactions];
        renderTransactions();
        updateSummary();
        generateChart();
      })
      .catch((err) => console.error("Error fetching transactions:", err));
  }

  function applyFilter() {
    const filterDateInput = document.getElementById("filterDate");
    const filterDate = filterDateInput.value;
    if (filterDate) {
      filteredTransactions = transactions.filter(
        (tx) => tx.date === filterDate
      );
    } else {
      filteredTransactions = [...transactions];
    }
    renderTransactions();
    updateSummary();
    generateChart();
  }

  function clearFilter() {
    const filterDateInput = document.getElementById("filterDate");
    filterDateInput.value = "";
    filteredTransactions = [...transactions];
    renderTransactions();
    updateSummary();
    generateChart();
  }

  // Initial load of transactions
  fetchTransactions();
});

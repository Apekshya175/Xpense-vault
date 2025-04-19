// transactions.js - Specific to transactions.html

let transactions = [];
let filteredTransactions = [];
let expensePieChart;

document.addEventListener("DOMContentLoaded", () => {
  // ---------------- Mobile Menu Toggle ----------------
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

  // ---------------- Sidebar Toggle ----------------
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

  // ---------------- Filter Functionality ----------------
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

  // ---------------- Delete Transaction via Event Delegation ----------------
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

  // ---------------- Data and UI Functions ----------------

  // Calculate Totals
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

  // Update Summary and Charts
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

    // Total Budget remains as income - expense - saving
    const totalBudget = totalIncome - totalExpense - totalSaving;
    if (totalBudgetElem) totalBudgetElem.textContent = `$${totalBudget}`;
    if (totalBudgetElemtable)
      totalBudgetElemtable.textContent = `$${totalBudget}`;

    // Update the monthly saved amount (Income - Expense)
    const monthlySavingAmountElem = document.getElementById(
      "monthly-saving-amount"
    );
    if (monthlySavingAmountElem) {
      const monthlySaving = totalIncome - totalExpense;
      monthlySavingAmountElem.textContent = `$${monthlySaving}`;
    }

    // Update the expense breakdown pie chart
    generateExpensePieChart();
  }

  // Generate Expense Breakdown Pie Chart
  function generateExpensePieChart() {
    const pieChartCanvas = document.getElementById("pieChart");
    if (!pieChartCanvas) return;

    const categories = ["Income", "Saving", "Expense"];
    let amounts = [0, 0, 0];

    filteredTransactions.forEach((tx) => {
      if (tx.type === "Income") amounts[0] += parseFloat(tx.amount);
      else if (tx.type === "Saving") amounts[1] += parseFloat(tx.amount);
      else if (tx.type === "Expense") amounts[2] += parseFloat(tx.amount);
    });

    if (expensePieChart) expensePieChart.destroy();

    expensePieChart = new Chart(pieChartCanvas, {
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

  // Render Transactions in the Table
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

  // Fetch Transactions from API
  function fetchTransactions() {
    fetch("api.php")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched transactions:", data);
        transactions = data;
        // Initially, show all transactions
        filteredTransactions = [...transactions];
        renderTransactions();
        updateSummary();
      })
      .catch((err) => console.error("Error fetching transactions:", err));
  }

  // Apply Month Filter (filter by month and year)
  function applyFilter() {
    const filterDateInput = document.getElementById("filterDate");
    const filterDate = filterDateInput.value;
    if (filterDate) {
      const selectedDate = new Date(filterDate);
      filteredTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate.getMonth() === selectedDate.getMonth() &&
          txDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    } else {
      filteredTransactions = [...transactions];
    }
    renderTransactions();
    updateSummary();
  }

  // Clear Filter
  function clearFilter() {
    const filterDateInput = document.getElementById("filterDate");
    filterDateInput.value = "";
    filteredTransactions = [...transactions];
    renderTransactions();
    updateSummary();
  }

  // ---------------- Initial Data Load ----------------
  fetchTransactions();
});

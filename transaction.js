let transactions = [];

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

  // Toggle Expense Type Field based on Category selection
  const typeSelect = document.getElementById("type");
  const expenseTypeDiv = document.getElementById("expense-type-div");
  if (typeSelect && expenseTypeDiv) {
    typeSelect.addEventListener("change", () => {
      if (typeSelect.value === "Expense" || typeSelect.value === "Use Saving" || typeSelect.value === "Saving") {
        expenseTypeDiv.style.display = "flex";
      } else {
        expenseTypeDiv.style.display = "none";
      }
    });
  }

  // Add Transaction Event Listener
  const addTransactionBtn = document.getElementById("add-transaction-btn");
  if (addTransactionBtn) {
    addTransactionBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const type = document.getElementById("type").value;
      const amount = document.getElementById("amount").value;
      const expenseType = document.getElementById("expense-type").value;
      const date = document.getElementById("date").value;
      if (!amount || !date) {
        alert("Please provide a valid amount and date.");
        return;
      }
      // API call to add a transaction
      fetch("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, expenseType, date }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.message) {
            alert(data.message);
            fetchTransactions();
          } else {
            alert(data.error || "Error adding");
          }
        })
        .catch((err) => console.error("Error adding transaction:", err));
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
    const totalBudgetElem = document.getElementById("total-budget");
    const totalBudgetElemtable = document.getElementById("total-budget-table");

    const totalbudget = totalIncome - totalExpense - totalSaving;
    if (totalBudgetElem) {
      totalBudgetElem.textContent = `$${totalbudget}`;
    }
    if (totalBudgetElemtable) {
      totalBudgetElemtable.textContent = `$${totalbudget}`;
    }
  }

  function renderTransactions() {
    if (!transactionList) return;
    transactionList.innerHTML = "";
    transactions.forEach((tx) => {
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
        renderTransactions();
        updateSummary();
      })
      .catch((err) => console.error("Error fetching transactions:", err));
  }

  // Initial load of transactions
  fetchTransactions();
});
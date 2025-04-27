document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", () => {
          mobileMenu.style.display = mobileMenu.style.display === "none" ? "block" : "none";
      });
  }

  // Sidebar toggle
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

  // Chart instances
  let pieChart;
  let transactions = [];
  let filteredTransactions = [];

  // DOM elements
  let applyFilterBtn, clearFilterBtn, startDateInput, endDateInput, typeFilterSelect, transactionList;

  // Initialize the page
  function init() {
      // Initialize DOM elements
      applyFilterBtn = document.getElementById("apply-filter-btn");
      clearFilterBtn = document.getElementById("clear-filter-btn");
      startDateInput = document.getElementById("startDate");
      endDateInput = document.getElementById("endDate");
      typeFilterSelect = document.getElementById("typeFilter");
      transactionList = document.getElementById("transactions-table-body");

      // Check if all required elements exist
      if (!startDateInput || !endDateInput || !typeFilterSelect || !applyFilterBtn || !clearFilterBtn) {
          console.error("Required filter elements not found");
          return;
      }

      // Set default date range to last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      startDateInput.valueAsDate = startDate;
      endDateInput.valueAsDate = endDate;

      // Setup event listeners after initializing date values
      setupEventListeners();
      fetchTransactions();
  }

  // Set up event listeners
  function setupEventListeners() {
      // Only set up filter button listeners if the buttons exist
      if (applyFilterBtn && clearFilterBtn) {
          applyFilterBtn.addEventListener("click", applyFilters);
          clearFilterBtn.addEventListener("click", clearFilters);
      }
      
      // Delete transaction handler
      if (transactionList) {
          transactionList.addEventListener("click", (e) => {
              if (e.target && e.target.classList.contains("delete-btn")) {
                  const transactionId = e.target.getAttribute("data-id");
                  deleteTransaction(transactionId);
              }
          });
      }
  }

  // Delete transaction function
  function deleteTransaction(id) {
      fetch("api.php", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id }),
      })
      .then(response => response.json())
      .then(data => {
          if (data.message) {
              alert(data.message);
              fetchTransactions();
          } else {
              alert(data.error || "Error deleting transaction");
          }
      })
      .catch(error => console.error("Error deleting transaction:", error));
  }

  // Fetch transactions from API
  function fetchTransactions() {
      fetch("api.php")
          .then(response => {
              if (!response.ok) {
                  throw new Error("Network response was not ok");
              }
              return response.json();
          })
          .then(data => {
              if (data.error) {
                  console.error("API Error:", data.error);
                  if (data.error === "unauthorized") {
                      window.location.href = "l.html";
                  }
                  return;
              }
              transactions = data;
              filteredTransactions = [...transactions];
              updateSummary();
              renderTransactions();
              renderPieChart();
          })
          .catch(error => {
              console.error("Error fetching transactions:", error);
          });
  }

  // Apply filters
  function applyFilters() {
      if (!startDateInput || !endDateInput || !typeFilterSelect) {
          console.error("Required filter elements not found");
          return;
      }

      const startDate = startDateInput.value;
      const endDate = endDateInput.value;
      const typeFilter = typeFilterSelect.value;

      filteredTransactions = transactions.filter(transaction => {
          // Date filter
          if (startDate && transaction.date < startDate) return false;
          if (endDate && transaction.date > endDate) return false;
          
          // Type filter
          if (typeFilter !== "all" && transaction.type !== typeFilter) return false;
          
          return true;
      });

      updateSummary();
      renderTransactions();
      renderPieChart();
  }

  // Clear filters
  function clearFilters() {
      startDateInput.value = "";
      endDateInput.value = "";
      typeFilterSelect.value = "all";
      filteredTransactions = [...transactions];
      updateSummary();
      renderTransactions();
      renderPieChart();
  }

  // Update summary cards
  function updateSummary() {
      const totalIncome = filteredTransactions
          .filter(tx => tx.type === "Income")
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
          
      const totalExpense = filteredTransactions
          .filter(tx => tx.type === "Expense")
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
          
      const totalSaving = filteredTransactions
          .filter(tx => tx.type === "Saving")
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
          
      const totalBudget = totalIncome - totalExpense - totalSaving;

      document.getElementById("total-income").textContent = `$${totalIncome.toFixed(2)}`;
      document.getElementById("total-expense").textContent = `$${totalExpense.toFixed(2)}`;
      document.getElementById("total-saving").textContent = `$${totalSaving.toFixed(2)}`;
      document.getElementById("total-budget").textContent = `$${totalBudget.toFixed(2)}`;
      document.getElementById("total-budget-display").textContent = `$${totalBudget.toFixed(2)}`;
  }

  // Render transactions table
  function renderTransactions() {
      if (!transactionList) return;
      
      transactionList.innerHTML = "";
      
      filteredTransactions.forEach(tx => {
          const row = document.createElement("tr");
          row.className = "hover:bg-gray-50";
          row.innerHTML = `
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tx.type || 'N/A'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tx.expenseType || 'N/A'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm ${tx.type === 'Income' ? 'text-green-600' : 'text-red-600'}">$${parseFloat(tx.amount).toFixed(2)}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${tx.date}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button class="delete-btn text-red-600 hover:text-red-900" data-id="${tx.id}">Delete</button>
              </td>
          `;
          transactionList.appendChild(row);
      });
  }

  // Render pie chart
  function renderPieChart() {
      const ctx = document.getElementById("pieChart").getContext("2d");
      
      // Group by expense type (for expenses only)
      const categoryData = {};
      filteredTransactions.forEach(tx => {
          if (tx.type === "Expense") {
              const category = tx.expenseType || "Uncategorized";
              categoryData[category] = (categoryData[category] || 0) + parseFloat(tx.amount);
          }
      });

      const labels = Object.keys(categoryData);
      const data = Object.values(categoryData);

      if (pieChart) pieChart.destroy();

      if (labels.length > 0) {
          pieChart = new Chart(ctx, {
              type: "pie",
              data: {
                  labels: labels,
                  datasets: [{
                      data: data,
                      backgroundColor: [
                          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
                          "#9966FF", "#FF9F40", "#8AC249", "#EA5545",
                          "#FEB147", "#B2D3C2", "#0F7173", "#EEC584"
                      ],
                      borderWidth: 1
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      legend: {
                          position: "right",
                      },
                      tooltip: {
                          callbacks: {
                              label: function(context) {
                                  const value = context.raw;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = Math.round((value / total) * 100);
                                  return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                              }
                          }
                      }
                  }
              }
          });
      } else {
          // Display message when no expense data available
          ctx.font = "16px Arial";
          ctx.fillStyle = "#666";
          ctx.textAlign = "center";
          ctx.fillText("No expense data to display", ctx.canvas.width / 2, ctx.canvas.height / 2);
      }
  }

  // Initialize the page
  init();
});
document.addEventListener("DOMContentLoaded", function () {
    loadTransactions();
});

function toggleExpenseType() {
    const type = document.getElementById("type").value;
    const expenseTypeLabel = document.getElementById("expense-type-label");
    const expenseTypeInput = document.getElementById("expense-type");
    
    if (type === "Expense") {
        expenseTypeLabel.style.display = "block";
        expenseTypeInput.style.display = "block";
    } else {
        expenseTypeLabel.style.display = "none";
        expenseTypeInput.style.display = "none";
        expenseTypeInput.value = ""; 
    }
}

async function addTransaction() {
    const type = document.getElementById("type").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const expenseType = type === "Expense" ? document.getElementById("expense-type").value : "-";

    if (!type || isNaN(amount) || !date || (type === "Expense" && !expenseType.trim())) {
        alert("Please fill all fields correctly");
        return;
    }

    try {
        const response = await fetch("api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, expenseType, amount, date })
        });

        const result = await response.json();
        alert(result.message || "Transaction added!");
        loadTransactions();
    } catch (error) {
        console.error("Error adding transaction:", error);
    }
}

async function deleteTransaction(id) {
    try {
        const response = await fetch("api.php", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        const result = await response.json();
        alert(result.message || "Transaction deleted!");
        loadTransactions();
    } catch (error) {
        console.error("Error deleting transaction:", error);
    }
}

async function loadTransactions() {
    try {
        const response = await fetch("api.php");
        const transactions = await response.json();
        const transactionList = document.getElementById("transaction-list");
        transactionList.innerHTML = "";

        let total = 0;
        transactions.forEach(t => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${t.type}</td>
                <td>${t.expenseType}</td>
                <td>${t.amount}</td>
                <td>${t.date}</td>
                <td><button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button></td>
            `;
            transactionList.appendChild(row);
            total += t.type === "Income" ? parseFloat(t.amount) : -parseFloat(t.amount);
        });

        document.getElementById("total-amount").textContent = total.toFixed(2);
    } catch (error) {
        console.error("Error loading transactions:", error);
    }
}

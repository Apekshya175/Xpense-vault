document.addEventListener("DOMContentLoaded", () => {
  loadGoals();
  updateTotalSavings();
  document.getElementById("add-goal-btn").addEventListener("click", addGoal);
  document.getElementById("goal-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-goal-btn"))
      deleteGoal(e.target.dataset.id);
  });
});

function addGoal(e) {
  e.preventDefault();
  const name = document.getElementById("goal-name").value.trim();
  const amount = document.getElementById("target-amount").value;
  const deadline = document.getElementById("deadline").value;
  if (!name || !amount || !deadline) return alert("Please fill in all fields.");
  fetch("Savinggoal.php?action=add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal_name: name, target_amount: amount, deadline }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("goal-name").value = "";
        document.getElementById("target-amount").value = "";
        document.getElementById("deadline").value = "";
        loadGoals();
        updateTotalSavings();
      } else alert(data.message);
    })
    .catch(console.error);
}

function deleteGoal(id) {
  if (!confirm("Sure to delete this goal?")) return;
  fetch("Savinggoal.php?action=delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        loadGoals();
        updateTotalSavings();
      } else alert(data.message);
    })
    .catch(console.error);
}

function loadGoals() {
  fetch("Savinggoal.php?action=get")
    .then((res) => res.json())
    .then((data) => {
      // congratulate on newly completed goals
      const alerted = JSON.parse(localStorage.getItem("alertedGoals") || "[]");
      data.goals.forEach((g) => {
        if (g.saved > 0 && !alerted.includes(g.id)) {
          alert(
            `Congratulations! You have successfully met your saving target for "${g.goal_name}".`
          );
          alerted.push(g.id);
          localStorage.setItem("alertedGoals", JSON.stringify(alerted));
        }
      });
      const tbody = document.getElementById("goal-list");
      tbody.innerHTML =
        data.success && data.goals.length
          ? data.goals
              .map(
                (g) => `
        <tr class="group hover:bg-blue-50/50 transition">
          <td class="py-2 px-4 border">${g.goal_name}</td>
          <td class="py-2 px-4 border">Rs.${parseFloat(g.target_amount).toFixed(
            2
          )}</td>
          <td class="py-2 px-4 border">Rs.${parseFloat(g.saved).toFixed(2)}</td>
          <td class="py-2 px-4 border">${g.deadline}</td>
          <td class="py-2 px-4 border"><button type="button" class="delete-goal-btn text-red-500" data-id="${
            g.id
          }">Delete</button></td>
        </tr>`
              )
              .join("")
          : '<tr><td colspan="5" class="p-4">No goals found.</td></tr>';
    })
    .catch(console.error);
}

function updateTotalSavings() {
  fetch("Savinggoal.php?action=get_saving_total")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) return;
      const total = parseFloat(data.total_saving).toFixed(2);
      document.getElementById("total-saving").textContent = `Rs.${total}`;
      document.getElementById(
        "total-savings-table"
      ).textContent = `Rs.${total}`;
    })
    .catch(console.error);
}

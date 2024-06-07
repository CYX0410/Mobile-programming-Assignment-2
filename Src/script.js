$(document).ready(function() {
    var registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    var currentUser = localStorage.getItem('currentUser');

    $("#showRegisterFormLink").click(function(event) {
        event.preventDefault();
        $("#loginForm").hide();
        $("#registerForm").show();
    });

    $("#showLoginFormLink").click(function(event) {
        event.preventDefault();
        $("#registerForm").hide();
        $("#loginForm").show();
    });

    $("#loginForm").submit(function(event) {
        event.preventDefault();
        var userId = $("#loginUserId").val();
        var password = $("#loginPassword").val();
        var user = registeredUsers.find(user => user.userId === userId && user.password === password);
        if (user) {
            localStorage.setItem('currentUser', userId);
            window.location.href = 'expenses.html';
            alert("Successfully Login");
        } else {
            alert("Incorrect User ID or Password. Please try again.");
        }
    });

    $("#registerForm").submit(function(event) {
        event.preventDefault();
        var userId = $("#registerUserId").val();
        var password = $("#registerPassword").val();
        var userExists = registeredUsers.some(user => user.userId === userId);
        if (userExists) {
            alert("User ID already exists. Please choose a different User ID.");
        } else {
            registeredUsers.push({ userId: userId, password: password });
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            alert("Registration successful!");
            $("#registerForm").hide();
            $("#loginForm").show();
        }
    });

    $("#logoutButton").click(function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Handle expense form submission
    $("#expenseForm").submit(function(event) {
        event.preventDefault();
        var amount = $("#amount").val();
        var date = $("#date").val();
        var description = $("#description").val();
        var expenses = JSON.parse(localStorage.getItem(currentUser + '_expenses')) || [];
        expenses.push({ amount: amount, date: date, description: description });
        localStorage.setItem(currentUser + '_expenses', JSON.stringify(expenses));
        alert("Expense added!");
        loadExpenses();
    });

    function loadExpenses() {
        var expenses = JSON.parse(localStorage.getItem(currentUser + '_expenses')) || [];
        var expenseList = $("#expenseList");
        expenseList.empty();
        expenses.forEach(function(expense, index) {
            var expenseItem = `<li class="list-group-item">
                ${expense.date} - ${expense.description} - $${expense.amount}
                <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
                <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
            </li>`;
            expenseList.append(expenseItem);
        });
        updateSummary(expenses);
    }

    function updateSummary(expenses) {
        var monthlyExpenses = {};
        expenses.forEach(function(expense) {
            var month = expense.date.substring(0, 7); // Extract YYYY-MM format
            if (!monthlyExpenses[month]) {
                monthlyExpenses[month] = [];
            }
            monthlyExpenses[month].push(expense);
        });

        var sortedMonths = Object.keys(monthlyExpenses).sort();

        var expenseSummaryTable = $("#expenseSummaryTable");
        expenseSummaryTable.empty();
        var totalAllExpenses = 0; 
        sortedMonths.forEach(function(month) {
            var totalExpenses = 0;
            var monthExpenses = monthlyExpenses[month];
            monthExpenses.forEach(function(expense) {
                totalExpenses += parseFloat(expense.amount);
            });
            totalAllExpenses += totalExpenses;
            var summaryRow = `<tr>
                <th colspan="3">${month} Total Expenses: $${totalExpenses.toFixed(2)}</th>
            </tr>`;
            expenseSummaryTable.append(summaryRow);
            monthExpenses.forEach(function(expense) {
                var expenseRow = `<tr>
                    <td>${expense.date}</td>
                    <td>${expense.description}</td>
                    <td>$${expense.amount}</td>
                </tr>`;
                expenseSummaryTable.append(expenseRow);
            });
        });

        var totalExpensesRow = `<tr>
            <th colspan="3">Total Expenses (All Months): $${totalAllExpenses.toFixed(2)}</th>
        </tr>`;
        expenseSummaryTable.append(totalExpensesRow);
    }

    $("#expenseList").on("click", ".delete-btn", function() {
        var index = $(this).data("index");
        var expenses = JSON.parse(localStorage.getItem(currentUser + '_expenses')) || [];
        expenses.splice(index, 1);
        localStorage.setItem(currentUser + '_expenses', JSON.stringify(expenses));
        loadExpenses();
    });

    $("#expenseList").on("click", ".edit-btn", function() {
        var index = $(this).data("index");
        var expenses = JSON.parse(localStorage.getItem(currentUser + '_expenses')) || [];
        var expense = expenses[index];
        $("#editAmount").val(expense.amount);
        $("#editDate").val(expense.date);
        $("#editDescription").val(expense.description);
        $("#editExpenseForm").data("index", index);
        $("#editExpenseModal").modal("show");
    });

    $("#editExpenseForm").submit(function(event) {
        event.preventDefault();
        var index = $(this).data("index");
        var expenses = JSON.parse(localStorage.getItem(currentUser + '_expenses')) || [];
        expenses[index] = {
            amount: $("#editAmount").val(),
            date: $("#editDate").val(),
            description: $("#editDescription").val()
        };
        localStorage.setItem(currentUser + '_expenses', JSON.stringify(expenses));
        $("#editExpenseModal").modal("hide");
        alert("Expense updated!");
        loadExpenses();
    });

    if (currentUser) {
        loadExpenses();
    } else if (window.location.pathname.includes('expenses.html')) {
        window.location.href = 'index.html';
    }

    $("#generateChartBtn").click(function() {
        var selectedMonth = $('#monthSelect').val();
        var expenses = JSON.parse(localStorage.getItem(currentUser + '_expenses')) || [];
        var monthlyTotals = {};
        var labels = [];
        var data = [];

        if (selectedMonth === 'all') {
            var months = ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", 
                          "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"];
            months.forEach(month => {
                monthlyTotals[month] = 0;
            });

            expenses.forEach(function(expense) {
                var month = moment(expense.date).format('YYYY-MM');
                if (!monthlyTotals[month]) {
                    monthlyTotals[month] = 0;
                }
                monthlyTotals[month] += parseFloat(expense.amount);
            });

            labels = Object.keys(monthlyTotals).sort();
            data = labels.map(month => monthlyTotals[month]);
        } else {
            monthlyTotals[selectedMonth] = 0;

            expenses.forEach(function(expense) {
                var month = moment(expense.date).format('YYYY-MM');
                if (month === selectedMonth) {
                    monthlyTotals[month] += parseFloat(expense.amount);
                }
            });

            labels = [selectedMonth];
            data = [monthlyTotals[selectedMonth]];
        }

        console.log('Selected Month:', selectedMonth);
        console.log('Labels:', labels);
        console.log('Data:', data);
        console.log('Monthly Totals:', monthlyTotals);

        var ctx = document.getElementById('monthlyExpenseChart').getContext('2d');
        
        if(window.myChart instanceof Chart) {
            window.myChart.destroy();
        }
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Expenses',
                    data: data,
                    backgroundColor: 'rgba(255, 165, 0, 0.6)',
                    borderColor: 'rgba(255, 99, 71, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: '#000',
                        },
                        title: {
                            display: true,
                            text: 'Amount ($)',
                            font: {
                                size: 18,
                                weight: 'bold'
                            },
                            color: '#000'
                        },
                        suggestedMin: 0,
                        suggestedMax: data.length ? Math.max(...data) + 10 : 10
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: '#000',
                        },
                        title: {
                            display: true,
                            text: 'Month',
                            font: {
                                size: 18,
                                weight: 'bold'
                            },
                            color :'#000'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            font: {
                                size: 16, // Increase font size for legend
                                weight: 'bold' // Make text bold
                            },
                            color: '#000' // Change text color
                        }
                    },
                    title: {
                        display: true,
                        text: selectedMonth === 'all' ? 'Monthly Expenses' : `Expenses for ${moment(selectedMonth).format('MMMM YYYY')}`,
                        font: {
                            size: 20,
                            weight: 'bold'
                        },
                        color: '#000'
                    }
                }
            }
        });
        window.myChart = myChart;
    });
});

    if (currentUser) {
        loadExpenses();
        } else if (window.location.pathname.includes('expenses.html')) {
             window.location.href = 'index.html';
                }
                      

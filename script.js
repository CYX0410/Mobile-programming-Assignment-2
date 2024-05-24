// script.js

$(document).ready(function(){
    // Retrieve registered users from localStorage or initialize an empty array
    var registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    var currentUser = localStorage.getItem('currentUser');

    // Event handler for showing the register form when the button is click and also hide the register form
    $("#showRegisterFormLink").click(function(event){
        event.preventDefault();
        $("#loginForm").hide();
        $("#registerForm").show();
    });

    // Event handler for showing the login form when the button is click and also hid the login form
    $("#showLoginFormLink").click(function(event){
    /*This sets up a click event handler for the element with the ID showRegisterFormLink. When this 
    element is clicked, the function inside the event handler will be executed.javascript*/
        event.preventDefault();
        /*This prevents the default behavior of the event, which is typically to navigate to a new 
        page when clicking a link. In this case, it prevents the default link behavior.*/
        $("#registerForm").hide();
        $("#loginForm").show();
    });

    // Event handler for submitting the login form
    //Will only proceed to next event if successfully login
    //This need to be mainly focuses
    $("#loginForm").submit(function(event){
        event.preventDefault();
        var userId = $("#loginUserId").val(); //Get the id value that have input in the field
        var password = $("#loginPassword").val(); //Get the password value that have input in the field
        var user = registeredUsers.find(user => user.userId === userId && user.password === password);
        //The above line searches for a user in the registeredUsers array whose user ID and password match the entered values.javascript
        if(user) {
            localStorage.setItem('currentUser', userId);
            window.location.href = 'expenses.html';
            alert("Successfully Login");
        } else {
            alert("Incorrect User ID or Password. Please try again.");
        }
    });

    // Event handler for submitting the register form
    $("#registerForm").submit(function(event){
        event.preventDefault();
        var userId = $("#registerUserId").val();//Get the value that have input by the user
        var password = $("#registerPassword").val();//Get the value that have input by the user
        var userExists = registeredUsers.some(user => user.userId === userId); //Check if the userID is registered in the system
        if(userExists) { //if some() return bolean value of true then produce warning
            alert("User ID already exists. Please choose a different User ID.");
        } else { //if not registered then push and set item to save at local storage using JSON.stringify()
            registeredUsers.push({ userId: userId, password: password });
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));//Convert to string in order to save in the localStorage
            alert("Registration successful!");//Produced alert when successsful
            $("#registerForm").hide();//Hide the registerform and return to login form
            $("#loginForm").show();
        }
    });
    // Handle logout
    $("#logoutButton").click(function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });




    //ANYTHING BELOW NEED TO BE ANALYZE
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
        // Group expenses by month
        var monthlyExpenses = {};
        expenses.forEach(function(expense) {
            var month = expense.date.substring(0, 7); // Extract YYYY-MM format
            if (!monthlyExpenses[month]) {
                monthlyExpenses[month] = [];
            }
            monthlyExpenses[month].push(expense);
        });
    
        // Sort months in ascending order
        var sortedMonths = Object.keys(monthlyExpenses).sort();
    
        // Populate summary table
        var expenseSummaryTable = $("#expenseSummaryTable");
        expenseSummaryTable.empty();
        var totalAllExpenses = 0; // Total expenses for all months
        sortedMonths.forEach(function(month) {
            var totalExpenses = 0;
            var monthExpenses = monthlyExpenses[month];
            monthExpenses.forEach(function(expense) {
                totalExpenses += parseFloat(expense.amount);
            });
            totalAllExpenses += totalExpenses; // Add to total expenses for all months
            var summaryRow = `<tr>
                <th colspan="3">${month} Total Expenses: $${totalExpenses.toFixed(2)}</th>
            </tr>`;
            expenseSummaryTable.append(summaryRow); // Append month summary row
            monthExpenses.forEach(function(expense) {
                var expenseRow = `<tr>
                    <td>${expense.date}</td>
                    <td>${expense.description}</td>
                    <td>$${expense.amount}</td>
                </tr>`;
                expenseSummaryTable.append(expenseRow); // Append expense row
            });
        });
    
        // Add total expenses for all months row
        var totalExpensesRow = `<tr>
            <th colspan="3">Total Expenses (All Months): $${totalAllExpenses.toFixed(2)}</th>
        </tr>`;
        expenseSummaryTable.append(totalExpensesRow);
    }
    

               
            // Handle delete expense
            $("#expenseList").on("click", ".delete-btn", function() {
                var index = $(this).data("index");
                var expenses = JSON.parse(localStorage.getItem(currentUser + '_expenses')) || [];
                expenses.splice(index, 1);
                localStorage.setItem(currentUser + '_expenses', JSON.stringify(expenses));
                loadExpenses(); // Reload expenses after deletion
            });
        
            // Handle edit expense
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
        
            // Save edited expense
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
        });
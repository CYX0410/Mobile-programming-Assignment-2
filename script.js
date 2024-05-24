// script.js

$(document).ready(function(){
    // Retrieve registered users from localStorage or initialize an empty array
    var registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    // Event handler for showing the register form
    $("#showRegisterFormLink").click(function(event){
        event.preventDefault();
        $("#loginForm").hide();
        $("#registerForm").show();
    });

    // Event handler for showing the login form
    $("#showLoginFormLink").click(function(event){
        event.preventDefault();
        $("#registerForm").hide();
        $("#loginForm").show();
    });

    // Event handler for submitting the login form
    $("#loginForm").submit(function(event){
        event.preventDefault();
        var userId = $("#loginUserId").val();
        var password = $("#loginPassword").val();
        var user = registeredUsers.find(user => user.userId === userId && user.password === password);
        if(user) {
            alert("Successfully Login");
        } else {
            alert("Incorrect User ID or Password. Please try again.");
        }
    });

    // Event handler for submitting the register form
    $("#registerForm").submit(function(event){
        event.preventDefault();
        var userId = $("#registerUserId").val();
        var password = $("#registerPassword").val();
        var userExists = registeredUsers.some(user => user.userId === userId);
        if(userExists) {
            alert("User ID already exists. Please choose a different User ID.");
        } else {
            registeredUsers.push({ userId: userId, password: password });
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            alert("Registration successful!");
            $("#registerForm").hide();
            $("#loginForm").show();
        }
    });
});
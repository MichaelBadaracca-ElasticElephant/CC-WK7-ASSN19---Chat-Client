$(document).ready(function () {

    //check to see if user is logged in
    $.get("/api/whois", function (username) {
        $("#login-message").text("Hello " + username + "!");
    })

    $.get("/api/getAllChats", function (chats) {
        for (chat of chats) {
            displayChat(chat);
        }
    })

    function displayChat(chat) {
        var chatHtml = `<div class="chat"><span class = "username">${chat.username}:</span>${chat.content}<div class="timestamp">${chat.timeStamp}</div></div>`
        $("#chat-thread").append(chatHtml);
    }

    $("#send-chat").click(function () {
        

        //get contents of chatbox
        var chatContent = $("#enter-chat").val();

        //send chat to server
        $.post("/api/sendChat/", { chat: chatContent }, function (chat) {
            displayChat(chat);
        })

        //clear chat box
        $("#enter-chat").val("");
    })
});
$(document).ready(function () {

    $("#send-chat").click(function () {
        

        //get contents of chatbox
        var chatContent = $("#enter-chat").val();

        //send chat to server
        $.post("/api/sendChat/", { chat: chatContent }, function (chatThread) {
            //update entire chat thread with response
            $("#chat-thread").text(chatThread);
        })

        //clear chat box
        $("#enter-chat").val("");
    })
});
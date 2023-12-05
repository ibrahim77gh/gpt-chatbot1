document.addEventListener("DOMContentLoaded", function () {
    const newChatView = document.querySelector(".new-chat-view");
    const conversationView = document.querySelector(".conversation-view");
    const messageForm = document.getElementById("message-form");
    const messageInput = document.getElementById("message");
    const sendButton = document.querySelector(".send-button");
    const newChatButton = document.querySelector(".new-chat");
    const conversationContainer = document.querySelector(".conversation-view");

    // Display the new-chat-view initially
    conversationView.style.display = "none";

    let currentThreadId;

    // Function to disable the send button
    function disableSendButton() {
        sendButton.disabled = true;
    }

    // Function to enable the send button
    function enableSendButton() {
        sendButton.disabled = false;
    }

    // Function to scroll the conversation view to the bottom
    function scrollConversationToBottom() {
        conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }

    // Function to show loading indicator
    function showLoadingIndicator() {
        const loadingDiv = document.getElementById("loading");
        loadingDiv.style.display = "block";
        conversationContainer.appendChild(loadingDiv); // Move loading div after the user message
        disableSendButton();
    }
    
    // Function to hide loading indicator
    function hideLoadingIndicator() {
        const loadingDiv = document.getElementById("loading");
        loadingDiv.style.display = "none";
        enableSendButton()
    }

    // Make a GET request to the "http://127.0.0.1:5000/start" endpoint to create a new thread when the page is loaded
    fetch("http://127.0.0.1:5000/start")
        .then(response => response.json())
        .then(data => {
            currentThreadId = data.thread_id;
        })
        .catch(error => {
            console.error("Error starting a new conversation:", error);
        });

    // Function to switch from new-chat-view to conversation-view
    function switchToConversationView() {
        newChatView.style.display = "none";
        conversationView.style.display = "block";
    }

    // Function to handle user messages
    function handleUserMessage() {
        const userMessage = messageInput.value.trim();
        if (userMessage !== "") {
            // Create and append the user message div
            appendUserMessage(userMessage);

            // Call function for AI reply
            handleAIReply(userMessage);

            // Clear the message input
            messageInput.value = "";

            switchToConversationView();
            scrollConversationToBottom();
        }
    }

    // Function to append a user message to the conversation view
    function appendUserMessage(message) {
        const userMessageDiv = createUserMessageDiv(message);
        conversationContainer.appendChild(userMessageDiv);
    }

    // Function to create a user message div
    function createUserMessageDiv(message) {
        const userMessageDiv = document.createElement("div");
        userMessageDiv.classList.add("user", "message");
        userMessageDiv.innerHTML = `
            <div class="identity">
                <i class="user-icon">u</i>
            </div>
            <div class="content">
                <p>${message}</p>
            </div>
        `;
        return userMessageDiv;
    }

    // Function to handle AI replies
    function handleAIReply(userQuery) {
        if (!currentThreadId) {
            console.error("Error: Thread ID is not available.");
            return;
        }

        showLoadingIndicator();

        // Make a POST request to the "http://127.0.0.1:5000/chat" endpoint with the thread_id and message
        fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                thread_id: currentThreadId,
                message: userQuery,
            }),
        })
            .then(response => response.json())
            .then(data => {
                const aiResponse = data.response;

                // Append the AI response to the conversation view
                appendAssistantMessage(aiResponse);
                hideLoadingIndicator();
                scrollConversationToBottom();
            })
            .catch(error => {
                console.error("Error fetching AI response:", error);
            });
    }

    // Function to append an assistant message to the conversation view
    function appendAssistantMessage(message) {
        const assistantMessageDiv = createAssistantMessageDiv(message);
        conversationContainer.appendChild(assistantMessageDiv);
    }

    // Function to create an assistant message div
    function createAssistantMessageDiv(message) {
        const assistantMessageDiv = document.createElement("div");
        assistantMessageDiv.classList.add("assistant", "message");
        assistantMessageDiv.innerHTML = `
            <div class="identity">
                <img src="lily-chat-icon.png" alt="Girl in a jacket" width="35" height="35">
            </div>
            <div class="content">
                <p>${message}</p>
            </div>
        `;
        return assistantMessageDiv;
    }

    // Event listener for the send button
    sendButton.addEventListener("click", handleUserMessage);

    newChatButton.addEventListener("click", function () {
        // Make a GET request to the "http://127.0.0.1:5000/start" endpoint to get the thread_id
        fetch("http://127.0.0.1:5000/start")
            .then(response => response.json())
            .then(data => {
                currentThreadId = data.thread_id;

                // Clear the conversation view
                conversationContainer.innerHTML = "";

                // Display the new-chat-view again
                newChatView.style.display = "block";
                conversationView.style.display = "none";
            })
            .catch(error => {
                console.error("Error starting a new conversation:", error);
            });
    });
});

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Store the conversation as an array of messages
let messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L’Oréal product advice. Only answer questions related to L’Oréal products, beauty routines, recommendations, or beauty-related topics. If a question is not related to these topics, politely reply: 'I'm here to help with L’Oréal products, routines, and beauty-related questions. Please ask me something in those areas!'",
  },
];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's input
  const userMessage = userInput.value;

  // Add user's message to the messages array
  messages.push({ role: "user", content: userMessage });

  // Show user's message in the chat window
  chatWindow.innerHTML += `<div class="user-msg"><strong>You:</strong> ${userMessage}</div>`;

  // Clear the input box
  userInput.value = "";

  // Show a loading message
  chatWindow.innerHTML += `<div class="bot-msg"><em>Assistant is typing...</em></div>`;

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Send the messages to your Cloudflare Worker
    const response = await fetch(
      "https://wanderbot-worker.sirdj811.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messages }),
      }
    );

    // Log the response status for debugging
    console.log("Response status:", response.status);

    // Check if the response has content before parsing as JSON
    const text = await response.text(
      "https://wanderbot-worker.sirdj811.workers.dev/"
    );
    console.log("Raw response text:", text);

    let data = {};
    if (text) {
      data = JSON.parse(text);
    } else {
      throw new Error("Empty response from server.");
    }

    // Log the data for debugging
    console.log("Response data:", data);

    // Get the assistant's reply from the response
    const assistantReply =
      data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : "Sorry, I couldn't get a response from OpenAI.";

    // Add assistant's reply to the messages array
    messages.push({ role: "assistant", content: assistantReply });

    // Remove the loading message and show the assistant's reply
    chatWindow.innerHTML = chatWindow.innerHTML.replace(
      `<div class="bot-msg"><em>Assistant is typing...</em></div>`,
      `<div class="bot-msg"><strong>Assistant:</strong> ${assistantReply}</div>`
    );

    // Scroll to the bottom again
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    // Log the error for debugging
    console.error("Fetch error:", error);

    // Show an error message if something goes wrong
    chatWindow.innerHTML += `<div class="bot-msg error">Error: ${error.message}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

let menu = document.querySelector("#menu-icon");
let navlist = document.querySelector(".navlist");

menu.onclick = () => {
  menu.classList.toggle("bx-x");
  navlist.classList.toggle("open");
};


// Event listener for dropdown menu options
const dropdownOptions = document.querySelectorAll(".dropdown-options a");
dropdownOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    const selectedTimeRange = e.target.getAttribute("data-time-range");
    summarizeFeedbacks(selectedTimeRange);
  });
});

const firebaseConfig = {
  apiKey: "AIzaSyD_3SeJ3rop44pWxTOtc4R2ITZrkTzUxSk",
  authDomain: "feedback-407a9.firebaseapp.com",
  databaseURL: "https://feedback-407a9-default-rtdb.firebaseio.com",
  projectId: "feedback-407a9",
  storageBucket: "feedback-407a9.appspot.com",
  messagingSenderId: "22405032694",
  appId: "1:22405032694:web:fa98b4511d771cf28edad7",
  measurementId: "G-3SCCLRVJBM"
};

firebase.initializeApp(firebaseConfig);

const postFeedbackBtn = document.getElementById("post-feedback-btn");
const feedbackTextarea = document.querySelector('textarea[name="feedback"]');
const originalFeedbacksContainer = document.getElementById("original-feedbacks"); // Select the feedback container
const database = firebase.database().ref("feedbacks"); // Reference to the "feedbacks" node in the database


postFeedbackBtn.addEventListener("click", function (e) {
  e.preventDefault();
  const feedbackContent = feedbackTextarea.value.trim();

  if (feedbackContent) {
    const timestamp = new Date().toLocaleString(); // Get the current device timestamp
    
    // Push the feedback and timestamp to the database under a unique key
    const newFeedbackRef = database.push();
    newFeedbackRef.set({
      content: feedbackContent,
      timestamp: timestamp,
    });

    // Clear the textarea after posting the feedback
    feedbackTextarea.value = "";
  }
});

// Initialize the feedbacksByTimeRange object
const feedbacksByTimeRange = {
  "last-1-hour": [],
  "last-24-hours": [],
  "last-week": [],
  "all": [],
};

// Event listener for dropdown menu options
dropdownOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    const selectedTimeRange = e.target.getAttribute("data-time-range");
    summarizeFeedbacks(selectedTimeRange);
  });
});

// // Define your API endpoint and API key
// const apiUrl = "https://api.openai.com/v1/chat/completions"; // Replace with your API endpoint
// const apiKey = "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"; // Replace with your API key


// Function to filter and display feedbacks based on the selected time range
async function summarizeFeedbacks(selectedTimeRange) {
  // Get the current timestamp
  const currentTime = new Date();
  
  // Filter feedbacks based on the selected time range
  const filteredFeedbacks = feedbacksByTimeRange[selectedTimeRange].filter((feedback) => {
    const feedbackTimestamp = new Date(feedback.timestamp);
    
    if (selectedTimeRange === "last-1-hour") {
      const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000); // Calculate 1 hour ago
      return feedbackTimestamp > oneHourAgo;
    } else if (selectedTimeRange === "last-24-hours") {
      const twentyFourHoursAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000); // Calculate 24 hours ago
      return feedbackTimestamp > twentyFourHoursAgo;
    } else if (selectedTimeRange === "last-week") {
      const oneWeekAgo = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000); // Calculate 1 week ago
      return feedbackTimestamp > oneWeekAgo;
    } else {
      return true; // Show all feedbacks for "All"
    }
  });
  
  // Update the "Summery of Feedbacks" textarea with the filtered feedbacks
  const summeryFeedbacksTextarea = document.getElementById("summery-feedbacks-textarea");
  summeryFeedbacksTextarea.value = filteredFeedbacks.map((feedback) => {
    return `${feedback.content} `;
  }).join(" ");
  // Call the summarizeFeedback function to get the summary
  const summary = summarizeFeedback(textToSummarize);

  // Update the textarea with the summary
  summeryFeedbacksTextarea.value = summary;
}


// Listen for changes in the "feedbacks" node of the database
database.on("child_added", function (snapshot) {
  const feedback = snapshot.val();

  // Add the feedback to the appropriate time range array
  feedbacksByTimeRange["all"].push(feedback);
  
  const feedbackTimestamp = new Date(feedback.timestamp);
  const currentTime = new Date();

  if (currentTime - feedbackTimestamp <= 60 * 60 * 1000) {
    feedbacksByTimeRange["last-1-hour"].push(feedback);
  }

  if (currentTime - feedbackTimestamp <= 24 * 60 * 60 * 1000) {
    feedbacksByTimeRange["last-24-hours"].push(feedback);
  }

  if (currentTime - feedbackTimestamp <= 7 * 24 * 60 * 60 * 1000) {
    feedbacksByTimeRange["last-week"].push(feedback);
  }

  // Create a new feedback element with a timestamp
  const feedbackElement = document.createElement("div");
  feedbackElement.classList.add("feedback");
  feedbackElement.innerHTML = `
    <p>${feedback.content}</p>
    <span class="timestamp">Posted at: ${feedback.timestamp}</span>
  `;

  // Append the new feedback element to the original feedbacks container
  originalFeedbacksContainer.appendChild(feedbackElement);
});



// Event listener for dropdown menu options
dropdownOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    const selectedTimeRange = e.target.getAttribute("data-time-range");
    summarizeFeedbacks(selectedTimeRange);
  });
});


const chatGPTEndpoint = "https://api.openai.com/v1/engines/davinci/completions";
const apiKey = "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"; // Replace with your API key

// Function to summarize text using the ChatGPT API
async function summarizeFeedback(textToSummarize) {
  try {
    console.log("Text to summarize:", textToSummarize); // Debugging statement

    const response = await fetch(chatGPTEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: "Summarize the following text:\n" + textToSummarize,
        max_tokens: 100, // You can adjust the max tokens for the desired summary length
      }),
    });

    const data = await response.json();

    console.log("API Response:", data); // Debugging statement

    if (data.choices && data.choices[0] && data.choices[0].text) {
      return data.choices[0].text;
    } else {
      return "Summary not available. Check API response for details:\n" + JSON.stringify(data, null, 2);
    }
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    return "Error summarizing feedback.";
  }
}


// Event listener for the 'Summarize' button
const summarizeButton = document.getElementById("summarize-feedback-btn");
summarizeButton.addEventListener("click", async () => {
  const textToSummarize = document.getElementById("summery-feedbacks-textarea").value.trim(); // Get text from the "summery-feedbacks-textarea"

  if (textToSummarize === "") {
    alert("Please provide feedback text before summarizing.");
    return;
  }

  // Call the summarizeFeedback function to get the summary
  const summary = await summarizeFeedback(textToSummarize);

  // Update the "Summary of Collective Original Feedback" textarea with the summary
  const summaryFeedbacksTextarea = document.getElementById("feedbacks-textarea");
  summaryFeedbacksTextarea.value = summary;
});

















let menu = document.querySelector('#menu-icon');
let navlist = document.querySelector('.navlist');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navlist.classList.toggle('open');
}

const firebaseConfig = {
    apiKey: "AIzaSyDsyiolTqg1JMOLoZsEMLJpy0kYjyiKAeM",
    authDomain: "realtime-feedback-574f2.firebaseapp.com",
    databaseURL: "https://realtime-feedback-574f2-default-rtdb.firebaseio.com",
    projectId: "realtime-feedback-574f2",
    storageBucket: "realtime-feedback-574f2.appspot.com",
    messagingSenderId: "1058260520730",
    appId: "1:1058260520730:web:39bef45870e49d0160e6a3",
    measurementId: "G-TJ2KYL53NN"
  };

  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

// Function to post feedback to Firebase
function postFeedback() {
  event.preventDefault(); // Prevent form submission

  const feedbackText = document.querySelector('textarea[name="feedback"]').value;
  if (feedbackText.trim() !== '') {
    const feedbackRef = database.ref('feedbacks');
    const newFeedbackRef = feedbackRef.push();
    newFeedbackRef.set({
      feedback: feedbackText
    });
  }
}

// Function to update original feedbacks in the UI
function updateOriginalFeedbacks(feedback) {
  const feedbackContainer = document.querySelector('.original-feedbacks');
  const feedbackElement = document.createElement('p');
  feedbackElement.textContent = feedback;
  feedbackContainer.appendChild(feedbackElement);
}

// Event listener for posting feedback
document.querySelector('form').addEventListener('submit', postFeedback);

// Firebase listener to get real-time updates of feedbacks
database.ref('feedbacks').on('child_added', (snapshot) => {
  const feedbackData = snapshot.val();
  const feedbackText = feedbackData.feedback;
  updateOriginalFeedbacks(feedbackText);
});

// Function to update original feedbacks in the UI
function updateOriginalFeedbacks(feedbackData) {
  const originalFeedbacksContainer = document.querySelector('.original-feedbacks-container');
  const feedbackElement = document.createElement('div');
  feedbackElement.classList.add('feedback');

  const feedbackTextElement = document.createElement('p');
  feedbackTextElement.textContent = feedbackData.feedback;

  const timestampElement = document.createElement('p');
  const formattedTimestamp = getFormattedTimestamp(feedbackData.timestamp);
  timestampElement.textContent = `Posted at: ${formattedTimestamp}`;
  timestampElement.classList.add('timestamp');

  feedbackElement.appendChild(feedbackTextElement);
  feedbackElement.appendChild(timestampElement);

  originalFeedbacksContainer.appendChild(feedbackElement);
}

// Firebase listener to get real-time updates of feedbacks
database.ref('feedbacks').on('child_added', (snapshot) => {
  const feedbackData = snapshot.val();
  updateOriginalFeedbacks(feedbackData);
});
  
  // Function to get formatted timestamp from device's local date and time
  function getFormattedTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

// Function to post feedback to Firebase
function postFeedback() {
    event.preventDefault(); // Prevent form submission
  
    const feedbackText = document.querySelector('textarea[name="feedback"]').value;
    if (feedbackText.trim() !== '') {
      const feedbackRef = database.ref('feedbacks');
      feedbackRef.push().set({
        feedback: feedbackText,
        timestamp: firebase.database.ServerValue.TIMESTAMP // Use Firebase server timestamp
      });
    }
  }

// Function to summarize and display feedbacks based on time range
function summarizeFeedbacks(timeRange) {
  const feedbacksRef = database.ref('feedbacks');
  const currentTime = new Date().getTime(); // Current timestamp in milliseconds

  // Calculate the start timestamp based on the selected time range
  let startTime;
  switch (timeRange) {
    case 'last-1-hour':
      startTime = currentTime - 3600000; // 1 hour in milliseconds
      break;
    case 'last-24-hours':
      startTime = currentTime - 86400000; // 24 hours in milliseconds
      break;
    case 'last-week':
      startTime = currentTime - 604800000; // 1 week in milliseconds
      break;
    default:
      startTime = 0;
  }

  // Query the feedbacks within the selected time range from Firebase
  const feedbacksQuery = feedbacksRef.orderByChild('timestamp');

  // Retrieve the feedbacks and update the "Summary of Feedbacks" section
  feedbacksQuery.once('value', (snapshot) => {
    const feedbacksData = snapshot.val();
    let summarizedFeedbacks = '';
    for (const key in feedbacksData) {
      const feedbackTimestamp = feedbacksData[key].timestamp;
      if (feedbackTimestamp >= startTime && feedbackTimestamp <= currentTime) {
        summarizedFeedbacks += feedbacksData[key].feedback + ' ';
      }
    }
    document.querySelector('.summery-feedbacks textarea').value = summarizedFeedbacks;
  });

}

// Event listener for dropdown menu options
const dropdownOptions = document.querySelectorAll('.dropdown-options a');
dropdownOptions.forEach((option) => {
  option.addEventListener('click', (e) => {
    const selectedTimeRange = e.target.getAttribute('data-time-range');
    summarizeFeedbacks(selectedTimeRange);
  });
});


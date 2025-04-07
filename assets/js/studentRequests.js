import { loadData, saveData } from './dataManager.js';

let globalData = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    globalData = await loadData();

    await displayPendingRequests();

    const majorFilter = document.getElementById("major-filter");
    majorFilter.addEventListener("change", () => {
      const selectedMajor = majorFilter.value;
      displayPendingRequests(selectedMajor);
    });
  } catch (error) {
    const requestsContainer = document.querySelector(".requests-container");
    if (requestsContainer) {
      requestsContainer.innerHTML = '<p class="error">Error loading requests. Please try again later.</p>';
    }
  }
});


async function displayPendingRequests(selectedMajor = '') {
  try {
    const { users, classes, courses, registrations } = globalData;

    let pendingRegistrations = registrations.filter(reg => reg.status === "Pending");

    if (selectedMajor) {
      pendingRegistrations = pendingRegistrations.filter(reg => {
        const student = users.find(user => user.student_id === reg.student_id && user.role === "Student");
        return student && student.major === selectedMajor;
      });
    }

    const requestsContainer = document.querySelector(".requests-container");

    if (!requestsContainer) {
      return;
    }

    requestsContainer.innerHTML = "";

    if (pendingRegistrations.length === 0) {
      requestsContainer.innerHTML = '<p class="no-requests">No pending registration requests at this time.</p>';
      return;
    }

    pendingRegistrations.forEach(reg => {
      const student = users.find(user => user.student_id === reg.student_id && user.role === "Student");
      const classInfo = classes.find(cls => cls.class_id === reg.class_id);
      const course = courses.find(crs => crs.course_id === classInfo?.course_id);

      if (student && classInfo && course) {
        const requestDiv = document.createElement("div");
        requestDiv.classList.add("request-item");

        const studentName = `${student.firstName} ${student.lastName}`;

        requestDiv.innerHTML = `
          <div class="request-details">
            <p><span class="material-symbols-rounded">person</span> <strong>Student:</strong> ${studentName}</p>
            <p><span class="material-symbols-rounded">class</span> <strong>Class:</strong> ID ${classInfo.class_id} (Section: ${classInfo.section})</p>
            <p><span class="material-symbols-rounded">book</span> <strong>Course:</strong> ${course.course_name} (${course.course_number})</p>
          </div>
          <div class="action-buttons">
            <button class="approve-btn" data-reg-id="${reg.registration_id}">Approve</button>
            <button class="reject-btn" data-reg-id="${reg.registration_id}">Reject</button>
          </div>
        `;

        requestDiv.querySelector(".approve-btn").addEventListener("click", () => handleApproval(reg.registration_id));
        requestDiv.querySelector(".reject-btn").addEventListener("click", () => handleRejection(reg.registration_id));

        requestsContainer.appendChild(requestDiv);
      }
    });
  } catch (error) {
    document.querySelector(".requests-container").innerHTML = '<p class="error">Error loading requests. Please try again later.</p>';
  }
}

async function handleApproval(registrationId) {
  try {
    const registration = globalData.registrations.find(reg => reg.registration_id === registrationId);
    const classInfo = globalData.classes.find(cls => cls.class_id === registration.class_id);

    if (!registration || !classInfo) {
      showMessage("Error", "Registration or associated class not found.");
      return;
    }

    if (classInfo.capacity <= classInfo.registered_students.length) {
      showMessage("Capacity Full", "This class has reached its maximum capacity.");
      return;
    }

    registration.status = "Approved";
    if (!classInfo.registered_students.includes(registration.student_id)) {
      classInfo.registered_students.push(registration.student_id);
    }

    saveData(globalData);
    const selectedMajor = document.getElementById("major-filter").value;
    await displayPendingRequests(selectedMajor);
    showMessage("Success", "Registration approved successfully!");
  } catch (error) {
    showMessage("Error", "Failed to approve registration. Please try again.");
  }
}

async function handleRejection(registrationId) {
  try {
    const registration = globalData.registrations.find(reg => reg.registration_id === registrationId);

    if (!registration) {
      showMessage("Error", "Registration not found.");
      return;
    }

    registration.status = "Rejected";
    saveData(globalData);
    const selectedMajor = document.getElementById("major-filter").value;
    await displayPendingRequests(selectedMajor);
    showMessage("Success", "Registration rejected successfully!");
  } catch (error) {
    showMessage("Error", "Failed to reject registration. Please try again.");
  }
}

function showMessage(title, message) {
  let popup = document.querySelector(".popup-container");
  if (!popup) {
    popup = document.createElement("div");
    popup.classList.add("popup-container");
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div class="popup-content">
      <h2>${title}</h2>
      <p>${message}</p>
      <button class="close-popup">OK</button>
    </div>
  `;
  popup.style.display = "flex";

  popup.querySelector(".close-popup").addEventListener("click", () => {
    popup.style.display = "none";
  });
}


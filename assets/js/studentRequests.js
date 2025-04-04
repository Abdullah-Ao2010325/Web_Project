import { loadData, saveData } from './dataManager.js';

async function displayPendingRequests() {
  try {
    const data = await loadData();
    const { users, classes, courses, registrations } = data;

    const pendingRegistrations = registrations.filter(reg => reg.status === "Pending");
    const requestsContainer = document.querySelector(".requests-container");
    requestsContainer.innerHTML = ""; 

    if (pendingRegistrations.length === 0) {
      requestsContainer.innerHTML = "<p>No pending registration requests.</p>";
      return;
    }

    pendingRegistrations.forEach(reg => {
      const student = users.find(user => user.username === reg.student_id);
      const classInfo = classes.find(cls => cls.class_id === reg.class_id);
      const course = courses.find(crs => crs.course_id === classInfo?.course_id);

      if (student && classInfo && course) {
        const requestDiv = document.createElement("div");
        requestDiv.classList.add("request-item");

        requestDiv.innerHTML = `
          <h5><span class="material-symbols-outlined">person</span>Student: ${student.name}</h5>
          <h5><span class="material-symbols-outlined">class</span>Class ID: ${classInfo.class_id} (Section: ${classInfo.section})</h5>
          <h5><span class="material-symbols-outlined">book</span>Course: ${course.course_name}</h5>
          <div class="action-buttons">
            <button class="approve-btn" data-student-id="${reg.student_id}" data-class-id="${reg.class_id}">Approve</button>
            <button class="reject-btn" data-student-id="${reg.student_id}" data-class-id="${reg.class_id}">Reject</button>
          </div>
        `;

        const approveBtn = requestDiv.querySelector(".approve-btn");
        const rejectBtn = requestDiv.querySelector(".reject-btn");

        approveBtn.addEventListener("click", () => {
          const studentId = approveBtn.getAttribute("data-student-id");
          const classId = parseInt(approveBtn.getAttribute("data-class-id"));
          approveRequest(studentId, classId);
        });

        rejectBtn.addEventListener("click", () => {
          const studentId = rejectBtn.getAttribute("data-student-id");
          const classId = parseInt(rejectBtn.getAttribute("data-class-id"));
          rejectRequest(studentId, classId);
        });

        requestsContainer.appendChild(requestDiv);
      }
    });
  } catch (error) {
    console.error("Error displaying pending requests:", error);
  }
}

async function approveRequest(studentId, classId) {
  try {
    const data = await loadData();
    const { registrations, classes } = data;

    const registration = registrations.find(reg => reg.student_id === studentId && reg.class_id === classId);
    const classInfo = classes.find(cls => cls.class_id === classId);

    if (registration && classInfo) {
      registration.status = "Approved";

      if (!classInfo.registered_students.includes(studentId)) {
        classInfo.registered_students.push(studentId);
        classInfo.capacity -= 1; 
      }

      saveData(data);
      console.log(`Registration for student ${studentId} in class ${classId} approved.`);

      await displayPendingRequests();
    }
  } catch (error) {
    console.error("Error approving request:", error);
  }
}

async function rejectRequest(studentId, classId) {
  try {
    const data = await loadData();
    const { registrations } = data;

    const registration = registrations.find(reg => reg.student_id === studentId && reg.class_id === classId);

    if (registration) {
      registration.status = "Rejected";

      saveData(data);
      console.log(`Registration for student ${studentId} in class ${classId} rejected.`);

      await displayPendingRequests();
    }
  } catch (error) {
    console.error("Error rejecting request:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  displayPendingRequests();
});
document.addEventListener("DOMContentLoaded", () => {


    loadClasses();
    displayCourses(JSON.parse(localStorage.courses));
    loadCourseOptions();
    displayPendingItems();

    document.querySelector("#add-pre-bt").addEventListener("click", addPrerequisiteInput);
    document.querySelector("#pending_selector").addEventListener("change", filterItemsByCategory);
    document.querySelector('.new-course').addEventListener('submit', handleClassSubmission);
    document.querySelector('.new-class-form').addEventListener('submit', handleCourseSubmission);
    document.querySelector('#class-status-filter').addEventListener('change', filterClasses);
    document.querySelector('#course-status-filter').addEventListener('change', filterCourses);

    document.querySelector('.course-container').addEventListener('click', (e) => {
        const classItem = e.target.closest('.course-item');
        if (classItem) {
            const details = classItem.querySelector('.course-details');
            const chevron = classItem.querySelector('.material-symbols-outlined');
            if (details && chevron) {
                details.classList.toggle('show');
                chevron.classList.toggle('expand');
            }
        }
    });

    document.querySelector('.class-container').addEventListener('click', (e) => {
        const courseItem = e.target.closest('.class-item');
        if (courseItem) {
            const details = courseItem.querySelector('.course-details');
            const chevron = courseItem.querySelector('.material-symbols-outlined');
            if (details && chevron) {
                details.classList.toggle('show');
                chevron.classList.toggle('expand');
            }
        }
    });
});

// Function to load classes from localStorage and display them
function loadClasses() {
    const classes = JSON.parse(localStorage.classes);
    checkClassCapacity();
    displayClasses(classes);
}

// Function to display classes based on the selected filter
function displayClasses(classes) {
    const courseContainer = document.querySelector(".course-container");
    courseContainer.innerHTML = "";
    const filter = document.querySelector('#class-status-filter').value;

    const statusMap = {
        "all": null,
        "in-progress": "validated",
        "open-for-registration": "open-for-registration",
        "closed": "closed"
    };

    const displayMap = {
        "open-for-registration": { display: "open-for-registration", color: "orange" },
        "validated": { display: "in-progress", color: "green" },
        "closed": { display: "closed", color: "blue" }
    };

    const filterStatus = statusMap[filter];
    const filteredClasses = filterStatus ? classes.filter(c => c.status === filterStatus) : classes;

    filteredClasses.forEach(c => {
        const registeredCount = JSON.parse(localStorage.registrations).filter(r => r.class_id === c.class_id).length;
        const courseDiv = document.createElement("div");
        courseDiv.classList.add("course-item");

        const { display: displayStatus, color: registrationColor } = displayMap[c.status] || { display: c.status, color: "black" };

        courseDiv.innerHTML = `
            <div class="course-details">
                <div class="details-left">
                    <p><span class="material-symbols-outlined">calendar_today</span> <span>Term:</span> ${c.term}</p>
                    <p><span class="material-symbols-outlined">assignment</span> <span>Class ID:</span> ${c.class_id}</p>
                    <p><span class="material-symbols-outlined">school</span> <span>Course ID:</span> ${c.course_id}</p>
                    <p><span class="material-symbols-outlined">person</span> <span>Instructor ID:</span> ${c.instructor_id}</p>
                </div>
                <div class="details-right">
                    <p><span class="material-symbols-outlined">segment</span> <span>Section:</span> ${c.section}</p>
                    <p><span class="material-symbols-outlined">event_seat</span> <span>Available Seats:</span> ${c.capacity}</p>
                    <p><span class="material-symbols-outlined">group</span> <span>Registrations:</span> ${registeredCount}</p>
                    <p><span class="material-symbols-outlined">arrow_upload_progress</span> <span>Status:</span> <span style="color: ${registrationColor};">${displayStatus}</span></p>
                </div>
            </div>
        `;

        courseContainer.appendChild(courseDiv);
    });
}

// Function to display courses based on the selected filter
function displayCourses(courses) {
    const container = document.querySelector(".class-container");
    container.innerHTML = "";
    const filter = document.querySelector('#course-status-filter').value;

    const statusMap = {
        "all": null,
        "open-for-registration": "open-for-registration",
        "in-progress": "in-progress",
        "closed": "closed"
    };

    const filterStatus = statusMap[filter];
    const filteredCourses = filterStatus ? courses.filter(c => c.status === filterStatus) : courses;

    filteredCourses.forEach(course => {
        const coursdiv = document.createElement("div");
        coursdiv.classList.add("class-item");

        const prerequisites = course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "none";

        let statusColor = course.status === "open-for-registration" ? "orange"
            : course.status === "in-progress" ? "green"
                : course.status === "closed" ? "blue"
                    : "red";

        coursdiv.innerHTML = `
            <div class="course-header">
                <div class="course-title">
                    <span class="material-symbols-outlined">chevron_right</span>
                    Course Name: ${course.course_name}
                </div>
            </div>
            <div class="course-details">
                <p><span class="material-symbols-outlined">assignment</span> <span>Course ID:</span> ${course.course_id}</p>
                <p><span class="material-symbols-outlined">tag</span> <span>Course Number:</span> ${course.course_number}</p>
                <p><span class="material-symbols-outlined">school</span> <span>Major:</span> ${Array.isArray(course.major) ? course.major.join(", ") : course.major}</p>
                <p><span class="material-symbols-outlined">checklist</span> <span>Prerequisites:</span> ${prerequisites}</p>
                <p><span class="material-symbols-outlined">arrow_upload_progress</span> <span>Status:</span> <span style="color: ${statusColor};">${course.status}</span></p>
            </div>
        `;

        container.appendChild(coursdiv);
    });
}

function filterClasses() {
    loadClasses();
}

function filterCourses() {
    displayCourses(JSON.parse(localStorage.courses));
}

// Function to load course options for the prerequisite input fields
function loadCourseOptions() {
    const courses = JSON.parse(localStorage.courses);
    const dataList = document.querySelector("#courses");
    dataList.innerHTML = "";
    courses.forEach(course => {
        const option = document.createElement("option");
        option.value = `${course.course_number} (${course.course_id})`;
        dataList.appendChild(option);
    });
}

// Function to add a prerequisite input field 
function addPrerequisiteInput(e) {
    e.preventDefault();
    const preInputs = document.querySelectorAll(".pre-input");
    const preDiv = document.querySelector(".per-select-container");
    for (let i of preInputs) {
        if (i.value.trim() === "") {
            showMessage("Please fill in all prerequisite fields before adding another.");
            return;
        }
    }
    const input = document.createElement("input");
    input.classList.add("pre-input");
    input.type = "text";
    input.placeholder = "Pre-requisite";
    input.setAttribute("list", "courses");
    preDiv.appendChild(input);
}

// Function to handle class submission
function handleClassSubmission(e) {
    e.preventDefault();
    const term = document.querySelector('#term-selector').value;
    const courseId = parseInt(document.querySelector('#course-no-input').value);
    const section = document.querySelector('#section-input').value;
    const instructor = parseInt(document.querySelector('#instructor-input').value);

    if (!term || !courseId || !section || !instructor) {
        showMessage("All fields are required.");
        return;
    }

    const courses = JSON.parse(localStorage.courses);
    if (!courses.some(c => c.course_id === courseId)) {
        showMessage("Invalid Course ID.");
        return;
    }

    const users = JSON.parse(localStorage.users);
    if (!users.some(u => u.instructor_id === instructor && u.role === "Instructor")) {
        showMessage("Invalid Instructor ID.");
        return;
    }

    let classes = JSON.parse(localStorage.classes);
    const lastID = classes.length > 0 ? classes[classes.length - 1].class_id : 0;
    const newClassId = lastID + 1;

    const newClass = {
        class_id: newClassId,
        course_id: courseId,
        term: term,
        section: section,
        instructor_id: instructor,
        capacity: 40,
        status: "open-for-registration"
    };

    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));
    document.querySelector('.new-course').reset();
    showMessage(`Class ${newClassId} added as open-for-registration.`);
    loadClasses();
    displayPendingItems();
}

// Function to handle course submission
function handleCourseSubmission(e) {
    e.preventDefault();
    const courseName = document.querySelector('.course-name').value;
    const courseNumber = document.querySelector('.course-number').value;
    const selected_majors = Array.from(document.querySelectorAll('.major-option:checked')).map(input => input.value);
    const prerequisites = Array.from(document.querySelectorAll('.pre-input'))
        .map(i => {
            const match = i.value.match(/\((\d+)\)$/);
            return match ? parseInt(match[1]) : null;
        })
        .filter(value => value !== null && JSON.parse(localStorage.courses).some(c => c.course_id === value));

    if (!courseName || !courseNumber || selected_majors.length === 0) {
        showMessage("Course name, number, and at least one major are required.");
        return;
    }

    let courses = JSON.parse(localStorage.courses);
    if (courses.some(c => c.course_number === courseNumber)) {
        showMessage("Course number already exists.");
        return;
    }

    const lastID = courses.length > 0 ? courses[courses.length - 1].course_id : 0;
    const newCourseId = lastID + 1;

    const newCourse = {
        course_id: newCourseId,
        course_name: courseName,
        course_number: courseNumber,
        major: selected_majors,
        prerequisites: prerequisites,
        status: "open-for-registration"
    };

    courses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(courses));
    document.querySelector('.new-class-form').reset();
    showMessage(`Course ${newCourseId} added as open-for-registration.`);
    displayCourses(courses);
    loadCourseOptions();
    displayPendingItems();
}

// Function to validate a class and update its status
function validateClass(id) {
    let classes = JSON.parse(localStorage.classes);
    const desired_class = classes.find(c => c.class_id === id);

    if (desired_class && desired_class.status === "open-for-registration") {
        desired_class.status = "validated";
        localStorage.setItem('classes', JSON.stringify(classes));
        showMessage(`Class ${id} validated successfully.`);
        loadClasses();
        displayPendingItems();
    } else {
        showMessage(`Class ${id} cannot be validated (not open-for-registration).`);
    }
}

// Function to reject a class and remove registrations
function rejectClass(id) {
    let classes = JSON.parse(localStorage.classes);
    let registrations = JSON.parse(localStorage.registrations);
    const desired_class = classes.find(c => c.class_id === id);

    if (desired_class) {
        desired_class.status = "closed";
        registrations = registrations.filter(r => r.class_id !== id);
        localStorage.setItem('registrations', JSON.stringify(registrations));
        localStorage.setItem('classes', JSON.stringify(classes));
        showMessage(`Class ${id} rejected and closed. All registration requests removed.`);
        loadClasses();
        displayPendingItems();
    } else {
        showMessage(`Class ${id} not found.`);
    }
}

// Function to validate a course and its associated classes
function validateCourse(id) {
    let courses = JSON.parse(localStorage.courses);
    let classes = JSON.parse(localStorage.classes);
    const course = courses.find(c => c.course_id === id);

    console.log('Course to validate:', course);
    console.log('Classes before validation:', classes);

    if (course && course.status === "open-for-registration") {
        course.status = "in-progress";
        classes = classes.map(cls => {
            if (parseInt(cls.course_id) === parseInt(id) && cls.status === "open-for-registration") {
                console.log(`Validating class ${cls.class_id} for course ${id}`);
                return { ...cls, status: "validated" };
            }
            return cls;
        });

        console.log('Classes after validation:', classes);

        localStorage.setItem('courses', JSON.stringify(courses));
        localStorage.setItem('classes', JSON.stringify(classes));

        showMessage(`Course ${id} validated successfully. Now in-progress. Associated classes have been validated.`);
        displayCourses(courses);
        loadClasses();
        displayPendingItems();
    } else {
        showMessage(`Course ${id} cannot be validated (not open-for-registration).`);
    }
}

// Function to reject a course and its associated classes
function rejectCourse(id) {
    let courses = JSON.parse(localStorage.courses);
    let classes = JSON.parse(localStorage.classes);
    let registrations = JSON.parse(localStorage.registrations);
    const course = courses.find(c => c.course_id === id);

    if (course) {
        course.status = "closed";
        const relatedClasses = classes.filter(c => c.course_id === id);
        relatedClasses.forEach(cls => {
            cls.status = "closed";
        });
        const relatedClassIds = relatedClasses.map(cls => cls.class_id);
        registrations = registrations.filter(r => !relatedClassIds.includes(r.class_id));

        localStorage.setItem('courses', JSON.stringify(courses));
        localStorage.setItem('classes', JSON.stringify(classes));
        localStorage.setItem('registrations', JSON.stringify(registrations));
        showMessage(`Course ${id} rejected and closed along with its classes. All registration requests removed.`);
        displayCourses(courses);
        loadClasses();
        displayPendingItems();
    } else {
        showMessage(`Course ${id} not found.`);
    }
}

// Function to check class capacity and update status
function checkClassCapacity() {
    let classes = JSON.parse(localStorage.classes);
    const registrations = JSON.parse(localStorage.registrations);

    classes.forEach(c => {
        const registeredCount = registrations.filter(r => r.class_id === c.class_id).length;
        c.capacity = 40 - registeredCount;
        if (c.capacity < 0) c.capacity = 0;
        if (c.status === "open-for-registration" && c.capacity === 0) {
            c.status = "closed";
        }
    });

    localStorage.setItem('classes', JSON.stringify(classes));
}

// Function to display pending items based on the selected category
function displayPendingItems() {
    const classes = JSON.parse(localStorage.classes);
    const courses = JSON.parse(localStorage.courses);
    const registrations = JSON.parse(localStorage.registrations);

    const pendingClassesContainer = document.querySelector(".pending_classes_container");
    pendingClassesContainer.innerHTML = "";

    const selected = document.querySelector("#pending_selector").value;

    if (selected === "" || selected === "classes") {
        const filtered_classes = classes.filter(c => c.status === "open-for-registration");
        filtered_classes.forEach(c => {
            const registeredCount = registrations.filter(r => r.class_id === c.class_id).length;
            const Pending_div = document.createElement("div");
            Pending_div.classList.add("pending_class_item");

            Pending_div.innerHTML = `
                <h5 class="class_heading">Term: ${c.term}</h5>
                <h5 class="class_heading">Class ID: ${c.class_id}</h5>
                <h5 class="class_heading">Course ID: ${c.course_id}</h5>
                <h5 class="class_heading">Section: ${c.section}</h5>
                <h5 class="class_heading">Available Seats: ${c.capacity}</h5>
                <h5 class="class_heading">Registrations: ${c.status === "open-for-registration" ? registeredCount : 0}</h5>
                <button id="validate_bt" onclick="validateClass(${c.class_id})">Validate</button>
                <button id="reject_bt" onclick="rejectClass(${c.class_id})">Reject</button>
            `;
            pendingClassesContainer.appendChild(Pending_div);
        });
    }

    if (selected === "" || selected === "courses") {
        const filtered_courses = courses.filter(c => c.status === "open-for-registration");
        filtered_courses.forEach(c => {
            const Pending_div = document.createElement("div");
            Pending_div.classList.add("pending_class_item");

            Pending_div.innerHTML = `
                <h5 class="class_heading">Course ID: ${c.course_id}</h5>
                <h5 class="class_heading">Course Name: ${c.course_name}</h5>
                <h5 class="class_heading">Course Number: ${c.course_number}</h5>
                <h5 class="class_heading">Major: ${Array.isArray(c.major) ? c.major.join(", ") : c.major}</h5>
                <h5 class="class_heading">Prerequisites: ${c.prerequisites.length > 0 ? c.prerequisites.join(", ") : "none"}</h5>
                <button id="validate_bt" onclick="validateCourse(${c.course_id})">Validate</button>
                <button id="reject_bt" onclick="rejectCourse(${c.course_id})">Reject</button>
            `;
            pendingClassesContainer.appendChild(Pending_div);
        });
    }
}


function filterItemsByCategory() {
    displayPendingItems();
}

function confirmLogout(event) {
    event.preventDefault();
    showConfirmation("Are you sure you want to logout?", logout);
}

function logout() {
    localStorage.removeItem('admin_user');
    window.location.href = "../index.html";
}

// Function to show a message popup
function showMessage(message) {
    const popup = document.querySelector("#message-popup");
    const popupMessage = document.querySelector("#popup-message");
    const closeButton = document.querySelector("#close-popup");
    const yesButton = document.querySelector("#confirm-yes");
    const noButton = document.querySelector("#confirm-no");

    popupMessage.textContent = message;

    closeButton.style.display = "block";
    yesButton.style.display = "none";
    noButton.style.display = "none";

    popup.style.display = "flex";

    closeButton.onclick = () => {
        popup.style.display = "none";
    };
}

// Function to show a confirmation popup message
function showConfirmation(message, onConfirm) {
    const popup = document.querySelector("#message-popup");
    const popupMessage = document.querySelector("#popup-message");
    const closeButton = document.querySelector("#close-popup");
    const yesButton = document.querySelector("#confirm-yes");
    const noButton = document.querySelector("#confirm-no");

    popupMessage.textContent = message;

    closeButton.style.display = "none";
    yesButton.style.display = "block";
    noButton.style.display = "block";

    popup.style.display = "flex";

    yesButton.onclick = () => {
        onConfirm();
        popup.style.display = "none";
    };

    noButton.onclick = () => {
        popup.style.display = "none";
    };
}
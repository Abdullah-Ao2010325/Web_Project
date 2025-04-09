document.addEventListener("DOMContentLoaded", () => {
    // Ensure data exists in localStorage
    if (!localStorage.classes) localStorage.classes = JSON.stringify([]);
    if (!localStorage.courses) localStorage.courses = JSON.stringify([]);
    if (!localStorage.users) localStorage.users = JSON.stringify([]);
    if (!localStorage.registrations) localStorage.registrations = JSON.stringify([]);

    loadClasses();
    loadCourses();
    loadCourseOptions();
    displayPendingItems();

    // Event listeners
    document.querySelector("#add-pre-bt").addEventListener("click", addPrerequisiteInput);
    document.querySelector("#pending_selector").addEventListener("change", filterItemsByCategory);
    document.querySelector('.new-course').addEventListener('submit', handleClassSubmission);
    document.querySelector('.new-class-form').addEventListener('submit', handleCourseSubmission);
    document.querySelector('#class-status-filter').addEventListener('change', filterClasses);
    document.querySelector('#course-status-filter').addEventListener('change', filterCourses);
});

function loadClasses() {
    const classes = JSON.parse(localStorage.classes);
    checkClassCapacity(); // Update class capacity and status
    displayClasses(classes);
}

function loadCourses() {
    const courses = JSON.parse(localStorage.courses);
    displayCourses(courses);
}

function loadCourseOptions() {
    const courses = JSON.parse(localStorage.courses);
    const dataList = document.querySelector("#courses");
    dataList.innerHTML = ""; // Clear previous options
    courses.forEach(course => {
        const option = document.createElement("option");
        option.value = `${course.course_number} (${course.course_id})`;
        dataList.appendChild(option);
    });
}

function displayClasses(classes) {
    const course_container = document.querySelector(".course-container");
    course_container.innerHTML = ""; 
    const filter = document.querySelector('#class-status-filter').value.toLowerCase().replace(/\s+/g, '-');

    const filteredClasses = filter === "all" 
        ? classes 
        : classes.filter(c => c.status.toLowerCase().replace(/\s+/g, '-') === filter);

    filteredClasses.forEach(c => {
        const registeredCount = JSON.parse(localStorage.registrations).filter(r => r.class_id === c.class_id).length;
        const course_div = document.createElement("div");
        course_div.classList.add("course-item");

        let registration_color = c.status === "open-for-registration" ? "orange" 
            : c.status === "validated" ? "green" 
            : c.status === "closed" ? "blue" 
            : "red";

        course_div.innerHTML = `
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">arrow_forward_ios</span>
                Term: ${c.term}
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">arrow_forward_ios</span>
                Class ID: ${c.class_id}
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">arrow_forward_ios</span>
                Course ID: ${c.course_id}
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">arrow_forward_ios</span>
                Instructor ID: ${c.instructor_id}
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">arrow_forward_ios</span>
                Section: ${c.section}
            </h5>
            <div class="course-footer">
                <h5 class="Course-heading">
                    <span class="material-symbols-outlined">person</span>
                    Available Seats: ${c.capacity}
                </h5>
                <h5 class="Course-heading">
                    <span class="material-symbols-outlined">person</span>
                    Registrations: ${registeredCount}
                </h5>
                <h5 class="Course-heading">
                    <span class="material-symbols-outlined">arrow_upload_progress</span>
                    Status: <span style="color: ${registration_color};">${c.status}</span>
                </h5>
            </div>
        `;

        course_container.appendChild(course_div);
    });
}

function displayCourses(courses) {
    const container = document.querySelector(".class-container");
    container.innerHTML = "";
    const filter = document.querySelector('#course-status-filter').value.toLowerCase().replace(/\s+/g, '-');

    const filteredCourses = filter === "all" 
        ? courses 
        : courses.filter(c => c.status.toLowerCase().replace(/\s+/g, '-') === filter);

    filteredCourses.forEach(course => {
        const coursdiv = document.createElement("div");
        coursdiv.classList.add("class-item");

        const prerequisites = course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "noone";

        coursdiv.innerHTML = `
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">assignment</span>
                Course ID: ${course.course_id}
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">subject</span>
                Course Name: ${course.course_name}
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">tag</span>
                Course Number: ${course.course_number}
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">school</span>
                Major: ${Array.isArray(course.major) ? course.major.join(", ") : course.major}  
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">checklist</span>
                Prerequisites: ${prerequisites}
            </h5>
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">arrow_upload_progress</span>
                Status: ${course.status}
            </h5>
        `;

        container.appendChild(coursdiv);
    });
}

function filterClasses() {
    const classes = JSON.parse(localStorage.classes);
    displayClasses(classes);
}

function filterCourses() {
    const courses = JSON.parse(localStorage.courses);
    displayCourses(courses);
}

function addPrerequisiteInput(e) {
    e.preventDefault();
    const preInputs = document.querySelectorAll(".pre-input");
    const preDiv = document.querySelector(".per-select-container");
    for (let i of preInputs) {
        if (i.value.trim() === "") {
            alert("Please fill in all prerequisite fields before adding another.");
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

function handleClassSubmission(e) {
    e.preventDefault();
    const term = document.querySelector('#term-selector').value;
    const courseId = parseInt(document.querySelector('#course-no-input').value);
    const section = document.querySelector('#section-input').value;
    const instructor = parseInt(document.querySelector('#instructor-input').value);
    const status = document.querySelector('#status-selector').value;

    if (!term || !courseId || !section || !instructor || !status) {
        alert("All fields are required.");
        return;
    }

    const courses = JSON.parse(localStorage.courses);
    if (!courses.some(c => c.course_id === courseId)) {
        alert("Invalid Course ID.");
        return;
    }

    const users = JSON.parse(localStorage.users);
    if (!users.some(u => u.instructor_id === instructor && u.role === "Instructor")) {
        alert("Invalid Instructor ID.");
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
        capacity: 40, // Initial capacity (available seats)
        status: "open-for-registration"
    };

    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));
    document.querySelector('.new-course').reset();
    alert(`Class ${newClassId} added as open-for-registration.`);
    loadClasses();
    displayPendingItems();
}

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
        alert("Course name, number, and at least one major are required.");
        return;
    }

    let courses = JSON.parse(localStorage.courses);
    if (courses.some(c => c.course_number === courseNumber)) {
        alert("Course number already exists.");
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
    alert(`Course ${newCourseId} added as open-for-registration.`);
    loadCourses();
    loadCourseOptions();
    displayPendingItems();
}

function validateClass(id) {
    let classes = JSON.parse(localStorage.classes);
    const desired_class = classes.find(c => c.class_id === id);

    if (desired_class && desired_class.status === "open-for-registration") {
        const registeredCount = JSON.parse(localStorage.registrations).filter(r => r.class_id === id).length;
        if (registeredCount < 5) {
            alert(`Class ${id} has only ${registeredCount} registrations. Consider canceling if insufficient.`);
            return;
        }
        desired_class.status = "validated"; // Set status to "validated"
        localStorage.setItem('classes', JSON.stringify(classes));
        alert(`Class ${id} validated successfully.`);
        loadClasses();
        displayPendingItems(); // Will exclude validated classes
    } else {
        alert(`Class ${id} cannot be validated (not open-for-registration).`);
    }
}

function rejectClass(id) {
    let classes = JSON.parse(localStorage.classes);
    let registrations = JSON.parse(localStorage.registrations);
    const desired_class = classes.find(c => c.class_id === id);

    if (desired_class) {
        desired_class.status = "closed"; // Set status to "closed"
        // Remove all registration requests for this class
        registrations = registrations.filter(r => r.class_id !== id);
        localStorage.setItem('registrations', JSON.stringify(registrations));
        localStorage.setItem('classes', JSON.stringify(classes));
        alert(`Class ${id} rejected and closed. All registration requests removed.`);
        loadClasses();
        displayPendingItems(); // Will exclude closed classes
    } else {
        alert(`Class ${id} not found.`);
    }
}

function validateCourse(id) {
    let courses = JSON.parse(localStorage.courses);
    const course = courses.find(c => c.course_id === id);

    if (course && course.status === "open-for-registration") {
        course.status = "in-progress"; // Set status to "in-progress"
        localStorage.setItem('courses', JSON.stringify(courses));
        alert(`Course ${id} validated successfully. Now in-progress.`);
        loadCourses();
        displayPendingItems(); // Will exclude in-progress courses
    } else {
        alert(`Course ${id} cannot be validated (not open-for-registration).`);
    }
}

function rejectCourse(id) {
    let courses = JSON.parse(localStorage.courses);
    let classes = JSON.parse(localStorage.classes);
    let registrations = JSON.parse(localStorage.registrations);
    const course = courses.find(c => c.course_id === id);

    if (course) {
        course.status = "closed"; // Set course status to "closed"
        // Update all associated classes to "closed" and remove their registrations
        const relatedClasses = classes.filter(c => c.course_id === id);
        relatedClasses.forEach(cls => {
            cls.status = "closed";
        });
        const relatedClassIds = relatedClasses.map(cls => cls.class_id);
        registrations = registrations.filter(r => !relatedClassIds.includes(r.class_id));

        localStorage.setItem('courses', JSON.stringify(courses));
        localStorage.setItem('classes', JSON.stringify(classes));
        localStorage.setItem('registrations', JSON.stringify(registrations));
        alert(`Course ${id} rejected and closed along with its classes. All registration requests removed.`);
        loadCourses();
        loadClasses();
        displayPendingItems(); // Will exclude closed courses and classes
    } else {
        alert(`Course ${id} not found.`);
    }
}

function checkClassCapacity() {
    let classes = JSON.parse(localStorage.classes);
    const registrations = JSON.parse(localStorage.registrations);

    classes.forEach(c => {
        const registeredCount = registrations.filter(r => r.class_id === c.class_id).length;
        c.capacity = 40 - registeredCount; // Assuming original capacity is 40
        if (c.capacity < 0) c.capacity = 0;
        if (c.status === "open-for-registration" && c.capacity === 0) {
            c.status = "closed";
        }
    });

    localStorage.setItem('classes', JSON.stringify(classes));
}

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
                <h5 class="class_heading">Registrations: ${registeredCount}</h5>
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

function logout() {
    localStorage.removeItem('admin_user');
    window.location.href = "../index.html";
}
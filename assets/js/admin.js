function loadClasses() {
    const storedClasses = localStorage.getItem('classes');

    if (storedClasses) {
        displayClasses(JSON.parse(storedClasses));
    } else {
        fetch("classes.json")
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('classes', JSON.stringify(data));
                displayClasses(data);
            })
            .catch(err => console.error("Error:", err));
    }
    console.log(JSON.parse(storedClasses));
}


function loadCourses() {
    const courses = localStorage.getItem('courses');

    if (courses) {
        displayCourses(JSON.parse(courses));
    }
    else {
        fetch("courses.json")
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('courses', JSON.stringify(data));
                displayCourses(data);
            })
            .catch(err => console.error("Error loading courses:", err));
    }

    console.log(JSON.parse(courses));
}

//to add a new input field for prerequisite
function addPrerequisiteInput(e) {
    e.preventDefault();
    const preInputs = document.querySelectorAll(".pre-input");
    const preDiv = document.querySelector(".per-select-container");
    for (let i of preInputs) {
        if (i.value.trim() === "") {
            alert("Errror");
            return;
        }
    }
    const input = document.createElement("input");
    input.classList.add("pre-input");
    input.type = "text";
    input.placeholder = "Pre-requisite";
    input.setAttribute("list", "courses"); //to add the datalist to the input 

    preDiv.appendChild(input);
}



function loadprerequisites() {
    fetch("courses.json")
        .then(response => response.json())
        .then(data => displayPrerequisites(data))
        .catch(err => console.error("Error loading :", err));
}

function loadCourseOptions() {
    fetch("courses.json")
        .then(response => response.json())
        .then(courses => {
            const dataList = document.querySelector("#courses");

            courses.forEach(course => {
                const option = document.createElement("option");
                option.value = `${course.course_number} (${course.course_id})`;
                dataList.appendChild(option);
            });
        })
        .catch(err => console.error("Error loading :", err));
}



function displayClasses(classes) {
    const course_container = document.querySelector(".course-container");
    course_container.innerHTML = ""; // ✅ added

    classes.forEach(c => {
        const course_div = document.createElement("div");
        course_div.classList.add("course-item");

        let registartion_color = c.open_for_registration ? "green" : "red";
        // let capacity_color = c.capacity > 15 ? "green" : "red";

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
                    Capacity: ${c.capacity}
                </h5>
                <h5 class="Course-heading">
                    <span class="material-symbols-outlined">arrow_upload_progress</span>
                    Status: <span style="color: ${registartion_color};">${c.open_for_registration ? "Open" : "Closed"}</span>
                </h5>
            </div>
        `;

        course_container.appendChild(course_div);
    });
}



function displayCourses(c) {
    const container = document.querySelector(".class-container");
    container.innerHTML = "";
    c.forEach(course => {
        const coursdiv = document.createElement("div");
        coursdiv.classList.add("class-item");

        const prerequisites = course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "noone";

        coursdiv.innerHTML = `
            <h5 class="Course-heading">
                <span class="material-symbols-outlined">assignment  </span>
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
        `;

        container.appendChild(coursdiv);
    });
}

function handleClassSubmission(e) {
    e.preventDefault();

    const term = document.querySelector('#term-selector').value;
    const courseId = document.querySelector('#course-no-input').value;
    const section = document.querySelector('#section-input').value;
    const instructor = document.querySelector('#instructor-input').value;
    const status = document.querySelector('#status-selector').value;

    let newstatus = false;

    if (status === "open") {
        newstatus = true;
    }
    else {
        newstatus = false;
    }

    let classes = JSON.parse(localStorage.getItem('classes')) || [];

    const lastID = classes.length > 0 ? classes[classes.length - 1].class_id : 0;
    const newClassId = lastID + 1;

    const newClass = {
        class_id: newClassId,
        course_id: courseId,
        term: term,
        section: section,
        instructor_id: instructor,
        capacity: 40,
        open_for_registration: newstatus,
        registered_students: []
    };

    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));
    console.log(classes);
    loadClasses();
    document.querySelector('.new-course').reset();
}



function handleCourseSubmission(e) {
    e.preventDefault();
    const courseName = document.querySelector('.course-name').value;
    const courseNumber = document.querySelector('.course-number').value;


    const selected_majors = Array.from(document.querySelectorAll('.major-option:checked')).map(input => input.value);

    //convert it to an array (didnt work without it(array.from)) DO NOT REMOVE IT
    const prerequisites = Array.from(document.querySelectorAll('.pre-input')).map(i => i.value).filter(value => value.trim() !== "");

    let courses = JSON.parse(localStorage.getItem('courses')) || [];
    const lastID = courses.length > 0 ? courses[courses.length - 1].course_id : 0;
    const newCourseId = lastID + 1;

    const newCourse = {
        course_id: newCourseId,
        course_name: courseName,
        course_number: courseNumber,
        major: selected_majors,
        prerequisites: prerequisites,
        status: "Pending"
    };

    courses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(courses));
    console.log(courses);
    document.querySelector('.new-class-form').reset();
}




function validateCourse(id) {
    const courses = JSON.parse(localStorage.getItem('courses')) || [];

    const desired_course = courses.find(c => c.course_id === id);


    if (desired_course) {
        desired_course.status = "Validated";
        localStorage.setItem('courses', JSON.stringify(courses));
        console.log(`Course ${id} validated successfully.`);
        console.log(courses);
        loadCourses();
    }
}

function validateClass(id) {
    const classes = JSON.parse(localStorage.getItem('classes')) || [];

    const desired_class = classes.find(c => c.class_id === id);

    if (desired_class) {
        desired_class.open_for_registration = true;
        localStorage.setItem('classes', JSON.stringify(classes));
        console.log(`Class ${id} validated successfully.`);
        loadClasses();
    }
}

function rejectClass(id) {
    const classes = JSON.parse(localStorage.getItem('classes')) || [];

    const desired_class = classes.find(c => c.class_id === id);

    if (desired_class) {
        desired_class.open_for_registration = false;
        localStorage.setItem('classes', JSON.stringify(classes));
        console.log(`Class ${id} rejected successfully.`);
        loadClasses();
    }


}



function displayPendingItems() {
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    const courses = JSON.parse(localStorage.getItem('courses')) || [];

    const filtered_classes = classes.filter(c => c.capacity > 15);
    const filtered_courses = courses.filter(c => c.status === "Pending");

    console.log(filtered_classes);

    const pendingClassesContainer = document.querySelector(".pending_classes_container");

    filtered_classes.forEach(c => {
        const Pending_div = document.createElement("div");
        Pending_div.classList.add("pending_class_item");

        Pending_div.innerHTML = `
            <h5 class="class_heading">Term: ${c.term}</h5>
            <h5 class="class_heading">Class ID: ${c.class_id}</h5>
            <h5 class="class_heading">Course ID: ${c.course_id}</h5>
            <h5 class="class_heading">Section: ${c.section}</h5>
            <h5 class="class_heading">Capacity: ${c.capacity}</h5>
            <button id="validate_bt" onclick="validateClass(${c.class_id})">Validate</button>
            <button id="reject_bt" onclick="rejectClass(${c.class_id})">Reject</button>
        `;
        pendingClassesContainer.appendChild(Pending_div);
    });


    filtered_courses.forEach(c => {
        const Pending_div = document.createElement("div");
        Pending_div.classList.add("pending_class_item");

        Pending_div.innerHTML = `
            <h5 class="class_heading">Course ID: ${c.course_id}</h5>
            <h5 class="class_heading">Course Name: ${c.course_name}</h5>
            <h5 class="class_heading">Course Number: ${c.course_number}</h5>
            <h5 class="class_heading">Major: ${Array.isArray(c.major) ? c.major.join(", ") : c.major}</h5>
            <h5 class="class_heading">Prerequisites: ${c.prerequisites.length > 0 ? c.prerequisites.join(", ") : "none"}</h5>
            <button onclick="validateCourse(${c.course_id})">Validate</button>   
        `;
        pendingClassesContainer.appendChild(Pending_div);
    });
}


function filterItemsByCategory() {
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    const courses = JSON.parse(localStorage.getItem('courses')) || [];

    const Pending_div = document.querySelector(".pending_classes_container");
    const selected = document.querySelector("#pending_selector").value;
    console.log(selected); //debuging

    Pending_div.innerHTML = "";
    if (selected === "classes") {
        const filtered_classes = classes.filter(c => c.capacity > 15);
        filtered_classes.forEach(c => {
            const class_div = document.createElement("div");
            class_div.classList.add("pending_class_item");

            class_div.innerHTML = `
                <h5 class="class_heading">Term: ${c.term}</h5>
                <h5 class="class_heading">Class ID: ${c.class_id}</h5>
                <h5 class="class_heading">Course ID: ${c.course_id}</h5>
                <h5 class="class_heading">Section: ${c.section}</h5>
                <h5 class="class_heading">Capacity: ${c.capacity}</h5>
                <button id="validate_bt" onclick="validateClass(${c.class_id})">Validate</button>
                <button id="reject_bt" onclick="rejectClass(${c.class_id})">Reject</button>
            `;
            Pending_div.appendChild(class_div);
        });

    }
    else if (selected === "courses") {
        const filtered_courses = courses.filter(c => c.status === "Pending");
        filtered_courses.forEach(c => {
            const course_div = document.createElement("div");
            course_div.classList.add("pending_class_item");
            course_div.innerHTML = `
                <h5 class="class_heading">Course ID: ${c.course_id}</h5>
                <h5 class="class_heading">Course Name: ${c.course_name}</h5>
                <h5 class="class_heading">Course Number: ${c.course_number}</h5>
                <h5 class="class_heading">Major: ${Array.isArray(c.major) ? c.major.join(", ") : c.major}</h5>
                <h5 class="class_heading">Prerequisites: ${c.prerequisites.length > 0 ? c.prerequisites.join(", ") : "none"}</h5>
                <button onclick="validateCourse(${c.course_id})">Validate</button>   
            `;
            Pending_div.appendChild(course_div);
        });
    }
}

function logout() {
    localStorage.removeItem('admin_user');
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadClasses();
    loadCourses();
    loadCourseOptions();
    displayPendingItems()
    document.querySelector("#add-pre-bt").addEventListener("click", addPrerequisiteInput);
    document.querySelector("#pending_selector").addEventListener("change", filterItemsByCategory);


});

document.querySelector('.new-course').addEventListener('submit', handleClassSubmission);

document.querySelector('.new-class-form').addEventListener('submit', handleCourseSubmission);

Pending_div.querySelector("#validate_bt").addEventListener("click", () => validateClass(c.class_id));

Pending_div.querySelector("#reject_bt").addEventListener("click", () => rejectClass(c.class_id));


// document.querySelector("#pending_selector").addEventListener("change", filterItemsByCategory);





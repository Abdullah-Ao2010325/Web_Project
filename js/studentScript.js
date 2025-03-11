document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded successfully!");

    const loginForm = document.querySelector(".login-form-box form");
    if (!loginForm) {
        console.error("Login form not found!");
        return;
    }

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Form submitted");

        const email = loginForm.querySelector('input[type="text"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        console.log("Email:", email, "Password:", password);

        // Fetch the users.json file
        fetch("json/students.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch users data");
                }
                return response.json(); // Parse the JSON data
            })
            .then((data) => {
                console.log("Users data loaded:", data); // Log the fetched data
                const students = data.students;
                const foundStudent = students.find(
                    (student) =>
                        student.username === email && student.password === password
                );

                if (foundStudent) {
                    console.log("Student found:", foundStudent);
                    sessionStorage.setItem("loggedInUser", JSON.stringify(foundStudent));
                    window.location.href = "student.html";
                } else {
                    console.log("Invalid email or password");
                    alert("Invalid email or password. Please try again.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            });
    });
});
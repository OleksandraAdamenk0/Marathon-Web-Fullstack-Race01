const inputs = document.getElementsByClassName("input");
const form = document.querySelector(".content");

function checkInputActivity(target) {
    console.log(target);
    if (target.value !== "") {
        target.classList.add("active-input");
    } else {
        target.classList.remove("active-input");
    }
}

function validateEmail(emailInput) {
    if (!emailInput || !emailInput.value) return false;
    const userEmail = emailInput.value.trim();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const invalidCharsLocalRegex = /[^a-zA-Z0-9._%+-]/;
    const invalidCharsDomainRegex = /[^a-zA-Z0-9.-]/;

    if (!emailRegex.test(userEmail)) return false;
    const [localPart, domainPart] = userEmail.split('@');

    if (invalidCharsLocalRegex.test(localPart)) return false;
    if (!domainPart.includes('.') || invalidCharsDomainRegex.test(domainPart)) return false;

    return true;
}

function validateUsername(usernameInput) {
    if (!usernameInput || !usernameInput.value) return false;
    const username = usernameInput.value.trim();
    if (!username) return false;
    return true;
}

function validatePassword(passwordInput) {
    if (!passwordInput || !passwordInput.value) return [false, false, false, false, false, true];
    return [
        /[a-z]/.test(passwordInput.value),
        /[A-Z]/.test(passwordInput.value),
        /\d/.test(passwordInput.value),
        /[!@#$%^&*._-]/.test(passwordInput.value),
        passwordInput.value.length >= 6 && passwordInput.value.length <= 256,
        !/\s/.test(passwordInput.value)
    ];
}

function setEmailError(emailInput) {
    const emailError = document.querySelector('label[for="email"].error');
    // const icon = emailInput.closest('.input_box').querySelector('i');

    emailInput.style.borderColor = 'var(--error-color)';
    emailInput.closest('.input_box').style.margin = "32px 0"

    // emailInput.style.color = 'var(--error-color)';
    if (emailError) emailError.style.display = 'block';
    // if (icon) icon.style.color = 'var(--error-color)';
}

function setUsernameError(usernameInput) {
    const usernameError = document.querySelector('label[for="username"].error');
    usernameInput.style.borderColor = 'var(--error-color)';
    usernameInput.closest('.input_box').style.margin = "32px 0"
    if (usernameError) usernameError.style.display = 'block';
}

function checkUsername(event) {
    const usernameInput = document.getElementById('username');
    const isUsernameValid = validateUsername(usernameInput);
    if (!isUsernameValid) {
        event.preventDefault();
        setUsernameError(usernameInput);
    }
}

function checkEmail(event) {
    const emailInput = document.getElementById('email');
    const isEmailValid = validateEmail(emailInput);
    if (!isEmailValid) {
        event.preventDefault();
        setEmailError(emailInput);
    }
}

function checkPassword(event) {
    const passwordInput = document.getElementById('pass');
    const checks = validatePassword(passwordInput);
    const requirements = document.querySelectorAll("#password-requirements li");
    for (const check of checks) {
        if (!check) {
            passwordInput.style.borderColor = 'var(--error-color)';
            event.preventDefault();
            break;
        }
    }
    requirements.forEach((req, index) => {
        req.classList.remove("pass-valid", "pass-invalid", "pass-invalid-error");
        req.classList.add(checks[index] ? "pass-valid" : "pass-invalid-error");
    });
}

function checkRepeat(event) {
    const passwordInput = document.getElementById('pass');
    const repeat = document.getElementById('repeat-pass');

    console.log(passwordInput.value, " === ", repeat.value);
    if (!(passwordInput.value === repeat.value)) {
        const repeatError = document.querySelector('label[for="repeat-pass"].error');
        event.preventDefault();
        repeat.style.borderColor = 'var(--error-color)';
        repeat.closest('.input_box').style.margin = "32px 0"
        if (repeatError) repeatError.style.display = 'block';
    }
}

function checkPasswordEmptiness(event) {
    const passwordInput = document.getElementById('pass');
    if (passwordInput.value.trim().length < 1) {
        passwordInput.style.borderColor = 'var(--error-color)';
        passwordInput.closest('.input_box').style.margin = "32px 0"
        event.preventDefault();
        const emptyPasswordError = document.querySelector('label[for="pass"].error');
        if (emptyPasswordError) emptyPasswordError.style.display = 'block';
    }
}

function submitForm(event) {
    checkEmail(event);
    if (form.id === "registration") {
        checkUsername(event);
        checkPassword(event);
        checkRepeat(event);
    }
    if (form.id === "login") {
        checkPasswordEmptiness(event);
    }
}

function updateRequirements(passwordInput, requirements) {
    const checks =validatePassword(passwordInput);

    requirements.forEach((req, index) => {
        req.classList.remove("pass-valid", "pass-invalid");
        req.classList.add(checks[index] ? "pass-valid" : "pass-invalid");
        if (req.classList.contains("pass-valid") && req.classList.contains("pass-invalid-error"))
            req.classList.remove("pass-invalid-error");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    Array.from(inputs).forEach(input => checkInputActivity(input));

    Array.from(inputs).forEach(input => {
        input.addEventListener("input", (e) => checkInputActivity(e.target))
    })

    form.addEventListener("submit", submitForm);

    if (form.id === "registration") {
        const passwordInput = document.getElementById("pass");
        const requirements = document.querySelectorAll("#password-requirements li");

        passwordInput.addEventListener("input", (e) => updateRequirements(passwordInput, requirements));
        updateRequirements(passwordInput, requirements);
    }
});
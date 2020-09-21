"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./styles/app.scss");
require("./scroll");
var question_1 = require("./question");
var Modal_1 = require("./Modal");
var templates_1 = require("./templates");
var auth_1 = require("./auth");
console.log('Hello!!!!');
var $form = document.querySelector('#mainForm');
var $submitButton = document.getElementById('sb1');
var $inputText = document.getElementById('i1');
var $modalBtn = document.querySelector('#modalBtn');
var modal;
// funcs
function authFormHandler(event) {
    var target = event.target;
    var targetElements = target.elements;
    event.preventDefault();
    var passwordInput = targetElements.password;
    var loginInput = targetElements.login;
    var loginBtn = targetElements.logintn;
    loginBtn.disabled = true;
    auth_1.authUser(loginInput.value, passwordInput.value)
        .then(question_1.Question.fetch)
        .then(renderModalAfterAuth)
        .then(function () {
        modal === null || modal === void 0 ? void 0 : modal.destroy();
        modal = undefined;
        document.getElementById('questionLabel').textContent = 'Все вопросы';
        document.getElementById('authBtn').outerHTML = "\n            <div class=\"sidebar__item\" id=\"authBtn\">\n                <p>\u0412\u044B \u0430\u0434\u043C\u0438\u043D!</p>\n            </div>\n            ";
    })
        .catch(function (err) {
        var _a;
        loginBtn.disabled = false;
        var oldError = modal === null || modal === void 0 ? void 0 : modal.modal.querySelector('.error-alert');
        if (oldError)
            oldError.remove();
        (_a = modal === null || modal === void 0 ? void 0 : modal.modal.querySelector('form')) === null || _a === void 0 ? void 0 : _a.insertAdjacentHTML('beforebegin', err);
    });
}
function renderModalAfterAuth(content) {
    if (typeof content !== 'string') {
        question_1.Question.renderList(content);
    }
}
// code
$inputText.addEventListener('input', function (event) {
    var target = event.target;
    $submitButton.disabled = target.value.length < 10 || target.value.length > 256;
});
$form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = $inputText.value;
    if (value.trim().length < 10) {
        return;
    }
    var question = {
        text: value.trim(),
        date: Date.now(),
        id: ''
    };
    $submitButton.disabled = true;
    question_1.Question.create(question).then(function () {
        $submitButton.disabled = false;
        $inputText.value = '';
    })
        .catch(function (err) {
        console.log(err);
    });
});
document.addEventListener('click', function (e) {
    var event = e;
    if (document.documentElement.clientWidth < 767 && !event.target.closest('.sidebar__container') && !event.isModalClick) {
        document.querySelector('.sidebar').classList.remove('open');
    }
});
$modalBtn.addEventListener('click', function (event) {
    modal = new Modal_1.Modal(templates_1.getAuthForm());
    modal.modal
        .querySelector('form').addEventListener('submit', authFormHandler);
});
question_1.Question.renderList();

var STUDENT_NAME = "Gregorio, Pamine, Morta, Aninipot, Campopos, Marcaida";
var SCHOOL_NAME = "Computer Arts and Techological College, Inc.";
var COURSE_NAME = "Data Structure & Algorithms";
// 1.0 ang highest then 3.0 lwoest, not specified on expected rules 3.3
var HIGHEST_GPA = 1.0;
var LOWEST_GPA = 5.0;
var SAVE_KEY = "studentRecords13";

var students = [];
var searchText = "";
var sortMode = "id";

function loadStudents() {
  try {
    var saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      students = JSON.parse(saved);
    } else {
      students = [
        { id: "S250571", name: "Rene Baterbonia", gpa: 1.25 },
        { id: "S294625", name: "Carlos Yulo", gpa: 1.75 },
      ];
      saveStudents();
    }
  } catch (e) {
    students = [];
  }
}

function saveStudents() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(students));
  } catch (e) {}
  updateSummary();
}

function updateSummary() {
  var box = document.getElementById("summary");
  if (students.length === 0) {
    box.textContent = "Total students: 0";
    return;
  }
  var total = 0;
  for (var i = 0; i < students.length; i++) {
    total += students[i].gpa;
  }
  box.textContent =
    "Total students: " +
    students.length +
    "   |   Average GPA: " +
    (total / students.length).toFixed(2);
}
function safe(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function findIndexById(list, id) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].id.toLowerCase() === id.toLowerCase()) {
      return i;
    }
  }
  return -1;
}

function checkInput(id, name, gpaText) {
  if (id.trim() === "") {
    return "Please enter a student ID.";
  }
  if (!/^S[0-9]+$/.test(id.trim())) {
    return "Please enter a valid student ID.";
  }
  if (name.trim() === "") {
    return "Please enter the student's name.";
  }
  if (/[0-9]/.test(name)) {
    return "Name should not contain numbers.";
  }
  if (gpaText.toString().trim() === "") {
    return "Please enter a GPA.";
  }
  var gpa = Number(gpaText);
  if (isNaN(gpa)) {
    return "GPA must be a number, for example 3.5.";
  }
  if (gpa < HIGHEST_GPA || gpa > LOWEST_GPA) {
    return (
      "GPA must be between " +
      HIGHEST_GPA.toFixed(1) +
      " (highest) and " +
      LOWEST_GPA.toFixed(1) +
      " (lowest)."
    );
  }
  return "";
}

function addStudent(list, id, name, gpaText) {
  var error = checkInput(id, name, gpaText);
  if (error !== "") {
    return { ok: false, text: error };
  }
  if (findIndexById(list, id.trim()) !== -1) {
    return {
      ok: false,
      text:
        "Student ID " +
        id.trim() +
        " is already in use. Please use a different ID.",
    };
  }
  list.push({ id: id.trim(), name: name.trim(), gpa: Number(gpaText) });
  return { ok: true, text: "Student " + name.trim() + " was added." };
}

function updateStudent(list, oldId, newId, name, gpaText) {
  var position = findIndexById(list, oldId);
  if (position === -1) {
    return { ok: false, text: "No student found with ID " + oldId + "." };
  }
  var error = checkInput(newId, name, gpaText);
  if (error !== "") {
    return { ok: false, text: error };
  }
  var other = findIndexById(list, newId.trim());
  if (other !== -1 && other !== position) {
    return {
      ok: false,
      text:
        "Student ID " +
        newId.trim() +
        " already belongs to another student. Nothing was changed.",
    };
  }
  list[position].id = newId.trim();
  list[position].name = name.trim();
  list[position].gpa = Number(gpaText);
  return { ok: true, text: "Record updated." };
}

function removeStudent(list, id) {
  var position = findIndexById(list, id);
  if (position === -1) {
    return { ok: false, text: "No student found with ID " + id + "." };
  }
  var removed = list.splice(position, 1)[0];
  return {
    ok: true,
    text: "Student " + removed.name + " (ID " + removed.id + ") was removed.",
  };
}

function searchStudents(list, text) {
  var search = text.trim().toLowerCase();
  var found = [];
  for (var i = 0; i < list.length; i++) {
    if (
      list[i].name.toLowerCase().indexOf(search) !== -1 ||
      list[i].id.toLowerCase().indexOf(search) !== -1
    ) {
      found.push(list[i]);
    }
  }
  return found;
}

function sortList(list, mode) {
  var copy = list.slice();
  copy.sort(function (a, b) {
    var result = 0;

    if (mode === "gpaHigh") {
      result = a.gpa - b.gpa;
    }
    if (mode === "gpaLow") {
      result = b.gpa - a.gpa;
    }
    if (mode === "name") {
      result = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }
    if (result !== 0) {
      return result;
    }
    return a.id.localeCompare(b.id, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
  return copy;
}

var messageBox = document.getElementById("message");
var dlg = document.getElementById("dlg");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = type;
}
function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "";
}

var sortNames = {
  id: "Student ID, lowest first",
  gpaHigh: "GPA, highest first",
  gpaLow: "GPA, lowest first",
  name: "name, A to Z",
};

function drawTable() {
  var list =
    searchText.trim() === "" ? students : searchStudents(students, searchText);
  list = sortList(list, sortMode);

  var html = "";
  if (list.length === 0) {
    html =
      "<tr><td class='empty' colspan='4'>" +
      (students.length === 0
        ? 'No records yet. Press "+ Add student" to create one.'
        : 'No student found for "' + safe(searchText.trim()) + '".') +
      "</td></tr>";
  }
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    html +=
      "<tr><td>" +
      safe(s.name) +
      "</td><td>" +
      safe(s.id) +
      "</td><td>" +
      s.gpa.toFixed(2) +
      "</td>" +
      "<td class='actions'>" +
      "<button class='small' data-act='edit' data-id=\"" +
      safe(s.id) +
      '">Edit</button>' +
      "<button class='small red' data-act='remove' data-id=\"" +
      safe(s.id) +
      '">Remove</button></td></tr>';
  }
  document.getElementById("rows").innerHTML = html;

  document.getElementById("note").textContent =
    "Showing " +
    list.length +
    " of " +
    students.length +
    " students, sorted by " +
    sortNames[sortMode];
}

function doSearch() {
  searchText = document.getElementById("searchBox").value;
  drawTable();
  if (searchText.trim() === "") {
    clearMessage();
    return;
  }
  var count = searchStudents(students, searchText).length;
  if (count === 0) {
    showMessage(
      'Not found: no student matches "' + searchText.trim() + '".',
      "bad",
    );
  } else {
    showMessage(count + " matching record(s) found.", "good");
  }
}

function openForm(student) {
  var editing = student !== null;
  dlg.innerHTML =
    "<h2>" +
    (editing ? "Edit student" : "Add student") +
    "</h2>" +
    "<label for='fId'>Student ID</label><input id='fId' maxlength='7' placeholder='e.g. S250320' value=\"" +
    '">' +
    "<label for='fName'>Full name</label><input id='fName' placeholder='e.g. Joshua Garcia' value=\"" +
    (editing ? safe(student.name) : "") +
    '">' +
    "<label for='fGpa'>GPA (" +
    HIGHEST_GPA.toFixed(1) +
    " highest to " +
    LOWEST_GPA.toFixed(1) +
    " lowest)</label><input id='fGpa' placeholder='e.g. 1.5' value=\"" +
    (editing ? student.gpa : "") +
    '">' +
    "<div id='formError' role='alert'></div>" +
    "<div class='btnrow'><button id='fSave'>" +
    (editing ? "Save changes" : "Add student") +
    "</button>" +
    "<button class='grey' id='fCancel'>Cancel</button></div>";
  dlg.showModal();

  document.getElementById("fCancel").onclick = function () {
    dlg.close();
  };
  document.getElementById("fSave").onclick = function () {
    var id = document.getElementById("fId").value;
    var name = document.getElementById("fName").value;
    var gpa = document.getElementById("fGpa").value;
    var result = editing
      ? updateStudent(students, student.id, id, name, gpa)
      : addStudent(students, id, name, gpa);
    if (!result.ok) {
      document.getElementById("formError").textContent = result.text;
      return;
    }
    saveStudents();
    dlg.close();
    drawTable();
    showMessage(result.text, "good");
  };
}

function openRemove(student) {
  dlg.innerHTML =
    "<h2>Remove this student?</h2>" +
    "<p><b>" +
    safe(student.name) +
    "</b><br>ID: " +
    safe(student.id) +
    "<br>GPA: " +
    student.gpa.toFixed(2) +
    "</p>" +
    "<div class='btnrow'><button class='red' id='rYes'>Yes, remove</button><button class='grey' id='rNo'>Cancel</button></div>";
  dlg.showModal();
  document.getElementById("rNo").onclick = function () {
    dlg.close();
    showMessage("Removal cancelled. Nothing was changed.", "info");
  };
  document.getElementById("rYes").onclick = function () {
    var result = removeStudent(students, student.id);
    saveStudents();
    dlg.close();
    drawTable();
    showMessage(result.text, "bad");
  };
}

document.getElementById("searchBtn").onclick = doSearch;
document.getElementById("searchBox").onkeydown = function (e) {
  if (e.key === "Enter") {
    doSearch();
  }
};
document.getElementById("clearBtn").onclick = function () {
  document.getElementById("searchBox").value = "";
  searchText = "";
  clearMessage();
  drawTable();
};
document.getElementById("sortBox").onchange = function () {
  sortMode = this.value;
  drawTable();
};
document.getElementById("addBtn").onclick = function () {
  openForm(null);
};

document.getElementById("rows").onclick = function (e) {
  var act = e.target.getAttribute("data-act");
  if (!act) {
    return;
  }
  var position = findIndexById(students, e.target.getAttribute("data-id"));
  if (position === -1) {
    showMessage("That student no longer exists.", "bad");
    drawTable();
    return;
  }
  if (act === "edit") {
    openForm(students[position]);
  } else {
    openRemove(students[position]);
  }
};

document.getElementById("exitBtn").onclick = function () {
  document.getElementById("app").hidden = true;
  document.getElementById("goodbye").hidden = false;
  document.getElementById("exitBtn").hidden = true;
};
document.getElementById("reopen").onclick = function () {
  document.getElementById("goodbye").hidden = true;
  document.getElementById("app").hidden = false;
  document.getElementById("exitBtn").hidden = false;
};

document.getElementById("logo").innerHTML =
  '<img src="logo.jpg" alt="School logo" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
document.getElementById("schoolTitle").textContent = SCHOOL_NAME;
document.getElementById("footName").textContent =
  STUDENT_NAME + " (" + COURSE_NAME + ")";
document.title = "Student Record Management System - " + SCHOOL_NAME;
loadStudents();
updateSummary();
drawTable();

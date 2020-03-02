//Graph Globals
var reports = [];
var notif = false;
var categoriesCount = [];
var groupsCount = [];
var categories = [];
var groups = [];
var colors = [];
var loaded = false;

var barGraph = null;
var barGraph2 = null;
var barGraph3 = null;
var barGraph4 = null;
var search = 0;
var byGroupCount = [];
var byCategoryCount = [];
var maxCategoryCount = 0;
var maxGroupCount = 0;

function clearValues() {
    categoriesCount = [];
    groupsCount = [];
    categories = [];
    groups = [];
    reports = [];
    groupsCount = [];
    colors = [];
    pieColors = [];
    notif = false;
}

function generateColors(sortBy) {
    colors = [];
    let sortLength = sortBy == 1 ? categories.length : groups.length;

    for (let i = 0; i < sortLength; i++) {
        var r = Math.floor(Math.random() * 127);
        var g = Math.floor(Math.random() * 127);
        var b = Math.floor(Math.random() * 127);
        stringColor = "rgba(" + r + "," + g + "," + b;
        colors[i] = stringColor + ",0.7)";
        pieColors[i] = stringColor + ",0.4)";
    }
}

function initSearchValue() {
    search = parseInt(document.getElementById("search").value);
}

function initArray() {
    for (let i = 0; i < groups.length; i++) {
        byGroupCount[i] = [];
    }

    for (let i = 0; i < categories.length; i++) {
        byCategoryCount[i] = [];
    }

    for (let i = 0; i < categories.length; i++) {
        for (let j = 0; j < groups.length; j++) {
            byCategoryCount[i][j] = 0;
        }
    }

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            byGroupCount[i][j] = 0;
        }
    }
}

function findMax() {
    for (let i = 0; i < categories.length; i++) {
        for (let j = 0; j < groups.length; j++) {
            if (maxCategoryCount < byCategoryCount[i][j]) {
                maxCategoryCount = byCategoryCount[i][j];
            }
        }
    }

    for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            if (maxGroupCount < byGroupCount[i][j]) {
                maxGroupCount = byGroupCount[i][j];
            }
        }
    }
}

function byCategory() {
    for (let i = 0; i < reports.length; i++) {
        for (let j = 0; j < categories.length; j++) {
            for (let k = 0; k < groups.length; k++) {
                if (reports[i].category == categories[j] && (reports[i].group == k + 1 || reports[i].group == groups[k])){
                    byCategoryCount[j][k] += 1;
                }
            }
        }
    }
}

function byGroup(){
    for(let i=0; i<reports.length; i++){
        for(let j=0; j<groups.length; j++){
            for(let k=0; k<categories.length; k++){
                if(reports[i].category == categories[k] && (reports[i].group == j + 1 || reports[i].group == groups[j])){
                    byGroupCount[j][k] += 1;
                }
            }
        }
    }
}

async function getGroupsAndCategories() {
    clearValues();
    let locCat = [];
    let locGrps = [];

    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locCat.push(doc.data().name);
            });
        });

    await db
        .collection("groups")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locGrps.push(doc.data().name);
            });
        });
    categories = locCat;
    groups = locGrps;
}
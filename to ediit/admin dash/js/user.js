async function getCategories(){
    let locReps = [];

    await db
        .collection("reports")
        .orderBy("created", "desc")
        .get()
        .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            locReps.push(doc.data());
        });
    });

    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
             categories.push(doc.data().name)
        });
    });

    initializeCategoryArray();
    countReports(locReps);
}

function initializeButtons(){
    
    var Ctgcontainer = document.getElementById("categoryContainer"); 
    
    Ctgcontainer.innerHTML = "";
    
    for(let i=0; i<categories.length; i++){
        Ctgcontainer.innerHTML += `<div class="col-sm text-center px-0">
             <button type="button" id="category` + i + `" class="w-50 btn btn-outline-primary w-75 my-2 text-center" data-toggle="popover" data-placement="top" data-content="test" style=" height: 120px;">
             ` + categories[i] + `</button>
           </div>`;
    }

    buttons = $("button[id^='category']");
    
    for(let i=0; i<buttons.length; i++){
        let j = i==buttons.length - 1 ? 0 : i+1;
        buttons[i].onclick = function(){disabledButtons(i, buttons[j])};
       // buttons[i].onmouseover = function(){updateDesc(i,buttons[i] )};
       // buttons[i].onmouseout = function(){removeDesc()};
    }
}

function updateDesc(i){
    var ctgDesc =  document.getElementById("ctgDesc"); 
    if(buttons[i].hasAttribute('disabled'))
        return;
    ctgDesc.innerHTML =  '<h6 class="pt-4">Category ' + categories[i] + `:</h6>
    <p><small>Category ` + categories[i] +  ` is a Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</small></p>`;
}

function removeDesc(){
    if(isClicked)
       return;
    var ctgDesc =  document.getElementById("ctgDesc"); 
    ctgDesc.innerHTML = '';
}

function disabledButtons(i, j){
    if(j.hasAttribute('disabled')){
        $('#picture').attr('src', "Images/buttonD.png");
        $('#picture').attr('disabled', true);
        $('#picture').attr('data-toggle', false);
        for(let k=0; k<buttons.length; k++){
            if(k!=i)
                buttons[k].removeAttribute("disabled");
        }
        buttons[i].classList.remove("btn-primary");
        buttons[i].classList.add("btn-outline-primary");
        isClicked = false;
    }else{
        $('#picture').attr('src', "Images/buttonA.png");
        $('#picture').attr('data-toggle', "modal");
        $('#picture').attr('disabled', false);
        for(let k=0; k<buttons.length; k++){
            if(k!=i){
                buttons[k].setAttribute("disabled", "disabled");
                buttons[i].classList.remove("btn-outline-primary");
                buttons[i].classList.add("btn-primary");
                getCategory(categories[buttons[i].id.replace('category','')]);
            }        
        }
        isClicked = true;
    }
   
}

function disableAll(){
    for(let i=0; i<buttons.length; i++){
        buttons[i].removeAttribute("disabled");
    }
}


$(document).ready(function() {
    if(sessionStorage.getItem("username") !== null){
        document.getElementById("userName").innerHTML = sessionStorage.getItem("username");
    }

    getCategories().then(function() {
        initializeButtons();
    });
    
    console.log($('[data-toggle="popover"]').popover()); 

    $("#picture").click(function(){
        if (jQuery('#picture')[0].hasAttribute('disabled')) {
            $('#picture').attr('src', "Images/buttonD.png");
            $('#picture').attr('data-toggle', false);
            $('#picture').attr('disabled', true);
            disableAll();
        }else{
            $('#picture').attr('data-toggle', "modal");
            $('#picture').attr('src', "Images/buttonD.png");
            $('#picture').attr('disabled', true);
            disableAll();
        }
    });

    $("#closemodal").click(function(){
        $('#picture').attr('src', "Images/buttonD.png");
        $('#picture').attr('data-toggle', false);
        $('#picture').attr('disabled', true);
        disableAll();
    });

    $("#categoryContainer").on('mousewheel DOMMouseScroll', function(e){

        let delta = Math.max(-1, Math.min(1, (e.originalEvent.wheelDelta || -e.originalEvent.detail)) );

        $(this).scrollLeft( $(this).scrollLeft() - ( delta * 40 ) );
        e.preventDefault();
    });

});

function initializeCategoryArray(){

    for(let i = 0 ; i < categories.length ; i++){
        categoryArray.push({[categories[i]] : 0});
    }   
}

function sortAlphabeticalAscending(){
    categories.sort(function(a, b){
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
}

function sortAlphabeticalDescending(){
    categories.sort(function(a, b){
        return b.toLowerCase().localeCompare(a.toLowerCase());
    });
}

// function sortByVotesAscending(){
    
//     categoryArray.sort(function(a, b){
//         return a[Object.keys(a)] - b[Object.keys(b)];
//     });

//     categories.length = 0;

//     for(let i = 0 ; i < categoryArray.length ; i++){
//         categories.push( Object.keys(categoryArray[i]) );
//     }
// }

function sortByVotesDescending(){
    
    categoryArray.sort(function(a, b){
        return b[Object.keys(b)] - a[Object.keys(a)];
    });

    categories.length = 0;

    for(let i = 0 ; i < categoryArray.length ; i++){
        categories.push( Object.keys(categoryArray[i])[0] );
    }
}

function countReports(locReps){

    for(let i = 0 ; i < locReps.length ; i++){
        for(let j = 0 ; j < categoryArray.length ; j++){
            if( locReps[i].category == Object.keys(categoryArray[j]) ){
                categoryArray[j][locReps[i].category] += 1;
            }
        }
    }
}

function findCategory(value){
    let displayData = [];
    
    displayData = categories.slice();
    
    for(i = 0; i < displayData.length ;i++){
        displayData[i] = displayData[i].toLowerCase();
    }

    displayData.forEach(function(a){
        if (typeof(a) === 'string' && a.indexOf(value)>-1) {
            let index = displayData.indexOf(value);
            let element = document.getElementById("category"+index);
            element.scrollIntoView({behavior: "smooth", inline: "center"});
        }
    });
}

function searchBoxField(){
    let searchString = document.getElementById('searchBox').value;

    $('#searchBox').autocomplete({
        source: categories
    });
    
    if(event.key === 'Enter' || event.type === 'click'){
        findCategory(searchString.toLowerCase());
    }
}

function changeDropdownLabel(value){
    switch(value){
        case 0:
            document.getElementById('dropdownMenuButton').innerHTML = "Sort Alphabetically (A-Z)";
            sortAlphabeticalAscending();
            initializeButtons();
            break;
        case 1:
            document.getElementById('dropdownMenuButton').innerHTML = "Sort Alphabetically (Z-A)";
            sortAlphabeticalDescending();
            initializeButtons();
            break;
        case 2:
            document.getElementById('dropdownMenuButton').innerHTML = "Sort by Most Reported";
            sortByVotesDescending();
            initializeButtons();
            break;
    }
}

var tempCategories = [];

window.addEventListener("load", async () => {
    let isloaded = false;
    await getCategoriesData();
    tempCategories = categories;
    populateCategoryTable();
});

async function populateCategoryTable(){
    $('#categoryTable div').html("");

    let head =
        "<table id='example' class='table'>" +
        "<thead>" +
        "<tr id='flat-row'>" +
        "<th scope='col' class='table-header th-sm'>#</th>" +
        "<th scope='col' class='table-header th-sm'>カテゴリー名</th>" +
        "<th scope='col' class='table-header th-sm'>カテゴリーの説明</th>" +
        "<th class='table-header th-sm'>Actions</th>" +
        "</tr>" +
        "</thead>";

    let body = "<tbody>";

    tempCategories.forEach(function (category) {
        body += 
            "<tr class='report-row' id='flat-row'>" + 
            "<th scope='row' class='table-id'>" + category.id + "</th>" +
            "<td class='table-content'>" + category.name + "</td>" +
            "<td class='table-content'>" + category.description + "</td>" +
            "<td><button class='btn btn-row' onclick='deleteCategory(" + category.id + ")'><i class='fas fa-trash-alt'></i></button></td>" +
            "</tr>";
    });

    $("#categoryTable").append(head + body + "</tbody></table>");
    $('#example').DataTable();
}

async function deleteCategory(category_id){
    if(confirm('Delete category?')){
        db.collection("categories")
            .where("id", "==", category_id)
            .get()
            .then(async function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });
                if(!alert('Category Deletion Successful!')){
                    populateCategoryTable();
                }
            })
            .catch(function (error) {
                console.error("Error category deletion: ", error);
            });
    }
}
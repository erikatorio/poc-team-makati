var tempCategories = [];

window.addEventListener("load", async () => {
    let isloaded = false;
    await getCategoriesData();
    tempCategories = categories;
    populateCategoryTable();
    showPageCategory();
});

async function populateCategoryTable() {
    $('#categoryTable div').html("");

    let head =
        "<table id='example' class='table'>" +
        "<thead>" +
        "<tr id='flat-row'>" +
        "<th scope='col' class='table-header th-sm'>#</th>" +
        "<th scope='col' class='table-header th-sm'>カテゴリー名</th>" +
        "<th scope='col' class='table-header th-sm'>カテゴリーの説明</th>" +
        "<th class='table-header th-sm'>設定</th>" +
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
    $('#example').DataTable({
        scrollY: '40vh',
        responsive: true,
        columnDefs: [{ orderable: false, targets: 3 }]
    });
}

async function addCategory() {
    let category_name = $("input[name='category_name']").val();
    let category_desc = $("input[name='description']").val();

    let size = 0;

    await db.collection("categories")
        .get()
        .then(function (querySnapshot) {
            size = querySnapshot.docs.length;
        });

    db.collection("categories")
        .doc()
        .set({
            id: size,
            name: category_name,
            description: category_desc
        })
        .then(async function () {
            if (!alert('Successfully added!')) {
                $('#addNewUserModal').modal('hide');
                populateCategoryTable();
                setTimeout(location.reload(), 1500);
            }
        })
        .catch(function (error) {
            console.error("Error adding category: ", error);
        });
}

async function deleteCategory(category_id) {
    if (confirm('Delete category?')) {
        db.collection("categories")
            .where("id", "==", category_id)
            .get()
            .then(async function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });
                if (!alert('Category Deletion Successful!')) {
                    populateCategoryTable();
                    setTimeout(location.reload(), 1500);
                }
            })
            .catch(function (error) {
                console.error("Error category deletion: ", error);
            });
    }
}

//function to hide loader after Content has successfully loaded 
function showPageCategory() {
    console.log("test");
    document.getElementById("loader").style.display = "none";
}
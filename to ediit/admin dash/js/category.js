let categories = [];
window.addEventListener("load", async () => {
    isloaded = true;
    await showCategories();
    
    $('#categoriesTable').DataTable({
      dom: 'Bfrtip',
      scrollY: '40vh',
      buttons: ['csv', 'excel', 'pdf'],
      responsive: true,
      columnDefs: [{ orderable: false, targets: 2 }]
    });
    
    showCategories().then(() => {
        $('#categoriesTable').DataTable({
          dom: 'Bfrtip',
          scrollY: '40vh',
          buttons: ['csv', 'excel', 'pdf'],
          responsive: true,
          columnDefs: [{ orderable: false, targets: 2 }]
        });
    });
});

async function showCategories() {
    let tempCategories = [];

    await db
        .collection("categories")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                tempCategories.push(doc.data());
            });
        });

    $('#showCategoriesTable div').html("");
    
    categories.length = 0;
    categories = tempCategories.map(a => a.name);
    //Add body
    let head =
        "<table id='categoriesTable' class='display'>" +
        "<thead class='thead-inverse bg-custom text-custom'>" +
        "<tr>" +
        "<th style='width:25%;'>Category</th>" +
        "<th style='width:70%;'>Details</th>" +
        "<th style='width:5%;'>Actions</th>" +
        "</tr>" +
        "</thead>";

    let body = '<tbody class="scroll-secondary">';

    tempCategories.forEach(function (category) {
        body +=
            "<tr>" +
            "<td>" +
            category.name +
            "</td>" +
            "<td style='line-height: 1em;'>" +
            category.description +
            "</td>" +
            "<td class='d-flex'>" +
            "<div class='p-1 m-1 cursor-pointer'><a href='#' data-toggle='modal' data-target='#categoryModal' class='cursor-pointer' title='Edit' id='editCategory'" + category.id + " onclick='$(\"#categoryModalTitle, #categoryModalh3, #categoryModalButton\").text(\"Update Category\"); $(\"#catName\").val(`" + category.name + "`);$(\"#catDesc\").val(`" + category.description + "`);$(\"#categoryModalButton\").attr(\"onclick\", \"updateCategory(" + category.id + ")\"); '><i class='fas fa-edit'></i></a></div>" +
            "<div class='p-1 m-1 cursor-pointer'><a href='#' class='cursor-pointer' title='Delete' id='deleteCategory'" + category.id + " onClick='removeCategory(" + category.id + ")'><i class='fas fa-trash-alt'></i></a></div>" +
            "</td>" +
            "</tr>";
    });

    $("#showCategoriesTable").append(head + body + "</tbody></table>");
}

async function addCategory() {

    let name = document.getElementById("catName").value;
    let desc = document.getElementById("catDesc").value;
    document.getElementById("catName").value = "";
    document.getElementById("catDesc").value = "";

    if (name == "" || desc == "")
        return
    
    if (categories.includes(name)){
        PNotify.notice({
            title: "Category Already Exists!",
            delay: 2000,
            modules: {
                Buttons: {
                    closer: true,
                    closerHover: true,
                    sticker: false
                },
                Mobile: {
                    swipeDismiss: true,
                    styling: true
                }
            }
        });

        return;
    }
    
    let size = 0;

    await db.collection("ids").get().then(function (querySnapshot) {
        size = querySnapshot.docs[0].data().categoryID + 1;
        querySnapshot.forEach(function (doc) {
            let newID = doc.data().categoryID + 1
            db.collection("ids").doc(doc.id).update({
                categoryID: newID
            });
        });
    });

    db.collection("categories").doc().set({
        id: size,
        name: name,
        description: desc
    })
    .then(async function () {
        console.log("Document successfully written!");
        sessionStorage.removeItem("category");

        PNotify.success({
            title: "Successfully added Category",
            delay: 2000,
            modules: {
                Buttons: {
                    closer: true,
                    closerHover: true,
                    sticker: false
                },
                Mobile: {
                    swipeDismiss: true,
                    styling: true
                }
            }
        });

        showCategories().then(() => {
            $('#categoriesTable').DataTable({
              dom: 'Bfrtip',
              scrollY: '40vh',
              buttons: ['csv', 'excel', 'pdf'],
              responsive: true,
              columnDefs: [{ orderable: false, targets: 2 }]
            });
        });
        document.getElementById("catName").value = "";
        document.getElementById("catDesc").value = "";

    })
    .catch(function (error) {
        console.error("Error writing document: ", error);
    });

    $('#categoryModal').modal('hide');
}

async function updateCategory(value) {

    let newName = document.getElementById("catName").value;
    let newDesc = document.getElementById("catDesc").value;
    document.getElementById("catName").value = "";
    document.getElementById("catDesc").value = "";
    
    if (newName == "" || newDesc == "")
        return

    db.collection("categories")
        .where("id", "==", value)
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                doc.ref.update({
                    name: newName,
                    description: newDesc
                });
            });

            PNotify.success({
                title: "Update Successful!",
                delay: 2000,
                modules: {
                    Buttons: {
                        closer: true,
                        closerHover: true,
                        sticker: false
                    },
                    Mobile: {
                        swipeDismiss: true,
                        styling: true
                    }
                }
            });

            showCategories().then(() => {
                $('#categoriesTable').DataTable({
                  dom: 'Bfrtip',
                  scrollY: '40vh',
                  buttons: ['csv', 'excel', 'pdf'],
                  responsive: true,
                  columnDefs: [{ orderable: false, targets: 2 }]
                });
            });
            document.getElementById("catName").value = "";
            document.getElementById("catDesc").value = "";

        })
        .catch(function (error) {
            console.error("Error category update: ", error);
        });

    $('#categoryModal').modal('hide');
}

async function removeCategory(value) {
    const notice = PNotify.notice({
        title: "Delete Category",
        text: "Confirm Delete?",
        icon: "fas fa-question-circle",
        hide: false,
        modules: {
            Confirm: {
                confirm: true,
            },
            Buttons: {
                closer: true,
                closerHover: true,
                sticker: false
            },
            Desktop: {
                desktop: true,
                fallback: true,
                icon: null
            },
            Mobile: {
                swipeDismiss: true,
                styling: true
            }
        }
    });

    notice.on('pnotify.confirm', () => {
        db.collection("categories")
            .where("id", "==", value)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });

                PNotify.success({
                    title: "Delete Successful!",
                    delay: 2000,
                    modules: {
                        Buttons: {
                            closer: true,
                            closerHover: true,
                            sticker: false
                        },
                        Mobile: {
                            swipeDismiss: true,
                            styling: true
                        }
                    }
                });

                showCategories().then(() => {
                    $('#categoriesTable').DataTable({
                      dom: 'Bfrtip',
                      scrollY: '40vh',
                      buttons: ['csv', 'excel', 'pdf'],
                      responsive: true,
                      columnDefs: [{ orderable: false, targets: 2 }]
                    });
                });
            })
            .catch(function (error) {
                console.error("Error category deletion: ", error);
            });
    });

}
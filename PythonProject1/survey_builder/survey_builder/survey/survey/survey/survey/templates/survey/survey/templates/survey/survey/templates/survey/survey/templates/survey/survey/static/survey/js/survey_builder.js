$(function() {
    $("#question-list").sortable();
    $("#question-list").disableSelection();

    function renderPreview() {
        let html = "";
        $("#question-list li").each(function() {
            const type = $(this).data("type");
            const text = $(this).text();
            if (type === "text") {
                html += `<div class="mb-3"><label>${text}</label><input type="text" class="form-control"></div>`;
            } else if (type === "radio") {
                html += `<div class="mb-3"><label>${text}</label><div><input type="radio"> Option 1</div><div><input type="radio"> Option 2</div></div>`;
            } else if (type === "checkbox") {
                html += `<div class="mb-3"><label>${text}</label><div><input type="checkbox"> Option 1</div><div><input type="checkbox"> Option 2</div></div>`;
            }
        });
        $("#live-preview").html(html);
    }

    renderPreview();

    $("#add-question").click(function() {
        const text = prompt("Enter question text:");
        const type = prompt("Enter type (text/radio/checkbox):", "text");
        if (text) {
            $("#question-list").append(`<li class="list-group-item" data-type="${type}">${text}</li>`);
            renderPreview();
        }
    });

    $("#question-list").on("sortupdate", renderPreview);

    $("#save-questions").click(function() {
        const questions = [];
        $("#question-list li").each(function() {
            questions.push({
                text: $(this).text(),
                type: $(this).data("type")
            });
        });
        fetch(window.location.pathname + "save/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({questions})
        })
        .then(res => res.json())
        .then(data => alert(data.message));
    });
});

function get_theme(link) {
    $.ajax({
        url: link,
        method: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        headers: {"X-CSRFToken": "{{ csrf_token }}"},
        mode: 'same-origin' // Do not send CSRF token to another domain.
    }).done(function (result) {
        if (result['first_time'] === 'Y') {
            location.reload();
        }
    })
}

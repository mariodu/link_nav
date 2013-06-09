$ ->
  $("a[method='delete']").click (e)->
    e.preventDefault()
    $.ajax url: $(this).attr("href"), type: "delete", success: (result) ->
      location.href = result.refer_path
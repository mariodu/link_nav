class LoginAction

  constructor: ->
    @init()

  init: ->
    @notice = $ "#login .login_notice"

    @notice.css "opacity":0, "transition":"all 0.8s ease-out 0.5s","-moz-transition":"all 0.8s ease-out 0.5s","-webkit-transition":"all 0.8s ease-out 0.5s"

    @login_button = $ "#login-submit"
    @login_form = $ "#login-form"
    @login_url = "/user/login"
    @email = $ "#email input"
    @password = $ "#password input"

    @login_button.click (e) =>
      e.preventDefault()
      @disableButton()
      @loginProgress()

  disableButton: ->
    button = @login_button
    button.attr "disabled", "disabled"
    old_text = button.text()
    doing_text = button.data 'doing'
    button.data 'doing', old_text
    button.text doing_text

  showNotice: (text)->
    notice = @notice
    if notice.css("visibility") == "visible"
      return
    notice.text text
    notice.css "visibility", "visible"
    notice.css "opacity", 1

  hideNotice: ->
    notice = @notice
    if notice.css("visibility") == "hidden"
      return
    notice.css "visibility", "hidden"
    notice.css "opacity", 0
  enableButton: ->
    button = @login_button
    old_text = button.text()
    doing_text = button.data 'doing'
    button.data 'doing', old_text
    button.text doing_text
    button.removeAttr "disabled"
  loginProgress: ->
    form = $ @login_form
    data = form.serialize()
    url = @login_url
    if @simpleDatacheck()
      @loginRequest url, "post", data, (result) =>
        if parseInt(result.error_code) != 1
          if parseInt(result.error_code) == 109
            @showNotice result.error_info
            setTimeout ( => @redirectPath result.refer_path ), 1600
          else if parseInt(result.error_code) == 107
            @showNotice result.error_info
            @enableButton()
            @email.focus()
          else if parseInt(result.error_code) == 108
            @showNotice result.error_info
            @enableButton()
            @password.focus()
          else if parseInt(result.error_code) == 100
            @showNotice result.error_info
            @enableButton()
            @email.focus()
        else
          @showNotice result.error_info
          setTimeout ( => @redirectPath result.refer_path ), 1600

  simpleDatacheck: ->
    email = @email.val()
    password = @password.val()
    email_reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
    if email == ""
      @notice.text "Please fill email"
      @email.focus()
      @enableButton()
      return false
    else if !email_reg.test email
      @notice.text "Please correct format email"
      @email.focus()
      @enableButton()
      return false;
    if password == ""
      @notice.text "Please fill password"
      @password.focus()
      @enableButton()
      return false
    return true

  loginRequest: (url, type, data, callback) ->
    $.ajax url: url, type: type, data: data, dataType: "json", success: (result) ->
        if callback
          callback result

  redirectPath: (path) ->
    location.href = path;

loginaction = new LoginAction();
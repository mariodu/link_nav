CategoryCtrl = ($scope, $http) ->
  $http.get('/1/categories').success (data)->
    $scope.categories = data
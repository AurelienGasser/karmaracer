(function(){
  "use strict";

  var loading = function(){
    // var that = {};
    // that.$loadingInfo = $('#loadingInfo');

    function append(text){
      $('#loadingInfo').append(text + '<br/>');
    }

    function remove () {
     $('#loadingInfo').remove();
     $('#loadingImage').fadeOut(function(){
      $(this).remove();
     });
    }

    return {
      append : append,
      remove :remove
    };
  }();

  Karma.Loading = loading;

}(Karma || {}));
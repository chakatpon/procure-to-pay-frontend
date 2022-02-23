window.onload = function() {
  //console.log(document.width);
  //if (document.width < 1024) {
      var mvp = document.getElementById('vp');
      mvp.setAttribute('content','user-scalable=no,width=1024');
  //}
}
window.onresize = function() {
  if (window.width < 1024) {
      var mvp = document.getElementById('vp');
      mvp.setAttribute('content','user-scalable=no,width=1024');
  }
}

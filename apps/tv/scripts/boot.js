// Wait for the bundled TV-only player service before rendering the UI.
(() => {
  var attempts = 0;
  var requested = false;
  var finished = false;
  var scriptUrl = document.currentScript.getAttribute('data-app-script');
  function showError(message) {
    finished = true;
    document.getElementById('zoff-startup').textContent =
      'Zoff could not start its local player. ' + message;
  }
  function startApp() {
    if (finished) return;
    finished = true;
    var script = document.createElement('script');
    script.src = scriptUrl;
    script.onerror = () => {
      showError('The application script could not load.');
    };
    document.head.appendChild(script);
  }
  function retry() {
    if (finished) return;
    attempts += 1;
    if (attempts > 40) return showError('Restart Zoff to try again.');
    if (!requested) {
      requested = true;
      if (typeof tizen === 'undefined')
        return showError('The Samsung TV runtime is unavailable.');
      tizen.application.launchAppControl(
        new tizen.ApplicationControl(
          'http://tizen.org/appcontrol/operation/service',
        ),
        'ZoffMusic0.PlayerService',
        () => {},
        (error) => {
          showError(error.message);
        },
      );
    }
    setTimeout(check, 300);
  }
  function check() {
    if (finished) return;
    var request = new XMLHttpRequest();
    request.open('GET', 'http://127.0.0.1:34771/health');
    request.timeout = 1500;
    request.onload = () => {
      if (
        request.status === 200 &&
        request.responseText === 'Zoff player ready'
      )
        startApp();
      else retry();
    };
    request.onerror = retry;
    request.ontimeout = retry;
    request.send();
  }
  check();
})();

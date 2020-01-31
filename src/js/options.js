debug = true;

function getBrowser(){

    var sBrowser, sUsrAg = navigator.userAgent;

    if(sUsrAg.indexOf("Chrome") > -1) {
        return browser = new ChromePromise();
    }

    //  else if (sUsrAg.indexOf("Safari") > -1) {
    //     sBrowser = "Apple Safari";
    // } else if (sUsrAg.indexOf("Opera") > -1) {
    //     sBrowser = "Opera";
    // } else if (sUsrAg.indexOf("Firefox") > -1) {
    //     sBrowser = "Mozilla Firefox";
    // } else if (sUsrAg.indexOf("MSIE") > -1) {
    //     sBrowser = "Microsoft Internet Explorer";
    // }

    return browser;
}

browser = getBrowser();

// saves form settings
document.querySelector('#saveFreedomMarksSettings').addEventListener('click', () => {

    if(debug) console.log('Save button has been clicked');

    browser.storage.local.set({

        freedommarks_settings: {
            server_url: document.getElementById('server_url').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            bookmark_main_tab: document.getElementById('bookmark_main_tab').checked,
            search_main_tab: document.getElementById('search_main_tab').checked,
        }

    }).then(function(result) {
        if(debug) console.log('Settings have been saved');
        var notification_area = document.getElementById('settings_notification_area');
        notification_area.textContent='Settings have been saved';
        notification_area.className = "boxed success";
        notification_area.style.display = 'block';
        setTimeout(function(){
            notification_area.style.display = 'none';
        }, 2*1000);
    });

});

// On load, retrieves the settings from local storage.
// If local storage is empty, default settings will be used
browser.storage.local.get('freedommarks_settings').then(function(result) {

    //default values
    document.getElementById('server_url').placeholder = 'https://127.0.0.1:80';
    document.getElementById('username').placeholder = 'username';
    document.getElementById('password').placeholder = 'strong-password';
    document.getElementById('bookmark_main_tab').checked = true;
    document.getElementById('search_main_tab').checked = false;

    var settings = result.freedommarks_settings;

    if(settings.server_url){
      document.getElementById('server_url').value = settings.server_url;
    }

    if(settings.username) {
      document.getElementById('username').value = settings.username;
    }

    if(settings.password) {
      document.getElementById('password').value = settings.password;
    }

    if(settings.bookmark_main_tab) {
        document.getElementById('bookmark_main_tab').checked = true;
    }

    if(settings.search_main_tab) {
        document.getElementById('search_main_tab').checked = true;
    }

    if(debug) console.log('local storage settings: ' + JSON.stringify(settings));
});

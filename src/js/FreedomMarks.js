debug = true;

jQuery.support.cors = true;

document.addEventListener("DOMContentLoaded", function(event) {

    if(debug) console.log("DOM fully loaded and parsed");

    var sUsrAg = navigator.userAgent;

    if(typeof sUsrAg.indexOf !== 'undefined' && sUsrAg.indexOf("Chrome") > -1) {
        browser = new ChromePromise();
    }

    // retrieves settings from local storage
    browser.storage.local.get('freedommarks_settings').then(function(result) {

        var settings = result.freedommarks_settings;

        if(!settings.server_url) {
            addNotification('error','Please set the Options for this extension');
            return false;
        }

        server_url = settings.server_url;
        username = settings.username;
        password = settings.password;

    });

    // TODO
    // I want to search for the URL in the database before filling in the form
    // but Nextcloud Bookmarks API does not supports this kind of query yet
    //
    // CurrentBrowserTab(searchForCurrentUrl);
    //
    // Therefore, for now, I replace it with this
    CurrentBrowserTab(fillForm);

    // when a tab-pane gets activated ...
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        // closes the notification area
        $('#notification-area').hide();

        // when necessary, it focuses the "search-tags" input box
        e.preventDefault();
        var target = $(e.target).attr("href"); // activated tab's ID
        if (target == '#search-bookmarks-tab') {
            if(debug) console.log('second tab has been activated');
            $('#search-terms').focus();
        }
    });


    //Searches for tags when the user hits enter and one the search-bookmarks-tab input fields has focus
    $('#search-tags').keypress(function (e) {
        var key = e.which;
        // the enter key code
        if(key == 13) {
            searchByTermsOrTags();
            e.preventDefault();
            $('#search-bookmarks-tab').show();
        }
    });
    $('#search-terms').keypress(function (e) {
        var key = e.which;
        // the enter key code
        if(key == 13) {
            searchByTermsOrTags();
            e.preventDefault();
            $('#search-bookmarks-tab').show();
        }
    });

    $('#search-by-tags-button').click(function (e) {
        searchByTermsOrTags();
    });

    $('#save-bookmark-button').click(function (e) {
        saveBookmark();
    });

    $('#delete-bookmark-button').click(function (e) {
        deleteBookmark(e);
    });
});


// function getBrowser(){

//     if(debug) console.log(navigator);

    //var sBrowser, sUsrAg = navigator.userAgent;

    //  else if (sUsrAg.indexOf("Safari") > -1) {
    //     sBrowser = "Apple Safari";
    // } else if (sUsrAg.indexOf("Opera") > -1) {
    //     sBrowser = "Opera";
    // } else if (sUsrAg.indexOf("Firefox") > -1) {
    //     sBrowser = "Mozilla Firefox";
    // } else if (sUsrAg.indexOf("MSIE") > -1) {
    //     sBrowser = "Microsoft Internet Explorer";
    // }

    //return browser;
// }



function testCorsEnabled(url){
    if(debug) console.log('function: ' + arguments.callee.name);

    $.get( url, function( data, textStatus, request) {
        var header = request.getResponseHeader('access-control-allow-origin');

        if(typeof header !== 'undefined') {
             console.log('CORS is not enabled for url: ' + url);
        } else {
            console.log('CORS is enabled for url: ' + url);
            console.log(header);
        }
    });
}

function getTagsArrayFromElement(element_id){
    var input_tags = $('#'+element_id).val().split(',');
    var tags = [];
    for (let tag of input_tags) {
        var trimmed_tag = tag.trim();
        if (trimmed_tag) {
            tags.push(trimmed_tag);
        }
    }
    tags.push(" ");
    return tags;
}

function CurrentBrowserTab(callback) {
    if(debug) console.log('function: ' + arguments.callee.name);
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    var browserTab = chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var browserTab = {
            url: tab.url,
            title: tab.title
        }
        callback(browserTab);
    });
}

function fillForm(browserTab){
    if(debug) console.log('function: ' + arguments.callee.name);
    // This fills in the hidden form field "bookmark-url" with tab's URL
    document.getElementById("bookmark-url").value = browserTab.url;
    //This ifills in the bookmark title with the page title of the current tab
    document.getElementById("bookmark-title").value = browserTab.title;
}

function saveBookmark(){

    var endpoint = server_url + '/index.php/apps/bookmarks/public/rest/v2/bookmark';

    if(debug) console.log('endpoint: ' + endpoint);

    //trim and replace trailing slash
    var bookmarkurl = $('#bookmark-url').val().trim().replace(/\/$/, "");
    if(debug) console.log('bookmarkurl: ' + bookmarkurl);

    $.ajax({
        url: endpoint,
        method: "POST",
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },
        data: {
            url: bookmarkurl,
            title: $('#bookmark-title').val(),
            description: $('#bookmark-description').val(),
            item: getTagsArrayFromElement('bookmark-tags'),
            is_public: true
        },
        dataType: 'json',
    })
    .success(function(result){
        var bookmark = result.item;
        if(bookmark.id){
            $('#save-bookmark-button').hide();
            $('#delete-bookmark-button').show();
            $('#bookmark-id').val(bookmark.id);
            addNotification('success','Bookmark saved!');
        } else {
            addNotification('error','Bookmark not saved. Please check your settings.');
        }
    });

}

function searchByTermsOrTags(){

    if(debug) console.log('function: ' + arguments.callee.name);
    if(debug) console.log('server_url: ' + server_url);
    if(debug) console.log('username: ' + username);
    if(debug) console.log('password: ' + password);

    var endpoint = server_url + '/index.php/apps/bookmarks/public/rest/v2/bookmark';

    var terms = getTagsArrayFromElement('search-terms');
    var tags = getTagsArrayFromElement('search-tags');
    var conjunction = $("input[name='conjunction']:checked"). val();

    searchBookmarks(endpoint, terms, tags, conjunction);
}


function searchBookmarks(endpoint, terms, tags, conjunction){

    if(debug) console.log('function: ' + arguments.callee.name);
    if(debug) testCorsEnabled(endpoint);

    var select = ['id','url','title','tags', 'description', 'lastmodified'];
    if(terms.length == 0) {
        var terms = "";
    }
    $.ajax({
        url: endpoint,
        method: "GET",
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },
        data: {
            search: terms,
            tags: tags,
            conjunction: conjunction,
            page: -1
        },
        dataType: 'json',
    })
    .success(function(result){

        if(debug) console.log('success');
        if(debug) console.log(result);

        if(result.status == 'error'){
            addNotification('Server Error',result.message);
        } else {
            var bookmarks = result.data;
            if(debug) console.log(bookmarks);
            makeBookmarksList(bookmarks, 'bookmarks-list');
        }
    })
    .error(function(XMLHttpRequest, status, errorThrown){
        if(debug) {
            console.log('ajax error');
            console.log("Status: " + status);
            console.log("Error: " + errorThrown);
        }
    })
    .complete(function(jqXHR, textStatus){
        if(debug) {
            console.log('ajax completed');
            console.log(jqXHR);
            console.log(textStatus);
        }
    });
}


function deleteBookmark(e, bookmarkId){

    if(debug) console.log('function: ' + arguments.callee.name);

    if(!bookmarkId && $('#bookmark-id').val().length == 0) {
        if(debug) console.log('no bookmark id found');
        return false;
    }

    if(!bookmarkId){
        bookmarkId = $('#bookmark-id').val();
    }


    // TODO this doesn't work as expected on FF because it closes the extension tab
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/User_interface_components#Popups
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
    if (!window.confirm("Do you really want to delete this bookmark?")) {
        e.preventDefault();
        return false;
    }

    var endpoint = server_url + '/index.php/apps/bookmarks/public/rest/v2/bookmark/' + bookmarkId;

    $.ajax({
        method: "DELETE",
        url: endpoint,
        //basic authentication
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },
        data: {
            id: bookmarkId
        },
        dataType: 'json'
    })
    .success(function(result){
        $('#bookmark-' + bookmarkId).hide(); //this hides the deleted bookmark from the bookmark list
        CurrentBrowserTab(fillForm);
        $('#delete-bookmark-button').hide();
        $('#save-bookmark-button').text("Add");
        $('#save-bookmark-button').show();
        addNotification('success','bookmark deleted');
    });
    //TODO handle failure

}

function addNotification(type,message){
    if(debug) console.log('function: ' + arguments.callee.name);

    var div = document.getElementById('notification-area');
    //div.innerHTML = "";

    var p = document.createElement("p");
    p.textContent = message;
    if(type == "success"){
        p.className = "notify";
    }
    if(type == "error") {
        p.className = "alarm";
    }
    div.appendChild(p);
    $('#notification-area').show(0).delay(2500).hide(0);
}

























// This is for the keyboard shortcuts (see maniifesto for more information)
/*chrome.commands.onCommand.addListener(function(command) {
        console.log('Command:', command);
        if(command == "quickly-add-bookmark"){
            console.log('add current tab as bookmark');
            lastBookmarks();
       }
});*/

// function getInfo(browserTab){
//     console.log(browserTab);
//     $('#bookmark-url').val(browserTab.url);
//     $('#bookmark-title').val(browserTab.title);
// }

//

// function searchForCurrentUrl(browserTab){

//     browser.storage.local.get(['serverURL', 'username', 'password'], function (result) {
//         //TODO watch out: after fresh install, before saving the options, "result" could be empty

//         // In any case fills in the hidden form field "bookmark-url" with tab's URL
//         document.getElementById("bookmark-url").value = browserTab.url;

//         var endpoint = result.serverURL + '/bookmark/search-by-url';

//         $.ajax({
//             method: "GET",
//             url: endpoint,
//             data: {
//                 userid: '1234567890',
//                 url: browserTab.url
//             },
//             dataType: 'json',
//         })
//         .done(function(bookmark){
//             if (bookmark ) {
//                 $('#bookmark-additional-info').show();
//                 $('#bookmark-id').val(bookmark.id);
//                 $('#bookmark-title').val(bookmark.title);
//                 $('#bookmark-tags').val(bookmark.tags);
//                 $('#bookmark-note').val(bookmark.note);
//                 $('#bookmark-title').val(bookmark.title);
//                 $('#bookmark-created_at').text(bookmark.created_at);
//                 $('#bookmark-updated_at').val(bookmark.updated_at);

//                 //buttons
//                 $('#save-bookmark-button').show();
//                 $('#save-bookmark-button').text("Update");
//                 $('#delete-bookmark-button').show();

//             } else {
//                 $('#bookmark-title').val(browserTab.title);
//             }
//         });

//     });
// }
debug = true;

jQuery.support.cors = true;

document.addEventListener("DOMContentLoaded", function(event) {
    
    if(debug) console.log("DOM fully loaded and parsed");

    browser = getBrowser();

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
            if(debug) console.log('second tab activated');
            $('#search-tags').focus();
        }
    });


    //Searches for tags when the user hits enter and the search-bookmarks-tab input field has focus
    $('#search-tags').keypress(function (e) {
        var key = e.which;
        // the enter key code
        if(key == 13) {
            searchByTags();
            e.preventDefault();
            $('#search-bookmarks-tab').show();
        }
    });   

    $('#search-by-tags-button').click(function (e) {
        searchByTags();
    });

    $('#save-bookmark-button').click(function (e) {
        saveBookmark();
    });

    $('#delete-bookmark-button').click(function (e) {
        deleteBookmark(e);
    });
});



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



function testCorsEnabled(url){
    $.get( url, function( data, textStatus, request) {
        var header = request.getResponseHeader('access-control-allow-origin');

        if(typeof header !== 'undefined') {
             console.log('CORS is not enabled for url: ' + url);
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
    return tags;
}

function CurrentBrowserTab(callback) {
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
    // This fills in the hidden form field "bookmark-url" with tab's URL
    document.getElementById("bookmark-url").value = browserTab.url;
    //This ifills in the bookmark title with the page title of the current tab
    document.getElementById("bookmark-title").value = browserTab.title;
}

function saveBookmark(){

    var endpoint = server_url + '/index.php/apps/bookmarks/public/rest/v1/bookmark';
    var tags = $('#bookmark-tags').val().split(',')

    $.ajax({
        url: endpoint,
        method: "POST",
        // Uncomment this when you remeove @Public from controller
        // beforeSend: function (xhr) {
        //     xhr.setRequestHeader('Authorization', 'Basic ' + btoa(result.username + ':' + result.password));
        // },
        data: {
            url: $('#bookmark-url').val(),
            title: $('#bookmark-title').val(),
            description: $('#bookmark-description').val(),
            tags: getTagsArrayFromElement('bookmark-tags'),
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

function searchByTags(){

    if(debug) console.log('server_url: ' + server_url);
    if(debug) console.log('username: ' + username);
    if(debug) console.log('password: ' + password);

    var endpoint = server_url + '/index.php/apps/bookmarks/public/rest/v1/bookmark';
    var tags = getTagsArrayFromElement('search-tags');
    var conjunction = $("input[name='conjunction']:checked"). val();

    searchBookmarks(endpoint, tags, conjunction);
}


function searchBookmarks(endpoint, tags, conjunction){

    if(debug) testCorsEnabled(endpoint);

    var select = ['id','url','title','tags', 'description'];

    $.ajax({
        url: endpoint,
        method: "GET",
        // This is not necessary because it's @PublicPage
        // beforeSend: function (xhr) {
        //     xhr.setRequestHeader('Authorization', 'Basic ' + btoa(user + ':' + password));
        // },
        data: {
            user: username,
            password: password,
            select: select,
            tags: tags,
            conjunction: conjunction
        },
        dataType: 'json',
    })
    .success(function(result){
        if(result.status == 'error'){
            addNotification('error',result.message);
        } else {
            var bookmarks = result;
            makeBookmarksList(bookmarks, 'bookmarks-list');
        }   
    })
    .error(function(XMLHttpRequest, status, errorThrown){
        console.log('ajax error');
        if(debug) {
            console.log("Status: " + status);
            console.log("Error: " + errorThrown);
        }
    });
}


function deleteBookmark(e, bookmarkId){

    if(!bookmarkId && $('#bookmark-id').val().length == 0) {
        console.log('no bookmark id found');
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

    var endpoint = server_url + '/index.php/apps/bookmarks/public/rest/v1/bookmark/' + bookmarkId;

    $.ajax({
        method: "DELETE",
        url: endpoint,
        data: {
            id: bookmarkId
        },
        dataType: 'json'
    })
    .success(function(result){
        /* TODO these don't work
        $('#bookmark-id').empty();
        $('#bookmark-tags').empty();
        $('#bookmark-description').empty();
        $('#bookmark-additional-info').hide();
        */
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
    var div = document.getElementById('notification-area');
    div.innerHTML = "";

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
/* @damko 
 * I'm not using Jquery here because it looks neater to me like this 
 */
function makeBookmarksList(bookmarks, div_id){

    console.log(bookmarks);

    var bookmarks_html_list = document.getElementById(div_id);;
    bookmarks_html_list.innerHTML = "";

    if(bookmarks.length > 0) {
        var h3 = document.createElement("h3");
        h3.textContent = 'Bookmarks';
        var subtitle = document.createElement("span");
        subtitle.className = "subtitle";
        subtitle.textContent = '(max 10 items)';
        h3.appendChild(subtitle);
        bookmarks_html_list.appendChild(h3);

        var hr = document.createElement("hr");
        bookmarks_html_list.appendChild(hr);
    }

    var ul = document.createElement("ul");
    ul.className = "bookmarks-list";

    for (let bookmark of bookmarks) {
        var li = document.createElement("li");
        li.setAttribute("id", "bookmark-" +  bookmark.id);

        var a = document.createElement("a");
        a.href = bookmark.url;
        a.title = bookmark.url;
        a.target = "_blank";
        a.textContent = bookmark.title;

        var div = document.createElement("div");
        div.className = "bookmark-title";
        div.appendChild(a);
        li.appendChild(div);

        var div = document.createElement("div");
        div.className = "bookmark-url";
        div.textContent = bookmark.url;
        li.appendChild(div);

        var div = document.createElement("div");
        div.className = "bookmark-description";
        div.textContent = bookmark.description;
        li.appendChild(div);


        // Tags
        if(bookmark.tags){
            var tag_ul = document.createElement("ul");
            tag_ul.className = "tags-list";
            var tags = bookmark.tags;
            for (let tag of tags) {
                if (! tag) break;
                var tag_li = document.createElement("li");
                tag_li.className = "btn-group btn-group-xs";
                var tag_button = document.createElement("button");
                tag_button.className = "btn btn-primary";
                tag_button.textContent = tag.trim();
                tag_button.addEventListener('click', myFunc, false);
                tag_button.myParam = tag.trim();;
                function myFunc(e){
                    document.getElementById("search-tags").value = e.target.myParam;
                    searchByTags()
                }
                tag_li.appendChild(tag_button);
                tag_ul.appendChild(tag_li);
            }
            li.appendChild(tag_ul);

            var delete_button = document.createElement("button");
            delete_button.className = "btn btn-danger";
            delete_button.textContent = "Delete";
            delete_button.addEventListener('click', myFunc, false);
            delete_button.myParam = bookmark.id;
            function myFunc(e){
                e.preventDefault();
                deleteBookmark(e, e.target.myParam);
            }

            var div = document.createElement("div");
            div.className = "btn-group btn-group-xs right";
            div.appendChild(delete_button);
            li.appendChild(div);
 
            var div = document.createElement("div");
            div.className = "clear";
            li.appendChild(div);
        }

        ul.appendChild(li);
        bookmarks_html_list.appendChild(ul);
    }

    return bookmarks_html_list;
}

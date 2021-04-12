// ---- Define your dialogs  and panels here ----
$('#sidepanel').append(`<h2 id="paneltitle"><h2>`);
$('#sidepanel h2').css('padding-left', '10px');
$('#sidepanel h2').css('padding-top', '10px');
let ep1 = define_new_effective_permissions('ep1', true);
let usf1 = define_new_user_select_field('usf1', 'Select User', function(selected_user) {
    ep1.attr('username', selected_user);
    $('.perm_info').show();
});
$('#sidepanel').append(usf1);
$('#sidepanel').append(ep1);
let d1 = define_new_dialog('d1', 'Permission Source');
$('.perm_info').click(function(){
    let explanation = allow_user_action(path_to_file[$('#ep1').attr('filepath')], all_users[$('#ep1').attr('username')], $(this).attr('permission_name'), true)
    d1.html(get_explanation_text(explanation));
    d1.dialog('open');
});
$('.perm_info').hide();
$('#sidepanel').hide();


// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    Edit
                </button>
                <button class="ui-button ui-widget ui-corner-all viewbutton" path="${file_hash}" id="${file_hash}_viewbutton">
                    View Permissions
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                Edit
            </button>
            <button class="ui-button ui-widget ui-corner-all viewbutton" path="${file_hash}" id="${file_hash}_viewbutton">
                View Permissions
            </button>
        </div>`)
    }
}
{/* <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/>  */}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


$('.viewbutton').click( function( e ) {
    let path = e.currentTarget.getAttribute('path');
    ep1.attr('filepath', path);
    $('#paneltitle').text(`Effective Permissions for ${$(this).attr('path')}`);
    $('#sidepanel').show();

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});

// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 

// $('.permbutton').html('Edit Permissions');
$(document).ready(function() {

    $('[data-toggle="tooltip"]').tooltip();

    var user_name = $.trim($('#user_email').text()),
        group_name = $.trim($("#group-name").text()),
        member = $.trim($(".member").text()) == "Member",
        admin = $.trim($(".admin").text()) == "Owner",
        mod = $.trim($(".mod").text()) == "Mod",
        mod_can_edit = $.trim($('#mod-can-edit').text()) == 'True';
        btn_edit_group_info = $("#btn-edit-group-info"),
        btn_edit_settings = $("#btn-edit-settings"),
        btn_add_members = $("#btn-add-members"),
        btn_subscribe_group = $("#btn-subscribe-group"),
        btn_unsubscribe_group = $("#btn-unsubscribe-group"),
        btn_delete_members = $("#btn-del-members"),
        btn_set_admin = $("#btn-set-admin"),
        btn_set_mod = $("#btn-set-mod"),
        btn_add_list = $('#btn-add-list'),
        action_select = $('#actionSelect'),
        btn_delete_group = $("#btn-delete-group"),
        activate_btn = $('#activate-btn'),
        btn_add_whitelist = $('#btn-add-whitelist'),
        btn_add_blacklist = $('#btn-add-blacklist'),
        btn_delete_whitelist = $('#btn-del-whitelist'),
        btn_delete_blacklist = $('#btn-del-blacklist');


    var admin_buttons = [btn_add_members, btn_edit_group_info, btn_set_admin, btn_set_mod,
        btn_delete_members, btn_add_list, action_select, btn_delete_group
    ];

    if (admin) {
        var members_table = $('#members-table').dataTable({
                "aoColumns": [{
                    'bSortable': false
                }, null, null, null, null]
            });

    } else {
        var members_table = $('#members-table').dataTable({});
    }

    if (admin || mod && mod_can_edit) {
        var whitelist_table = $('#whitelist-table').dataTable({
            "aoColumns": [{
                'bSortable': false
            }, null, null]
        }),

        blacklist_table = $('#blacklist-table').dataTable({
            "aoColumns": [{
                'bSortable': false
            }, null, null]
        });
    } else {
        var whitelist_table = $('#whitelist-table').dataTable({}),
            blacklist_table = $('#blacklist-table').dataTable({});
    }

    delete_group =
        function(params) {
            warningMessage = "Are you sure? This will delete the squad and all stored emails associated with it."
            var confirmation = confirm(warningMessage);
            if (confirmation) {
                $.post('/delete_group', params,
                    function(res) {
                        notify(res, true);
                        setTimeout(function() {
                            window.location = '/';
                        }, 400);
                    });
            }
        }

    activate_btn.click(function() {

        var params = {
                'group_name': group_name
            },
            post_to = ($(this)[0].innerHTML == 'Activate') ? '/activate_group' : '/deactivate_group';

        $.post(post_to, params, function(res) {
            notify(res, true);
            if (res.status) {
                setTimeout(function() {
                        window.location.reload();
                    },
                    400);
            }
        });
    });

    var post_edit_members = function(params) {
        $.post('/edit_members', params, function(res) {
            notify(res, true);
            setTimeout(function() {
                window.location.reload();
            }, 400);
        });
    };

    var post_unwhitelist_unblacklist = function(params) {
        $.post('/unblacklist_unwhitelist', params, function(res) {
            notify(res, true);
            setTimeout(function() {
                window.location.reload();
            }, 400);
        });
    };

    var edit_lists_adjust_can_post = function(selected, can_post) {
        var params = {
            'group_name': group_name,
            'lists': selected,
            'can_post': can_post
        };
        $.post('/adjust_list_can_post', params, function(res) {
            notify(res, true);
            setTimeout(function() {
                window.location.reload();
            }, 400);
        });
    }

    var edit_lists_adjust_can_receive = function(selected, can_receive) {
        var params = {
            'group_name': group_name,
            'lists': selected,
            'can_receive': can_receive
        };
        $.post('/adjust_list_can_receive', params, function(res) {
            notify(res, true);
            setTimeout(function() {
                window.location.reload();
            }, 400);
        });
    }

    var edit_lists_delete = function(selected) {
        var params = {
            'group_name': group_name,
            'lists': selected
        };
        $.post('/delete_list', params, function(res) {
            notify(res, true);
            setTimeout(function() {
                window.location.reload();
            }, 400);
        });
    }

    // attach handlers to buttons 
    btn_add_members.click(function() {
        go_to('add_members');
    });

    btn_add_whitelist.click(function() {
        go_to('add_whitelist');
    });

    btn_add_blacklist.click(function() {
        go_to('add_blacklist');
    })

    btn_edit_settings.click(function() {
        go_to('edit_my_settings');
    });

    btn_edit_group_info.click(function() {
        go_to('edit_group_info');
    });

    btn_add_list.click(function() {
        go_to('add_list');
    });

    function post_edit_members(params) {
        $.post('/edit_members', params,
            function(res) {
                notify(res, true);
                setTimeout(function() {
                    window.location.reload();
                }, 400);
            }
        );
    }

    btn_unsubscribe_group.click(function() {
        var params = {
            'group_name': group_name
        };
        $.post('/unsubscribe_group', params, function(res) {
            if (res.status) {
                member = false;
                fix_visibility();
                $(".member").hide();
                var aPos = members_table.fnGetPosition($(".my_row").get(0));
                members_table.fnDeleteRow(aPos);
            }
            notify(res, true);
        });
    });

    btn_delete_group.click(function() {
        delete_group({
            'group_name': group_name
        });
    });


    btn_delete_members.click(function() {
        if (confirm("Are you sure you want to delete the selected users?")) {
            var params = {
                'group_name': group_name,
                'toAdmin': '',
                'toMod': '',
                'toDelete': get_selected('user').join(',')
            };
            post_edit_members(params);
        }
    });

    btn_delete_blacklist.click(function() {
        if (confirm("Are you sure you want to delete the selected email addresses from your blacklist?")) {
            var params = {
                'group_name': group_name,
                'senders': get_selected('blacklist').join(','),
            };

            post_unwhitelist_unblacklist(params);
        }
    });

    btn_delete_whitelist.click(function() {
        if (confirm("Are you sure you want to delete the selected email addresses from your whitelist?")) {
            var params = {
                'group_name': group_name,
                'senders': get_selected('whitelist').join(','),
            };

            post_unwhitelist_unblacklist(params);
        }
    });

    btn_set_mod.click(function() {
        var params = {
            'group_name': group_name,
            'toAdmin': '',
            'toMod': get_selected('user').join(','),
            'toDelete': ''
        };
        post_edit_members(params);
    });

    btn_set_admin.click(function() {
        var params = {
            'group_name': group_name,
            'toAdmin': get_selected('user').join(','),
            'toMod': '',
            'toDelete': ''
        };
        post_edit_members(params);
    });

    action_select.change(function() {
        var selected = get_selected('list');

        if (selected.length == 0) {
            alert("You must select one or more lists to perform this action on");
            $(this).val('label');
            return;
        }
        selected = selected.join(',');
        var value = $(this).val();
        if (value == 'deleteList') {
            if (confirm("Are you sure you want to delete the selected lists?")) {
                edit_lists_delete(selected);
            } else {
                $(this).setVal("label");
            }
        } else if (value == 'addPost') {
            edit_lists_adjust_can_post(selected, true);
        } else if (value == 'addReceive') {
            edit_lists_adjust_can_receive(selected, true);
        } else if (value == 'removePost') {
            edit_lists_adjust_can_post(selected, false);
        } else if (value == 'removeReceive') {
            edit_lists_adjust_can_receive(selected, false);
        }
    });


    // etc
    function fix_visibility() {
        if (admin) {
            admin_buttons.forEach(function(b) {
                b.show();
            });
        } else {
            admin_buttons.forEach(function(b) {
                b.hide();
            });
        }
        if (member) {
            btn_unsubscribe_group.show();
            btn_subscribe_group.hide();
        } else {
            btn_unsubscribe_group.hide();
            btn_subscribe_group.show();
        }
    }

    function get_selected(typeString) {
        var className = '.checkbox-' + typeString;
        var lists = [];
        $(className).each(function() {
            if (this.checked) lists.push(this.id);
        });
        return lists;
    }

    function go_to(page) {
        window.location = '/groups/' + group_name + '/' + page;
    }

});
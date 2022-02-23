"use strict";

// Initialization
KTUtil.ready(function() {
    ////////////////////////////////////////////////////
    // Layout Base Partials(mandatory for core layout)//
    ////////////////////////////////////////////////////

    // Init Desktop & Mobile Headers
    if (typeof KTLayoutHeader !== 'undefined') {
        KTLayoutHeader.init('bbl_header', 'bbl_header_mobile');
    }

    // Init Header Menu

    if (typeof KTLayoutHeaderMenu !== 'undefined') {
        KTLayoutHeaderMenu.init('bbl_header_menu', 'bbl_header_navs');
    }else{

    }

    // Init Header Topbar For Mobile Mode
    if (typeof KTLayoutHeaderTopbar !== 'undefined') {
        KTLayoutHeaderTopbar.init('bbl_header_mobile_topbar_toggle');
    }

    // Init Brand Panel For Logo
    if (typeof KTLayoutBrand !== 'undefined') {
        KTLayoutBrand.init('bbl_brand');
    }

    // Init Aside
    if (typeof KTLayoutAside !== 'undefined') {
        KTLayoutAside.init('bbl_aside');
    }

    // Init Aside Menu Toggle
    if (typeof KTLayoutAsideToggle !== 'undefined') {
        KTLayoutAsideToggle.init('bbl_aside_toggle');
    }

    // Init Aside Menu
    if (typeof KTLayoutAsideMenu !== 'undefined') {
        KTLayoutAsideMenu.init('bbl_aside_menu');
    }

    // Init Subheader
    if (typeof KTLayoutSubheader !== 'undefined') {
        KTLayoutSubheader.init('bbl_subheader');
    }

    // Init Content
    if (typeof KTLayoutContent !== 'undefined') {
        KTLayoutContent.init('bbl_content');
    }

    // Init Footer
    if (typeof KTLayoutFooter !== 'undefined') {
        KTLayoutFooter.init('bbl_footer');
    }


    //////////////////////////////////////////////
    // Layout Extended Partials(optional to use)//
    //////////////////////////////////////////////

    // Init Scrolltop
    if (typeof KTLayoutScrolltop !== 'undefined') {
        KTLayoutScrolltop.init('bbl_scrolltop');
    }

    // Init Sticky Card
    if (typeof KTLayoutStickyCard !== 'undefined') {
        KTLayoutStickyCard.init('bbl_page_sticky_card');
    }

    // Init Stretched Card
    if (typeof KTLayoutStretchedCard !== 'undefined') {
        KTLayoutStretchedCard.init('bbl_page_stretched_card');
    }

    // Init Code Highlighter & Preview Blocks(used to demonstrate the theme features)
    if (typeof KTLayoutExamples !== 'undefined') {
        KTLayoutExamples.init();
    }

    // Init Quick Notifications Offcanvas Panel
    if (typeof KTLayoutQuickNotifications !== 'undefined') {
        KTLayoutQuickNotifications.init('bbl_quick_notifications');
    }

    // Init Quick Offcanvas Panel
    if (typeof KTLayoutQuickPanel!== 'undefined') {
        KTLayoutQuickPanel.init('bbl_quick_panel');
    }

    // Init Quick User Panel
    if (typeof KTLayoutQuickUser !== 'undefined') {
        KTLayoutQuickUser.init('bbl_quick_user');
    }
});

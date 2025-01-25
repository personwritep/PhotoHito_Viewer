// ==UserScript==
// @name        PhotoHito Viewer
// @namespace        http://tampermonkey.net/
// @version        1.5
// @description        写真投稿サイトPHOTOHITO専用の画像検証ビューア
// @author        PHOTOHITO User
// @match        https://photohito.com
// @match        https://photohito.com/trend/*
// @match        https://photohito.com/select/*
// @match        https://photohito.com/dictionary/*
// @match        https://photohito.com/contest/
// @match        https://photohito.com/exhibition/*
// @match        https://photohito.com/photobook/
// @match        https://photohito.com/recent/
// @match        https://photohito.com/tag/*
// @match        https://photohito.com/map/*
// @match        https://photohito.com/user/*
// @exclude        https://photohito.com/user/login/
// @match        https://photohito.com/photo/*
// @exclude        https://photohito.com/photo/edit/*
// @match        https://photohito.com/lens/*
// @match        https://photohito.com/camera/*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=photohito.com
// @run-at        document-start
// @grant        none
// @updateURL        https://github.com/personwritep/PhotoHito_Viewer/raw/main/PhotoHito_Viewer.user.js
// @downloadURL        https://github.com/personwritep/PhotoHito_Viewer/raw/main/PhotoHito_Viewer.user.js
// ==/UserScript==


let retry=0;
let interval=setInterval(wait_target, 10);
function wait_target(){
    retry++;
    if(retry>20){ // リトライ制限 20回 0.2secまで
        clearInterval(interval); }
    let target=document.body; // 監視 target
    if(target){
        clearInterval(interval);
        com_env(); }}


function com_env(){
    let style=
        '<style id="ph_v">'+
        'html > ins { display: none !important; } '+
        '.adBox-300-2, #div-gpt-ad-p-300x250, #div-gpt-ad-p-side_300x250 { '+
        'display: none !important; } '+
        'footer small { padding: 15px; } ';

    let path=location.pathname;
    if(path.startsWith('/lens') || path.startsWith('/camera') || path.startsWith('/user')){

        style+=
            'h1#logo { display: none; } '+
            'body .wrapper_full article #path { margin: 2px 15px 15px; } '+
            'body .wrapper article h1 { font-size: 120%; padding: 0 0 12px 40px; order: -2; } '+
            'body .wrapper article h1 i { margin-top: -18px; } '+
            'body .wrapper_full article section { '+
            'margin-right: 15px; display: flex; flex-direction: column; } '+
            '#photo_list_search_form { width: 600px; order: -2; } '+
            '#photo_list_sort {width: 320px; position: relative; top: -50px; left: 600px; order: -2; } '+
            '.photo_list { order: 0; } '+
            '#pagenate, #pagenate_c { padding: 7px 0; background: #f8f8fa; } '+
            '#pagenate { margin: 20px 0 -20px; } '+
            '#pagenate_c { margin: -50px 0 20px; text-align: center; clear: both; order: -1; } '+
            '#pagenate_c li { margin: 0 5px; display: inline-block; } '+
            '#pagenate_c li em { color: #fff; font-style: normal; background: #666; '+
            'padding: 5px 10px; border-radius: 2px; } '+
            '#pagenate_c li a { color: #333; padding: 5px 10px; } '+
            '#pagenate_c li a:hover { text-decoration: none; background: #ccc; border-radius: 2px; } '+
            'body .wrapper_full aside { position: absolute; top: 184px; right: 0; '+
            'padding: 10px 20px; background: #fff; z-index: 10; display: none; } '+
            'body .wrapper_full aside .notlogin_banner, '+
            'body .wrapper_full aside .side_ad { display: none; } '; }

    style+='</style>';

    if(!document.querySelector('#ph_v')){
        document.documentElement.insertAdjacentHTML('beforeend', style); }

} // com_env()




window.addEventListener('DOMContentLoaded', function(){

    let path=location.pathname;
    if(path.match(/\/photo\/\d{1,8}\/$/)){ //「ユーザー別写真リスト」の画面

        let box=0; // Lightbox の表示フラグ 非表示0 表示1

        let q=window.location.search.slice(1);
        if(q=='lb'){
            let rt=0;
            let interval=setInterval(wait_target, 10);
            function wait_target(){
                rt++;
                if(rt>50){ // リトライ制限 50回 0.5secまで
                    clearInterval(interval); }
                let target=document.querySelector('#photo_view img:last-child'); // 監視 target
                if(target){
                    clearInterval(interval);
                    set_img(target);
                    org_size(); }}}



        let img_link=document.querySelector('#photo_view a');
        let l_img=document.querySelector('#photo_view img:last-child');
        if(img_link && l_img){
            img_link.addEventListener('mousedown', function(event){
                if(!event.shiftKey){
                    event.preventDefault();
                    exif_hide();
                    set_img(l_img);
                    org_size(); }}); }



        box_env();


        function box_env(){
            let pl_height=0; //「お気に入りパネル」の高さ
            let plink_area=document.querySelector('#photo_link_area');
            if(plink_area){
                pl_height=plink_area.clientHeight; }


            let SVG_x=
                '<svg style="width: 48px; height: 48px;" viewBox="0 0 512 512">'+
                '<path style="fill: #00000070;" d="M256 0C114.6 0 0 114.6 0 256c0 141.4 '+
                '114.6 256 256 256C397.4 512 512 397.4 512 256C512 114.6 397.4 0 256 0z">'+
                '</path><path d="M363.1 333.6l-29.6 29.6l-77.6-77.6l-77.5 '+
                '77.6l-29.6-29.6l77.5-77.5l-77.5-77.5l29.6-29.6l77.5 77.5l77.6-77.5l29.6 '+
                '29.6l-77.5 77.5L363.1 333.6z" style="fill: #fff;"></path></svg>';

            let SVG_h=
                '<svg id="ph_h" height="24" width="24"  viewBox="0 0 220 210">'+
                '<path d="M89 22C71 25 54 33 41 46C7 81 11 142 50 171C58 177 68 182 78 '+
                '185C90 188 103 189 115 187C126 185 137 181 146 175C155 169 163 162 169 '+
                '153C190 123 189 80 166 52C147 30 118 18 89 22z" style="fill: #78909c;"></path>'+
                '<path d="M67 77C73 75 78 72 84 70C94 66 114 67 109 83C106 91 98 95 93 '+
                '101C86 109 83 116 83 126L111 126C112 114 122 108 129 100C137 90 141 76 '+
                '135 64C127 45 101 45 84 48C80 49 71 50 68 54C67 56 67 59 67 61L67 77M85 '+
                '143L85 166L110 166L110 143L85 143z" style="fill:#fff;"></path></svg>';

            let lightbox=
                '<div id="lightbox">'+
                '<div id="photo_sw"><p id="button_x">'+ SVG_x +'</p></div>'+
                '<img id="box_img">'+
                '<style>'+
                '@keyframes fadeIn { 0% {opacity: 0} 100% {opacity: 1}} '+
                '.fin { animation: fadeIn .5s ease 0s 1 normal; animation-fill-mode: both; } '+
                '@keyframes fadeOut { 0% {opacity: 1} 100% {opacity: 0}} '+
                '.fout { animation: fadeOut .2s ease 0s 1 normal; animation-fill-mode: both; } '+
                '#lightbox { position: fixed; top: 0; left: 0; z-index: 3000; user-select: none; '+
                'display: grid; place-items: center; background: #000; '+
                'width: 100vw; height: 100vh; overflow: auto; visibility: hidden; } '+
                '#photo_sw { position: fixed; top: 0; width: 100%; height: 15%; } '+
                '#photo_sw:hover #button_x { opacity: 1; } '+
                '#button_x { position: absolute; top: 20px; left: calc(50% - 24px); '+
                'cursor: pointer; opacity: 0; } '+
                '#box_img { width: 98vw; height: 98vh; padding: 1vh 1vw; object-fit: contain; } '+
                '</style></div>'+

                '<div id="exif_sw">'+
                'Exifを上部表示'+ SVG_h +
                '<style>'+
                '#exif_sw { position: absolute; top: 84px; right: 610px; font-size: 15px; '+
                'padding: 11px 10px 8px; border: solid 1px #999; border-radius: 2px; '+
                'background: #fff; cursor: pointer; } '+
                '#ph_h { margin: -8px -4px -6px 8px; cursor: pointer; }'+
                '</style></div>'+

                '<style class="ph_v_photo_detail">'+
                'h1#logo { display: none; } '+
                '#photo_detail .wrapper_full article #path { margin: 2px 15px 15px; } '+
                '#user_header { margin: -14px 15px 0; } '+
                '.wrapper article h1 { cursor: auto; } '+
                '#photo_view { overflow: hidden; position: relative; margin-bottom: 30px; } '+
                '#photo_view:hover::before { content: "◀写真一覧"; color: #00a3ff; '+
                'font: normal 14px Meiryo; position: absolute; bottom: 20px; left: 10px; '+
                'padding: 3px 6px 1px; border: 1px solid #00a3ff; border-radius: 3px; } '+
                '#photo_view a { margin: 0 auto !important; width: fit-content; user-select: none; } '+
                '#photo_view a:hover { box-shadow: 0 100vw 0 100vw #000; } '+
                '#photo_award_regist { position: absolute; top: 20px; right: 15px; } '+
                '#photo_detail #photo_link_area { position: absolute; z-index: 1; '+
                'width: 280px !important; padding: 10px; background: #323232; '+
                'right: calc(50% - 500px); bottom: -'+(pl_height +130)+'px; } '+
                '#photo_detail #photo_activity { display: flex; } '+
                'aside { padding-top: '+(pl_height + 50)+ 'px; } '+
                'aside .notlogin_banner { display: none; } '+
                '.ad_detail, .content_ad { display: none; } '+
                '</style>';

            if(!document.querySelector('#lightbox')){
                document.body.insertAdjacentHTML('beforeend', lightbox); }

        } // box_env()



        function exif_disp(n){
            let style;
            if(n==0){
                style=
                    '<style id="exif_style">'+
                    '#sideInfo { position: absolute; top: 94px; left: calc(50vw + 220px); '; }
            if(n==1){
                style=
                    '<style id="exif_style">'+
                    '#sideInfo { position: fixed; top: 60px; right: 20px; z-index: 4000; '; }
            style+=
                'padding: 6px 8px 0; width: 250px; background: #fff; } '+
                '.wrapper:nth-child(3) { width: 1000px !important; } '+
                '.notlogin_banner, #tag_area, #location_area, #btn_violation, '+
                '#urlpaste_area { display: none; } '+
                'aside table { margin: 5px 0 0; } '+
                'aside tr { display: flex; flex-direction: column; } '+
                'aside th { padding: 0; font-size: 12px; } '+
                'aside td { padding: 0 0 5px; text-align: left; }'+
                '</style>';

            if(!document.querySelector('#exif_style')){
                document.documentElement.insertAdjacentHTML('beforeend', style); }}


        function exif_hide(){
            let exif_style=document.querySelector('#exif_style');
            if(exif_style){
                exif_style.remove(); }}


        function exif_turn(){
            let exif_style=document.querySelector('#exif_style');
            if(exif_style){
                exif_style.remove(); }
            else{
                if(box==0){
                    exif_disp(0); }
                else if(box==1){
                    exif_disp(1); }}}



        let exif_sw=document.querySelector('#exif_sw'); // Exifパネルの配置スイッチ
        if(exif_sw){
            exif_sw.onclick=function(){
                exif_turn(); }}



        function set_img(target){
            let html_=document.querySelector('html');
            let lightbox=document.querySelector('#lightbox');
            let box_img=lightbox.querySelector('#box_img');
            if(lightbox && box_img){
                let img_url=target.getAttribute('src');
                if(img_url){
                    let new_url;
                    if(img_url.endsWith('l.jpg')){
                        new_url=img_url.slice(0, -5) +'o.jpg'; }
                    else if(img_url.endsWith('/l/')){
                        new_url=img_url.slice(0, -3) +'/o/'; }
                    box_img.src=new_url;
                    html_.style.overflow='hidden';
                    lightbox.style.visibility='visible';
                    lightbox.classList.remove('fout');
                    lightbox.classList.add('fin');
                    box=1; }}}



        function org_size(){
            let lightbox=document.querySelector('#lightbox');
            let box_img=lightbox.querySelector('#box_img');
            let actal_x; // Actual Pixels表示スクロールx値
            let actal_y; // Actual Pixels表示スクロールy値

            lightbox.onclick=function(event){
                event.stopImmediatePropagation();
                if(!event.ctrlKey){
                    if(box_img.style.width!='auto'){
                        mag(event);
                        let org='width: auto; height: auto; padding: 0;';
                        box_img.setAttribute('style', org);
                        lightbox.scrollTo(actal_x, actal_y); }
                    else{
                        let nor='width: 98vw; height: 98vh; padding: 1vh 1vw;';
                        box_img.setAttribute('style', nor); }}
                else{
                    close(); }


                function mag(event){
                    let lightbox=document.querySelector('#lightbox');
                    let box_img=document.querySelector('#box_img');
                    let nwidth=box_img.naturalWidth;
                    let nhight=box_img.naturalHeight;
                    let ratio=nwidth/nhight
                    let top=event.offsetY;
                    let left=event.offsetX;
                    let ww=lightbox.clientWidth;
                    let wh=lightbox.clientHeight;

                    if(ww<wh*ratio){
                        let yp=ratio*(top - wh/2)/ww +1/2;
                        actal_x=(nwidth*left)/ww - ww/2;
                        actal_y=nhight*yp - wh/2; }
                    else{
                        let xp=((left - ww/2)/wh)/ratio +1/2;
                        actal_x=nwidth*xp - ww/2;
                        actal_y=(nhight*top)/wh - wh/2; }}}

        } //org_size()



        let button_x=document.querySelector('#button_x');
        if(button_x){
            button_x.onclick=function(event){
                event.stopImmediatePropagation();
                close(); }}



        document.addEventListener('keydown', function(event){
            if(box==1){
                if(event.keyCode==27){
                    event.preventDefault();
                    close(); }
                else if(event.keyCode==32){
                    event.preventDefault();
                    exif_turn(); }}
            if(box==0){
                if(event.keyCode==27){
                    event.preventDefault();
                    if(exif_sw){
                        window.close(); }}
                else if(event.keyCode==32){
                    event.preventDefault();
                    exif_turn(); }}});



        function close(){
            let html_=document.querySelector('html');
            let lightbox=document.querySelector('#lightbox');
            if(lightbox){
                html_.style.overflow='inherit';
                lightbox.classList.remove('fin');
                lightbox.classList.add('fout');
                exif_hide();
                setTimeout(()=>{
                    lightbox.style.visibility='hidden';
                    box=0;
                }, 200); }}



        setTimeout(()=>{
            let photo_side=document.querySelector('#photo_view');
            if(photo_side){
                photo_side.onclick=function(event){ // 画像周囲のクリックでタブ画面を閉じる
                    if(!event.ctrlKey && !event.shiftKey){
                        if(exif_sw){
                            window.close(); }}}}
        }, 500);



        let help=document.querySelector('#ph_h');
        if(help){
            help.onclick=function(event){
                event.stopImmediatePropagation();
                let url='https://ameblo.jp/personwritep/entry-12774028982.html';
                window.open(url, '_blank'); }}

    } //「ユーザー別写真リスト」の画面




    if(path.startsWith('/lens') || path.startsWith('/camera')){ //「レンズ」「カメラ」の抽出リスト

        let plist_a=document.querySelectorAll('.photo_list .grid > a');
        for(let k=0; k<plist_a.length; k++){
            enhance(plist_a[k]); }



        let pager_r=document.querySelector('#pagenate');
        if(pager_r){
            let pager_c=pager_r.cloneNode(true);
            pager_c.id='pagenate_c';
            let section=document.querySelector('.wrapper_full article section');
            if(section){
                section.appendChild(pager_c); }}



        let sw=
            '<div id="info_sw">'+
            '機種関連情報'+
            '<style>'+
            '#info_sw { position: absolute; top: 0; right: -140px; font-size: 90%; '+
            'padding: 7px 15px 4px; border-radius: 2px; background: #e5e5e5; cursor: pointer; } '+
            '#info_sw:hover { background: #ddd; } '+
            '</style></div>';

        let sort=document.querySelector('#photo_list_sort');
        if(sort && !document.querySelector('#info_sw')){
            sort.insertAdjacentHTML('beforeend', sw); }

        let info_sw=document.querySelector('#info_sw');
        let aside=document.querySelector('.wrapper_full aside');
        if(info_sw && aside){
            info_sw.onclick=function(){
                let photo_list=document.querySelector('.photo_list');
                let plist_top=photo_list.getBoundingClientRect().top;
                aside.style.top=plist_top - 50 +'px';
                if(aside.style.display!='block'){
                    aside.style.display='block'; }
                else{
                    aside.style.display='none'; }}}

    } //「lens」「camera」の検索抽出画像のリスト




    if(path.startsWith('/user') || path.startsWith('/contest') ||
       path.startsWith('/photo/newly-arrived') || path.startsWith('/tag') ||
       path.startsWith('/map')){

        let plist_ca=document.querySelectorAll('.photo-container-wrapper a');
        for(let k=0; k<plist_ca.length; k++){
            enhance(plist_ca[k]); }



        let plist_ga=document.querySelectorAll('.list-gallery-simple a');
        for(let k=0; k<plist_ga.length; k++){
            enhance(plist_ga[k]); }

    } //「user」の「写真一覧」「ギャラリー」,「フォトコンテスト一覧」「新着フォト」




    if(path=='/' || path.startsWith('/trend') || path.startsWith('/select') ||
       path.startsWith('/dictionary') || path.startsWith('/photobook') ||
       path.startsWith('/recent')){

        let plist_ma=document.querySelector('#main-photo a');
        if(plist_ma){
            enhance(plist_ma); }

        let plist_ha=document.querySelectorAll('.imgholder a');
        for(let k=0; k<plist_ha.length; k++){
            enhance(plist_ha[k]); }

    } // 「ホーム」「トレンドフォト」「セレクト」「セレクトフォト」「写真集」「新着」



    function enhance(link){
        link.onmousedown=function(event){
            event.preventDefault();
            if(event.ctrlKey){
                let enhref=link.href +'?lb'
                window.open(enhref, '_blank'); }
            else{
                link.setAttribute('target', '_blank'); }}}


}); // main()

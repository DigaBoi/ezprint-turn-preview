var turn = angular.module('ezprint.TurnPreview', []).
component('turnComp', {
    templateUrl: "templates/turnComp.html",
    controller: "turnCompController",
    bindings: {
        params: "="
    }
});

turn.controller('turnCompController', ['$scope','$element', function($scope, $element){
    //prende le pagine del libro e le carica nel dom
    function getPages(){
        $scope.images_length=$scope.params['pageCount'];
        var book = document.getElementById("book");
        if($scope.images_length<4 || $scope.images_length % 2 != 0){
            var pageDiv = document.createElement("div");
            pageDiv.style.backgroundColor ="black";
            pageDiv.style.color ="white";
            pageDiv.innerHTML += '<h3>Number of pages not correct</h3>';
            book.appendChild(pageDiv);
        }else{
            for(var i=0; i<$scope.images_length; i++){

                var pageDiv = document.createElement("div");
                pageDiv.classList.add("p"+(i+1));
                pageDiv.classList.add("loading");
                if(i>1 && i<$scope.images_length-2 ){
                    pageDiv.classList.add("own-size");
                }else if($scope.params['coverIsHard']==true){
                    pageDiv.classList.add("hard");
                    if(i==1||i==$scope.images_length-2){
                        pageDiv.classList.add("fixed");
                        pageDiv.classList.add("fixedBg");
                    }
                }

                book.appendChild(pageDiv);
            }
        }
        document.getElementById("navigation").setAttribute("max", $scope.images_length);
        next();
    };
    $scope.params=JSON.parse($element.attr("params"));
    getPages();
    function updateBook() {
        //risoluzione del libro
        var resH = parseInt($scope.params['coverHeight']);

        var resW = parseInt($scope.params['coverWidth']);

        var oresH = parseInt($scope.params['pageHeight']);
        if(resH>oresH) {
            var oresHp = oresH / resH;
        }else{
            var oresHp = 1;
        }

        var oresW = parseInt($scope.params['pageWidth']);
        if(resW>oresW){
            var oresWp = oresW/resW;
        }else{
            var oresWp = 1;
        }

        var resW = resW * 2;

        //dimensioni del div contenitore
        var globalWidth = $element.parent()[0].clientWidth;
        //console.log("globalWidth: " + globalWidth);
        var globalHeight = $element.parent()[0].clientHeight;
        //console.log("globalHeight: " + globalHeight);

        //dimensiona il libro in base alla res
        if(resW > resH) {
            //definisce la larghezza del libro in base ai dati
            var flipWidth = parseInt((globalWidth * 0.9));
            if (flipWidth % 2 != 0) {
                flipWidth -= 1;
            }
            //console.log("flipWidth: " + flipWidth);
            //definisce l'altezza del libro in base ai dati
            var flipHeight = parseInt((resH * flipWidth) / resW);
            if (flipHeight % 2 != 0) {
                flipHeight -= 1;
            }
            //console.log("flipHeight: " + flipHeight);
        }else{
            //definisce la larghezza del libro in base ai dati
            var flipHeight = parseInt((globalHeight * 0.9));
            if (flipHeight % 2 != 0) {
                flipHeight -= 1;
            }
            //console.log("flipHeight: " + flipHeight);
            //definisce l'altezza del libro in base ai dati
            var flipWidth = parseInt((resW * flipHeight) / resH);
            if (flipWidth % 2 != 0) {
                flipWidth -= 1;
            }
            //console.log("flipWidth: " + flipWidth);
        }

        //definisce i margini in base ai dati
        var marginLeft = parseInt((globalWidth - flipWidth) / 2);
        //console.log("marginLeft: " + parseInt(marginLeft));
        var marginTop = parseInt((globalHeight*0.9 - flipHeight) / 2);
        //console.log("marginTop: " + parseInt(marginTop));
        if(flipWidth<25){
            flipWidth=25;
            flipHeight=(flipWidth*resH)/resW;
        }
        if(flipHeight<25){
            flipHeight=25;
            flipWidth=(flipHeight*resW)/resH;
        }
        while(marginLeft<0||marginTop<70&&flipHeight>50&&flipWidth>50){
            flipHeight=parseInt(flipHeight*0.99);
            flipWidth=parseInt(flipWidth*0.99);
            marginLeft = parseInt((globalWidth - flipWidth) / 2);
            //console.log("marginLeft: " + parseInt(marginLeft));
            marginTop = parseInt((globalHeight*0.9 - flipHeight) / 2);
            //console.log("marginTop: " + parseInt(marginTop));
        }

        //update delle dimensioni e margini calcolati
        var flipMargin = document.getElementsByClassName("container");
        flipMargin[0].style.marginLeft = marginLeft + "px";
        flipMargin[0].style.marginTop = marginTop + "px";

        var flipBook = document.getElementsByClassName("flipbook");
        flipBook[0].style.height = flipHeight + "px";
        flipBook[0].style.width = flipWidth + "px";

        var flipPages = document.getElementsByClassName("page");
        for (var i = 0; i < flipPages.length; i++) {
            flipPages[i].style.height = flipHeight + "px";
            flipPages[i].style.width = flipWidth / 2 + "px";
        }

        var ownSizePages = document.getElementsByClassName("own-size");
        for (var i = 0; i < ownSizePages.length; i++) {
            ownSizePages[i].style.height = parseInt(flipHeight*oresHp) + "px";
            ownSizePages[i].style.width = parseInt((flipWidth / 2)*oresWp) + "px";
        }
    };


    //caricamento
    function loadApp() {
        var flipbook = $('.flipbook');

        // Check if the CSS was already loaded

        if (flipbook.width()==0 || flipbook.height()==0) {
            setTimeout(loadApp, 10);
            return;
        }

        $('.flipbook .double').scissor();

        // Create the flipbook

        $('.flipbook').turn({
            // Elevation

            elevation: 100,

            // Enable gradients

            gradients: true,

            // Auto center this flipbook

            autoCenter: true,

            turnCorners: "bl,br"

        });
    };

    function next() {
        document.getElementById("navigation").value = 0;
        //inizializza libro
        updateBook();
        $scope.nav=0;
        //controllo navigazione
        $scope.flipTo = function(pageNumber){
            if($('.flipbook').turn('pages')>4){
                resizeBook();
                if(pageNumber==0){
                    pageNumber=1;
                }else if(pageNumber>$('.flipbook').turn('pages')){
                    pageNumber=$('.flipbook').turn('pages');
                }
                var currentPage = $('.flipbook').turn('page');
                if(currentPage>0 && currentPage%2!=0){
                    currentPage-=1;
                }
                if(pageNumber>currentPage){
                    do {
                        $('.flipbook').turn("next");
                        currentPage = $('.flipbook').turn('page');
                        if(currentPage>0 && currentPage%2!=0){
                            currentPage-=1;
                        }
                    }while(pageNumber>currentPage);
                }else if(pageNumber<currentPage){
                    do {
                        $('.flipbook').turn("previous");
                        currentPage = $('.flipbook').turn('page');
                        if(currentPage>0 && currentPage%2!=0){
                            currentPage-=1;
                        }
                    }while(pageNumber<currentPage);
                }
            }
        }

        $scope.flipButton = function (x) {
            resizeBook();
            $('.flipbook').turn(x);
        }

        $('.flipbook').bind('turned', function (e, page) {
            if(page==1||page==$('.flipbook').turn('pages')) {
                var bgs = document.getElementsByClassName("fixed");
                for (var i = 0; i < bgs.length; i++) {
                    bgs[i].style.display = "none";
                }
            }
            resizeBook();
        });

        $('.flipbook').bind("turning", function(event, page, view) {
            var p = page;
            if(page % 2 != 0){
                p-=1;
            }
            //update scrollbar
            document.getElementById("navigation").value = p;
            $scope.nav = p;
        });

        $('.flipbook').bind("start", function(event, pageObject, corner) {
            resizeBook();
            var p=pageObject['next'];
            if(pageObject['next']>=2||pageObject['next']<=$('.flipbook').turn('pages')-1) {
                var bgs = document.getElementsByClassName("fixed");
                for (var i = 0; i < bgs.length; i++) {
                    bgs[i].style.display = "block";
                }
            }
            //add bg
            try {
                document.getElementsByClassName('p' + (p - 2))[0].innerHTML = "<h3>p"+(p - 2)+"</h3>";
            }catch (e){}
            try {
                document.getElementsByClassName('p' + (p - 1))[0].innerHTML = "<h3>p"+(p - 1)+"</h3>";
            }catch (e){}
            try {
                document.getElementsByClassName('p' + p)[0].innerHTML = "<h3>p"+p+"</h3>";
            }catch (e){}
            try {
                document.getElementsByClassName('p' + (p + 1))[0].innerHTML = "<h3>p"+(p + 1)+"</h3>";
            }catch (e){}
            try {
                document.getElementsByClassName('p' + (p + 2))[0].innerHTML = "<h3>p"+(p + 2)+"</h3>";
            }catch (e){}
            try {
                document.getElementsByClassName('p' + (p + 3))[0].innerHTML = "<h3>p"+(p + 3)+"</h3>";
            }catch (e){}
        });
        // Load the HTML4 version if there's not CSS transform

        yepnope({
            test : Modernizr.csstransforms,
            yep: ['turnjs4/lib/turn.min.js'],
            nope: ['turnjs4/lib/turn.html4.min.js'],
            both: ['turnjs4/lib/scissor.min.js', 'css/double-page.css'],
            complete: loadApp
        });
        //Initialize bg
        document.getElementsByClassName('p1')[0].innerHTML="<h3>p1</h3>";
        document.getElementsByClassName('p2')[0].innerHTML="<h3>p2</h3>";
        document.getElementsByClassName('p3')[0].innerHTML="<h3>p3</h3>";
    };

    //controllo resize
    window.addEventListener('resize', function (e) {
        resizeBook();
    });

    function resizeBook() {

        //risoluzione del libro
        var resH = parseInt($scope.params['coverHeight']);

        var resW = parseInt($scope.params['coverWidth']);

        var oresH = parseInt($scope.params['pageHeight']);
        if(resH>oresH) {
            var oresHp = oresH / resH;
        }else{
            var oresHp = 1;
        }

        var oresW = parseInt($scope.params['pageWidth']);
        if(resW>oresW){
            var oresWp = oresW/resW;
        }else{
            var oresWp = 1;
        }

        var resW = resW * 2;

        //dimensioni del div contenitore
        var globalWidth = $element.parent()[0].clientWidth;
        //console.log("globalWidth: " + globalWidth);
        var globalHeight = $element.parent()[0].clientHeight;
        //console.log("globalHeight: " + globalHeight);

        //dimensiona il libro in base alla res
        if(resW > resH) {
            //definisce la larghezza del libro in base ai dati
            var flipWidth = parseInt((globalWidth * 0.9));
            if (flipWidth % 2 != 0) {
                flipWidth -= 1;
            }
            //console.log("flipWidth: " + flipWidth);
            //definisce l'altezza del libro in base ai dati
            var flipHeight = parseInt((resH * flipWidth) / resW);
            if (flipHeight % 2 != 0) {
                flipHeight -= 1;
            }
            //console.log("flipHeight: " + flipHeight);
        }else{
            //definisce la larghezza del libro in base ai dati
            var flipHeight = parseInt((globalHeight * 0.9));
            if (flipHeight % 2 != 0) {
                flipHeight -= 1;
            }
            //console.log("flipHeight: " + flipHeight);
            //definisce l'altezza del libro in base ai dati
            var flipWidth = parseInt((resW * flipHeight) / resH);
            if (flipWidth % 2 != 0) {
                flipWidth -= 1;
            }
            //console.log("flipWidth: " + flipWidth);
        }

        //definisce i margini in base ai dati
        var marginLeft = parseInt((globalWidth - flipWidth) / 2);
        //console.log("marginLeft: " + parseInt(marginLeft));
        var marginTop = parseInt((globalHeight*0.9 - flipHeight) / 2);
        //console.log("marginTop: " + parseInt(marginTop));
        if(flipWidth<25){
            flipWidth=25;
            flipHeight=(flipWidth*resH)/resW;
        }
        if(flipHeight<25){
            flipHeight=25;
            flipWidth=(flipHeight*resW)/resH;
        }
        while(marginLeft<0||marginTop<70&&flipHeight>50&&flipWidth>50){
            flipHeight=parseInt(flipHeight*0.99);
            flipWidth=parseInt(flipWidth*0.99);
            marginLeft = parseInt((globalWidth - flipWidth) / 2);
            //console.log("marginLeft: " + parseInt(marginLeft));
            marginTop = parseInt((globalHeight*0.9 - flipHeight) / 2);
            //console.log("marginTop: " + parseInt(marginTop));
        }

        //update delle dimensioni e margini calcolati
        var flipMargin = document.getElementsByClassName("container");
        flipMargin[0].style.marginLeft = marginLeft + "px";
        flipMargin[0].style.marginTop = marginTop + "px";
        var ownSizePages = document.getElementsByClassName("own-size");
        for (var i = 0; i < ownSizePages.length; i++) {
            ownSizePages[i].style.height = parseInt(flipHeight*oresHp) + "px";
            ownSizePages[i].style.width = parseInt((flipWidth / 2)*oresWp) + "px";
        }
        $('.flipbook').turn('size', flipWidth, flipHeight);
        if($('.flipbook').turn("page")==1||$('.flipbook').turn("page")==$('.flipbook').turn('pages')) {
            var bgs = document.getElementsByClassName("fixed");
            for (var i = 0; i < bgs.length; i++) {
                bgs[i].style.display = "none";
            }
        }

    };

}]);
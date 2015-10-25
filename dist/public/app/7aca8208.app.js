"use strict";angular.module("hackLogicaApp",["ngCookies","ngResource","ngSanitize","btford.socket-io","ui.router","ui.bootstrap"]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(a,b,c,d){b.otherwise("/"),c.html5Mode(!0),d.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b,c,d){return{request:function(a){return a.headers=a.headers||{},c.get("token")&&(a.headers.Authorization="Bearer "+c.get("token")),a},responseError:function(a){return 401===a.status?(d.path("/login"),c.remove("token"),b.reject(a)):b.reject(a)}}}]).run(["$rootScope","$location","Auth",function(a,b,c){a.$on("$stateChangeStart",function(a,d){c.isLoggedInAsync(function(c){d.authenticate&&!c&&(a.preventDefault(),b.path("/login"))})})}]),angular.module("hackLogicaApp").config(["$stateProvider",function(a){a.state("login",{url:"/login",templateUrl:"app/account/login/login.html",controller:"LoginCtrl"}).state("signup",{url:"/signup",templateUrl:"app/account/signup/signup.html",controller:"SignupCtrl"}).state("settings",{url:"/settings",templateUrl:"app/account/settings/settings.html",controller:"SettingsCtrl",authenticate:!0})}]),angular.module("hackLogicaApp").controller("LoginCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.login=function(d){a.submitted=!0,d.$valid&&b.login({email:a.user.email,password:a.user.password}).then(function(){c.path("/")})["catch"](function(b){a.errors.other=b.message})},a.loginOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("hackLogicaApp").controller("SettingsCtrl",["$scope","User","Auth",function(a,b,c){a.errors={},a.changePassword=function(b){a.submitted=!0,b.$valid&&c.changePassword(a.user.oldPassword,a.user.newPassword).then(function(){a.message="Password successfully changed."})["catch"](function(){b.password.$setValidity("mongoose",!1),a.errors.other="Incorrect password",a.message=""})}}]),angular.module("hackLogicaApp").controller("SignupCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.register=function(d){a.submitted=!0,d.$valid&&b.createUser({name:a.user.name,email:a.user.email,password:a.user.password}).then(function(){c.path("/")})["catch"](function(b){b=b.data,a.errors={},angular.forEach(b.errors,function(b,c){d[c].$setValidity("mongoose",!1),a.errors[c]=b.message})})},a.loginOauth=function(a){d.location.href="/auth/"+a}}]),angular.module("hackLogicaApp").controller("AdminCtrl",["$scope","$http","Auth","User",function(a,b,c,d){a.users=d.query(),a["delete"]=function(b){d.remove({id:b._id}),angular.forEach(a.users,function(c,d){c===b&&a.users.splice(d,1)})}}]),angular.module("hackLogicaApp").config(["$stateProvider",function(a){a.state("admin",{url:"/admin",templateUrl:"app/admin/admin.html",controller:"AdminCtrl"})}]),angular.module("hackLogicaApp").controller("ChatCtrl",["$scope","$http","socket",function(a,b,c){a.awesomeThings=[],b.get("/api/things").success(function(b){a.awesomeThings=b,c.syncUpdates("thing",a.awesomeThings)}),a.addThing=function(){""!==a.newThing&&(b.post("/api/things",{name:a.newThing}),a.newThing="")},a.deleteThing=function(a){b["delete"]("/api/things/"+a._id)},a.$on("$destroy",function(){c.unsyncUpdates("thing")})}]),angular.module("hackLogicaApp").config(["$stateProvider",function(a){a.state("chat",{url:"/chat",templateUrl:"app/chat/chat.html",controller:"ChatCtrl"})}]),angular.module("hackLogicaApp").controller("MainCtrl",["$scope","$http","socket","$state",function(a,b,c,d){a.awesomeThings=[],b.get("/api/things").success(function(b){a.awesomeThings=b,c.syncUpdates("thing",a.awesomeThings)}),a.addThing=function(){""!==a.newThing&&(b.post("/api/things",{name:a.newThing}),a.newThing="")},a.deleteThing=function(a){b["delete"]("/api/things/"+a._id)},a.$on("$destroy",function(){c.unsyncUpdates("thing")}),a.projectStart=function(){d.go("project")},a.myInterval=5e3,a.slides=[{image:"assets/images/hero-illustration-1.svg"},{image:"assets/images/hero-illustration-2.svg"},{image:"assets/images/hero-illustration-3.svg"}]}]),angular.module("hackLogicaApp").config(["$stateProvider",function(a){a.state("main",{url:"/",templateUrl:"app/main/main.html",controller:"MainCtrl"})}]),angular.module("hackLogicaApp").controller("ProjectCtrl",["$scope","$http","socket",function(a,b,c){a.showStep2=!1,a.showNextButton=!1,a.transactionStep=1,a.transactionWidth="33%",a.activateNextButton=function(){a.showNextButton===!1?a.showNextButton=!0:a.showNextButton=!1},a.activateNextStep=function(){a.showStep2=!0,a.transactionStep=2,a.transactionWidth="66%"},a.showStep1=function(){a.showStep2=!1,a.transactionStep=1,a.transactionWidth="33%"}}]),angular.module("hackLogicaApp").config(["$stateProvider",function(a){a.state("project",{url:"/project",templateUrl:"app/project/project.html",controller:"ProjectCtrl"})}]),angular.module("hackLogicaApp").factory("Auth",["$location","$rootScope","$http","User","$cookieStore","$q",function(a,b,c,d,e,f){var g={};return e.get("token")&&(g=d.get()),{login:function(a,b){var h=b||angular.noop,i=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=d.get(),i.resolve(a),h()}).error(function(a){return this.logout(),i.reject(a),h(a)}.bind(this)),i.promise},logout:function(){e.remove("token"),g={}},createUser:function(a,b){var c=b||angular.noop;return d.save(a,function(b){return e.put("token",b.token),g=d.get(),c(a)},function(a){return this.logout(),c(a)}.bind(this)).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.changePassword({id:g._id},{oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},getCurrentUser:function(){return g},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)})["catch"](function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return"admin"===g.role},getToken:function(){return e.get("token")}}}]),angular.module("hackLogicaApp").factory("User",["$resource",function(a){return a("/api/users/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}}})}]),angular.module("hackLogicaApp").controller("FooterCtrl",["$scope",function(a){}]),angular.module("hackLogicaApp").factory("Modal",["$rootScope","$modal",function(a,b){function c(c,d){var e=a.$new();return c=c||{},d=d||"modal-default",angular.extend(e,c),b.open({templateUrl:"components/modal/modal.html",windowClass:d,scope:e})}return{confirm:{"delete":function(a){return a=a||angular.noop,function(){var b,d=Array.prototype.slice.call(arguments),e=d.shift();b=c({modal:{dismissable:!0,title:"Confirm Delete",html:"<p>Are you sure you want to delete <strong>"+e+"</strong> ?</p>",buttons:[{classes:"btn-danger",text:"Delete",click:function(a){b.close(a)}},{classes:"btn-default",text:"Cancel",click:function(a){b.dismiss(a)}}]}},"modal-danger"),b.result.then(function(b){a.apply(b,d)})}}}}}]),angular.module("hackLogicaApp").directive("mongooseError",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(){return d.$setValidity("mongoose",!0)})}}}),angular.module("hackLogicaApp").controller("NavbarCtrl",["$scope","$location","Auth",function(a,b,c){a.menu=[{title:"Home",link:"/"}],a.isCollapsed=!0,a.isLoggedIn=c.isLoggedIn,a.isAdmin=c.isAdmin,a.getCurrentUser=c.getCurrentUser,a.logout=function(){c.logout(),b.path("/login")},a.isActive=function(a){return a===b.path()}}]),angular.module("hackLogicaApp").factory("socket",["socketFactory",function(a){var b=io("",{path:"/socket.io-client"}),c=a({ioSocket:b});return{socket:c,syncUpdates:function(a,b,d){d=d||angular.noop,c.on(a+":save",function(a){var c=_.find(b,{_id:a._id}),e=b.indexOf(c),f="created";c?(b.splice(e,1,a),f="updated"):b.push(a),d(f,a,b)}),c.on(a+":remove",function(a){var c="deleted";_.remove(b,{_id:a._id}),d(c,a,b)})},unsyncUpdates:function(a){c.removeAllListeners(a+":save"),c.removeAllListeners(a+":remove")}}}]),angular.module("hackLogicaApp").run(["$templateCache",function(a){a.put("app/account/login/login.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Login</h1><p>Accounts are reset on server restart from <code>server/config/seed.js</code>. Default account is <code>test@test.com</code> / <code>test</code></p><p>Admin account is <code>admin@admin.com</code> / <code>admin</code></p></div><div class=col-sm-12><form class=form name=form ng-submit=login(form) novalidate><div class=form-group><label>Email</label><input type=email name=email class=form-control ng-model=user.email required></div><div class=form-group><label>Password</label><input type=password name=password class=form-control ng-model=user.password required></div><div class="form-group has-error"><p class=help-block ng-show="form.email.$error.required && form.password.$error.required && submitted">Please enter your email and password.</p><p class=help-block ng-show="form.email.$error.email && submitted">Please enter a valid email.</p><p class=help-block>{{ errors.other }}</p></div><div><button class="btn btn-inverse btn-lg btn-login" type=submit>Login</button> <a class="btn btn-default btn-lg btn-register" href=/signup>Register</a></div><hr><div><a class="btn btn-facebook" href="" ng-click="loginOauth(\'facebook\')"><i class="fa fa-facebook"></i> Connect with Facebook</a></div></form></div></div><hr></div>'),a.put("app/account/settings/settings.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show="(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class="btn btn-lg btn-primary" type=submit>Save changes</button></form></div></div></div>'),a.put("app/account/signup/signup.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Sign up</h1></div><div class=col-sm-12><form class=form name=form ng-submit=register(form) novalidate><div class=form-group ng-class="{ \'has-success\': form.name.$valid && submitted,\n                                            \'has-error\': form.name.$invalid && submitted }"><label>Name</label><input name=name class=form-control ng-model=user.name required><p class=help-block ng-show="form.name.$error.required && submitted">A name is required</p></div><div class=form-group ng-class="{ \'has-success\': form.email.$valid && submitted,\n                                            \'has-error\': form.email.$invalid && submitted }"><label>Email</label><input type=email name=email class=form-control ng-model=user.email required mongoose-error><p class=help-block ng-show="form.email.$error.email && submitted">Doesn\'t look like a valid email.</p><p class=help-block ng-show="form.email.$error.required && submitted">What\'s your email address?</p><p class=help-block ng-show=form.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class="{ \'has-success\': form.password.$valid && submitted,\n                                            \'has-error\': form.password.$invalid && submitted }"><label>Password</label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show="(form.password.$error.minlength || form.password.$error.required) && submitted">Password must be at least 3 characters.</p><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.password }}</p></div><div><button class="btn btn-inverse btn-lg btn-login" type=submit>Sign up</button> <a class="btn btn-default btn-lg btn-register" href=/login>Login</a></div><hr><div><a class="btn btn-facebook" href="" ng-click="loginOauth(\'facebook\')"><i class="fa fa-facebook"></i> Connect with Facebook</a></div></form></div></div><hr></div>'),a.put("app/admin/admin.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><p>The delete user and user index api routes are restricted to users with the \'admin\' role.</p><ul class=list-group><li class=list-group-item ng-repeat="user in users"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user) class=trash><span class="glyphicon glyphicon-trash pull-right"></span></a></li></ul></div>'),a.put("app/chat/chat.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><!-- <div class="container">\n  <div class="row">\n    <div class="col-lg-12">\n      <h1 class="page-header">Features:</h1>\n      <ul class="nav nav-tabs nav-stacked col-md-4 col-lg-4 col-sm-6" ng-repeat="thing in awesomeThings">\n        <li><a href="#" tooltip="{{thing.info}}">{{thing.name}}<button type="button" class="close" ng-click="deleteThing(thing)">&times;</button></a></li>\n      </ul>\n    </div>\n  </div>\n\n  <form class="thing-form">\n    <label>Syncs in realtime across clients</label>\n    <p class="input-group">\n      <input type="text" class="form-control" placeholder="Add a new thing here." ng-model="newThing">\n      <span class="input-group-btn">\n        <button type="submit" class="btn btn-primary" ng-click="addThing()">Add New</button>\n      </span>\n    </p>\n  </form>\n</div> --><div class=container><div class=row><div class="side-col col-xs-12 col-md-6 col-md-push-6"><div class=side-box-container><div class="project-details ng-scope"><h1 class=title>Mobile App &nbsp;</h1><h2 class=small>Every Hack Logica project comes with our 100% guarantee &nbsp;</h2><div class="card border-top ng-scope"><div class=clearfix><h3 class=pull-left>OVERVIEW</h3></div><h4 class=ng-scope>Gathering Requirements</h4><p class=info>Budget: &nbsp;<span class="highlight ng-binding">$20K+</span><br>Timeline: &nbsp;<span class="highlight ng-binding">1 month</span><br>Platforms: &nbsp;<span class="highlight ng-binding">iOS, Web</span></p><p class="info ng-hide">Cost: &nbsp;<span class="highlight ng-binding">TBD</span><br>Timeline: &nbsp;<span class="highlight ng-binding">1 month</span><br>Platforms: &nbsp;<span class="highlight ng-binding">iOS, Web</span></p><div class=project-manager><img src=media/sprites/generic-avatars/av2.png><p class=ng-binding><strong>Project Manager: &nbsp;</strong>Vasily A.</p></div><footer class=text-center><p>Questions? Checkout our &nbsp;<a class=black-underline><strong>FAQ</strong></a>&nbsp; or the &nbsp;<a href="" class=black-underline><strong>Hack Logica Overview</strong></a></p></footer></div><div class=documents><div class="card border-top"><h3>DOCUMENTS</h3><ul class=system><li><a href=""><span>NDA</span></a></li></ul><h3 class=ng-hide>Attachments</h3><table class=table><tbody><!-- ngRepeat: doc in gigDisplay.docs --></tbody></table><a class="btn btn-primary fat-mini">+ Add file</a></div></div></div></div></div><div class="col-xs-12 col-md-6 col-md-pull-6 chat-parent"><div class="card chat-container" style="min-height: auto; height: unset; top: 205px; bottom: 41px"><div class="chat-box loadable"><div class=contents></div></div></div></div></div></div>'),a.put("app/main/main.html",'<div id=particles-js class=particleJs></div><div ng-include="\'components/navbar/navbar.html\'"></div><div class="container overflow index-hero"><div class="row hero"><div class="col-md-8 col-md-push-2"><h1>Get a price quote for your app<br>in <span class=blue>minutes</span>.</h1><p>Hire our elite design and development team in <span class=blue>minutes</span>.<br><span class=blue>H</span>ack <span class=blue>L</span>ogica is your connection to the top designers and top <span class=blue>5%</span> software developers from our talent pool.</p><a href=javascript: ng-click=projectStart() class="btn btn-primary btn-lg">Start a project</a></div><!-- <div class="col-md-4 hidden-sm hidden-xs">\n      <carousel interval="myInterval">\n        <slide ng-repeat="slide in slides" active="slide.active">\n          <img ng-src="{{slide.image}}">\n        </slide>\n      </carousel>\n    </div> --></div><div class="row arrow"><a href=#intro><i class="fa fa-angle-down bounce"></i></a></div></div><div id=intro class="gray zigzag padding-lg index"><div class=container><!-- <div class="row padding-md">\n      <div class="col-md-6">\n        <h5 class="underline">who we are</h5>\n        <h2>Our developers are from the world\'s top universities and tech companies</h2>\n        <p>We recruit from some of the most prestigious educational institutions and tech companies on earth. Our developers come to us as students, bootstrapped founders, or moonlighting software engineers.</p>\n        <a href="who-we-are.html">Read More<i class="gf-angle-right read-more"></i></a>\n      </div>\n      <div class="col-md-6 text-right pad">\n        <img src="" width="70%" alt="Our developers from the world\'s top universities and tech companies">\n      </div>\n    </div> --><!-- <div class="row padding-md">\n      <div class="col-md-6 col-md-push-6">\n        <h5 class="underline">success stories</h5>\n        <h2>Learn about Hack Logica from our customers</h2>\n        <p>We couldn\'t be prouder of the work we\'ve done and, luckily, our customers feel the same way. Hear what they have to say.</p>\n        <a href="success-stories.html">Read More<i class="gf-angle-right read-more"></i></a>\n      </div>\n      <div class="col-md-6 col-md-pull-6">\n        <div class="card testimonial">\n          <img src="" alt="">\n          <p>Testimonial!</p>\n          <footer>Marquito<span class="position">CEO</span>\n            <img src="" width="80">\n          </footer>\n        </div>\n      </div>\n    </div> --><div class="row padding-md"><div class=col-md-6><h5 class=underline>how it works</h5><h2>From your idea to a finished product</h2><p>Submit your project and get a quote within 10 minutes. We can start work immediately and you\'ll have weekly check-ins with your Product Manager until we\'re done.</p><a href="">Read More<i class="fa fa-angle-right read-more"></i></a></div><div class=col-md-6><div class="w80 pull-right from-idea-to-product"><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc=http://creativecommons.org/ns# xmlns:rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns# xmlns:svg=http://www.w3.org/2000/svg xmlns=http://www.w3.org/2000/svg viewbox="0 0 672 480" height=300 width=520 xml:space=preserve version=1.1 id=svg2><metadata id=metadata8><rdf:rdf><cc:work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource=http://purl.org/dc/dcmitype/StillImage></dc:type></cc:work></rdf:rdf></metadata><defs id=defs6><clippath id=clipPath22 clippathunits=userSpaceOnUse><path id=path24 d="M 0,360 504,360 504,0 0,0 0,360 Z"></path></clippath></defs><g transform=matrix(1.3333333,0,0,-1.3333333,0,480) id=g10><path id=path12 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 149.7,96.226 307.955,0 0,187.605 -307.955,0 0,-187.605 z"></path><g transform=translate(336.7241,87.1956) id=g14><path id=path16 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 0,0 1.844,-15.201 -67.021,0 L -63.333,0"></path></g><g id=g18><g clip-path=url(#clipPath22) id=g20><path id=path26 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none d="m 453.127,101.955 -294.327,0 0,177.573 294.327,0 0,-177.573 z m 6.224,192.692 -307.697,0 c -4.325,0 -7.831,-3.506 -7.831,-7.831 l 0,-191.387 c 0,-4.325 3.506,-7.831 7.831,-7.831 l 307.697,0 c 4.325,0 7.831,3.506 7.831,7.831 l 0,191.387 c 0,4.325 -3.506,7.831 -7.831,7.831"></path><path id=path28 style=fill:none;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 453.127,101.955 -294.327,0 0,177.573 294.327,0 0,-177.573 z m 6.224,192.692 -307.697,0 c -4.325,0 -7.831,-3.506 -7.831,-7.831 l 0,-191.387 c 0,-4.325 3.506,-7.831 7.831,-7.831 l 307.697,0 c 4.325,0 7.831,3.506 7.831,7.831 l 0,191.387 c 0,4.325 -3.506,7.831 -7.831,7.831 z"></path><path id=path30 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="m 439.78,246.574 -267.554,0 0,18.529 267.554,0 0,-18.529 z"></path><path id=path32 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="m 439.78,211.101 -127.689,0 0,20.829 127.689,0 0,-20.829 z"></path><path id=path34 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="m 439.78,116.651 -127.689,0 0,79.107 127.689,0 0,-79.107 z"></path><g transform=translate(161.8384,237.5872) id=g36><path id=path38 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none d="m 0,0 0.365,1.083 10.366,0 L 11.096,0 0,0 Z"></path></g><g transform=translate(161.8384,237.5872) id=g40><path id=path42 style=fill:none;stroke:#1f7edd;stroke-width:1.07700002;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 0,0 0.365,1.083 10.366,0 L 11.096,0 0,0 Z"></path></g><g transform=translate(181.2545,80.6501) id=g44><path id=path46 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none d="m 0,0 c 0,-5.044 -4.089,-9.132 -9.132,-9.132 l -101.757,0 c -5.044,0 -9.133,4.088 -9.133,9.132 l 0,147.981 c 0,5.043 4.089,9.132 9.133,9.132 l 101.757,0 c 5.043,0 9.132,-4.089 9.132,-9.132 L 0,0 Z"></path></g><g transform=translate(181.2545,80.6501) id=g48><path id=path50 style=fill:none;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 0,0 c 0,-5.044 -4.089,-9.132 -9.132,-9.132 l -101.757,0 c -5.044,0 -9.133,4.088 -9.133,9.132 l 0,147.981 c 0,5.043 4.089,9.132 9.133,9.132 l 101.757,0 c 5.043,0 9.132,-4.089 9.132,-9.132 L 0,0 Z"></path></g><g transform=translate(120.1088,80.1986) id=g52><path id=path54 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none d="m 0,0 c -2.651,0 -4.801,2.149 -4.801,4.8 0,2.652 2.15,4.801 4.801,4.801 C 2.651,9.601 4.8,7.452 4.8,4.8 4.8,2.149 2.651,0 0,0"></path></g><g transform=translate(120.1088,80.1986) id=g56><path id=path58 style=fill:none;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 0,0 c -2.651,0 -4.801,2.149 -4.801,4.8 0,2.652 2.15,4.801 4.801,4.801 C 2.651,9.601 4.8,7.452 4.8,4.8 4.8,2.149 2.651,0 0,0 Z"></path></g><path id=path60 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 168.079,99.251 -93.47,0 0,118.015 93.47,0 0,-118.015 z"></path><path id=path62 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="m 158.446,138.813 -74.404,0 0,65.772 74.404,0 0,-65.772 z"></path><g transform=translate(84.1422,101.8864) id=g64><path id=path66 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="m 0,0 0,28.367 74.404,0 0,-28.367"></path></g><g transform=translate(84.1422,120.2755) id=g68><path id=path70 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="M 0,0 74.217,0"></path></g><g transform=translate(182.7396,231.9295) id=g72><path id=path74 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="m 0,0 115.583,0 0,-115.278 -114.582,0"></path></g><g transform=translate(76.301,175.3721) id=g76><path id=path78 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none d="m 0,0 0.274,0.811 7.76,0 L 8.307,0 0,0 Z"></path></g><g transform=translate(76.301,175.3721) id=g80><path id=path82 style=fill:none;stroke:#1f7edd;stroke-width:1.07700002;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 0,0 0.274,0.811 7.76,0 L 8.307,0 0,0 Z"></path></g><g transform=translate(90.8368,78.3548) id=g84><path id=path86 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none d="m 0,0 c 0,-3.776 -3.061,-6.837 -6.837,-6.837 l -40.345,0 c -3.776,0 -6.837,3.061 -6.837,6.837 l 0,90.312 c 0,3.776 3.061,6.837 6.837,6.837 l 40.345,0 C -3.061,97.149 0,94.088 0,90.312 L 0,0 Z"></path></g><g transform=translate(90.8368,78.3548) id=g88><path id=path90 style=fill:none;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 0,0 c 0,-3.776 -3.061,-6.837 -6.837,-6.837 l -40.345,0 c -3.776,0 -6.837,3.061 -6.837,6.837 l 0,90.312 c 0,3.776 3.061,6.837 6.837,6.837 l 40.345,0 C -3.061,97.149 0,94.088 0,90.312 L 0,0 Z"></path></g><g transform=translate(62.9776,79.0229) id=g92><path id=path94 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none d="m 0,0 c -1.985,0 -3.594,1.609 -3.594,3.594 0,1.985 1.609,3.594 3.594,3.594 1.985,0 3.594,-1.609 3.594,-3.594 C 3.594,1.609 1.985,0 0,0"></path></g><g transform=translate(62.9776,79.0229) id=g96><path id=path98 style=fill:none;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 0,0 c -1.985,0 -3.594,1.609 -3.594,3.594 0,1.985 1.609,3.594 3.594,3.594 1.985,0 3.594,-1.609 3.594,-3.594 C 3.594,1.609 1.985,0 0,0 Z"></path></g><path id=path100 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#1f7edd;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 d="m 82.839,94.795 -37.874,0 0,65.363 37.874,0 0,-65.363 z"></path><path id=path102 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="m 74.228,122.038 -20.802,0 0,28.938 20.802,0 0,-28.938 z"></path><g transform=translate(53.4262,97.3435) id=g104><path id=path106 style=fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:#96d4ff;stroke-width:4;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1 class="transparent animated vpc-svg fadeIn fadeIn" data-vp-add-class=fadeIn d="m 0,0 0,14.638 20.802,0 0,-14.638"></path></g></g></g></g></svg></div></div></div></div></div><div ng-include="\'components/footer/footer.html\'"></div><script>particlesJS.load(\'particles-js\', \'assets/particles.json\', function() {\n    console.log(\'callback - particles.js config loaded\');\n  });</script>'),a.put("app/project/project.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><section class=padding-md><div class="container overflow"><div class=row><div class=col-xs-12><div class="step text-center ng-binding">Step {{transactionStep}} of 3<div class=progress><div ng-style="{ \'width\': transactionWidth}" class=progress-bar></div></div></div><!-- STEP 1--><div ng-if=!showStep2 class="step1 text-center"><h1 class=padding-xs>Sign our Non-Disclosure Agreement</h1><form name=step1 novalidate autocomplete=off><p class="lead gray-black">The confidentiality of your project is important to us.<br>By clicking accept, both you, and your company and<br>Hack Logica are agreeing to terms of an NDA to protect<br>all parties and materials disclosed.<br>To read all terms, &nbsp;<a href="" class=black-underline>click here</a>.</p><div class=padding-xs><!-- <div ng-class="{\'has-error\': !signupForm.agreeNDA.good &amp;&amp; step1.submitted}" class="checkbox">\n								<input type="checkbox" name="nda" id="nda" ng-model="signupForm.agreeNDA.value" ng-change="signupOnBlur(\'agreeNDA\')" class="ng-pristine ng-valid">\n								<label for="nda">I Agree to terms of the NDA</label>\n							</div> --><div class=checkbox><input type=checkbox name=nda id=nda class=no-float ng-click=activateNextButton()><label for=nda>I Agree to terms of the NDA</label></div></div><div class=padding-xs><!-- 	<button ng-click="step(2)" class="btn btn-primary fat ng-binding">Skip<i class="gf-angle-right"></i></button> --><button class="btn btn-primary fat ng-binding" ng-click=activateNextStep() ng-if=!showNextButton>Skip<i class=gf-angle-right></i></button> <button class="btn btn-primary fat ng-binding" ng-click=activateNextStep() ng-if=showNextButton ng-click="">Next<i class=gf-angle-right></i></button></div></form></div></div></div><!-- STEP 2--><div ng-if=showStep2 class="row step2"><div class="col-sm-8 col-sm-push-2"><!-- <div ng-controller="CreateGigCtrl" ng-include="\'partials/templates/createGig\'" hasprevious="true" class="ng-scope"> --><div hasprevious=true><h1 class="padding-xs text-center">Tell us about your project</h1><form name=createGig novalidate autocomplete=off><!-- <div ng-class="{\'has-error\': signupForm.what.err}" class="form-group">\n							<label for="name">Project name<p class="error-block pull-right ng-binding"></p></label>\n							<input type="text" placeholder="What is your project name." name="name" ng-model="signupForm.what.value" ng-blur="signupOnBlur(\'name\')" required="required" class="form-control ng-pristine ng-invalid ng-invalid-required">\n						</div> --><div class=form-group><label for=name>Project name<p class="error-block pull-right"></p></label><input placeholder="What is your project name." name=name required class=form-control></div><!-- <div ng-class="{\'has-error\': signupForm.budget.err}" class="form-group"> --><div class=form-group><label for=budget>Budget<p class="error-block pull-right"></p></label><div class=select><select class=form-control><option value="" disabled selected>Select a budget range.</option><option value=option-1>$1k - $2k</option><option value=option-2>$2k - $5k</option><option value=option-2>$5k - $10k</option><option value=option-2>$10k - $20k</option><option value=option-2>$20k+</option></select></div></div><!-- <div ng-class="{\'has-error\': signupForm.timeline.err}" class="form-group"> --><div class=form-group><label for=timeline>When do you want us to start<p class="error-block pull-right"></p></label><div class=select><select class=form-control><option value="" disabled selected>Select your start timeline.</option><option value=option-1>Now!</option><option value=option-2>1 week</option><option value=option-2>2 weeks</option><option value=option-2>1 month</option><option value=option-2>2 months</option></select></div></div><!-- <div ng-class="{\'has-error\': signupForm.platforms.err}" class="form-group"> --><div class=form-group><label for=platform>Platforms<p class="error-block pull-right"></p></label><div class=select><select class=form-control><option value="" disabled selected>Select platforms to build for.</option><option value=option-1>Web</option><option value=option-2>iOS</option><option value=option-2>Android</option></select></div></div><footer class=row><div class="col-xs-6 text-right col-xs-push-6"><!-- <button ng-click="next()" ng-class="{\'disabled\': !(canGoForward())}" class="btn fat btn-primary ng-binding disabled">Next<i class="gf-angle-right"></i></button> --><button class="btn fat btn-primary">Next<i class=gf-angle-right></i></button></div><div class="col-xs-6 text-left col-xs-pull-6"><!-- <button ng-click="previous()" ng-if="hasPrevious" class="btn fat none ng-scope"><i class="gf-angle-left"></i>Previous</button> --><button ng-click=showStep1() class="btn fat none ng-scope"><i class="fa fa-angle-left"></i>Previous</button></div></footer></form></div></div></div></div></section><!-- STEP 3--><!-- <div ng-show="currentStep === 3" class="row step3 ng-hide"><div class="col-sm-8 col-sm-push-2"><h1 class="padding-xs text-center">Create your account</h1><form name="step3" novalidate="novalidate" autocomplete="off" class="ng-pristine ng-invalid ng-invalid-required"><div ng-class="{\'has-error\': signupForm.email.err}" class="form-group"><label for="name">Email<p class="error-block pull-right ng-binding"></p></label><input type="text" placeholder="Enter email address" name="name" ng-model="signupForm.email.value" ng-blur="signupOnBlur(\'email\')" required="required" class="form-control ng-pristine ng-invalid ng-invalid-required"></div><div ng-class="{\'has-error\': signupForm.pass.err}" class="form-group"><label for="password">Password<p class="error-block pull-right ng-binding"></p></label><input type="password" placeholder="•••••••••••" name="password" ng-model="signupForm.pass.value" ng-blur="signupOnBlur(\'pass\')" required="required" class="form-control ng-pristine ng-invalid ng-invalid-required"></div><footer class="row"><div class="col-md-9 col-md-push-3 finish"><button ng-click="step(4)" ng-class="{\'disabled\': !(canGoToStep(4))}" class="btn fat-mini btn-primary disabled">Contact me later</button><label class="or text-center">OR</label><button ng-click="step(5)" ng-class="{\'disabled\': !(canGoToStep(5))}" class="btn fat-mini btn-primary disabled">Chat with gigster now</button></div><div class="col-md-3 col-md-pull-9 text-left"><button ng-click="step(2)" class="btn fat-mini none"><i class="gf-angle-left"></i>Previous</button></div></footer></form></div></div><div ng-show="currentStep === 4" class="row ng-hide"><div class="col-sm-10 col-sm-push-1 text-center"><h1>Welcome to Gigster. <br> We\'ll be in touch soon.</h1><div class="padding-sm"><img src="media/svg/characters.svg" class="max-width-100"></div></div></div></div></section> -->'),
a.put("components/footer/footer.html",'<footer class="site-footer ng-scope"><div class=container><div class="row widgets"><div class="col-xs-6 col-md-3 col-sm-6"><h4>Info</h4><ul class=list-unstyled><li><a href="">FAQ</a></li><li><a href="">Terms of Use</a></li><li><a href="">Privacy</a></li></ul></div><div class="col-xs-6 col-md-3 col-sm-6"><h4>Company</h4><ul class=list-unstyled><li><a href="">Who we are</a></li><!-- <li><a href="">Success stories</a></li> --><li><a href="">How it works</a></li><!-- <li><a ng-click="" ng-show="" href="">Join Hack Logica</a></li>\n					<li><a href="">Careers</a></li> --></ul></div><!-- <div class="clearfix visible-xs-block"></div> --><div class="col-xs-6 col-md-3 col-sm-6"><h4>Contact</h4><ul class=list-unstyled><!-- <li class="shy"><a href="mailto:contact@marcolavielle.com">contact@marcolavielle.com</a></li> --><li><a href=tel:0423478156>0423478156</a></li></ul></div><div class="col-xs-6 col-md-3 col-sm-6"><h4>Address</h4><address><ul class=list-unstyled><li>Hack Logica</li><li>212 Bondi Road</li><li>Sydney, NSW 2026</li></ul></address></div></div><div class="row copy"><div class="col-xs-6 col-sm-4"><img src="" title="Hack Logica"></div><div class="col-sm-4 copyright text-center"><h5>2015 Hack Logica</h5></div><!-- <div class="col-sm-4 social text-right">\n				<ul class="list-inline">\n					<li><a href="" target="_blank" class="btn btn-primary btn-sm"><i class="gf-facebook"></i></a></li>\n					<li><a href="" target="_blank" class="btn btn-primary btn-sm"><i class="gf-twitter"></i></a></li>\n					<li><a href="" target="_blank" class="btn btn-primary btn-sm"><i class="gf-gplus"></i></a></li>\n				</ul>\n			</div> --></div></div></footer>'),a.put("components/modal/modal.html",'<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'),a.put("components/navbar/navbar.html",'<div class="navbar navbar-default navbar-static-top" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click="isCollapsed = !isCollapsed"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href="/" class=navbar-brand>hack-logica</a></div><div collapse=isCollapsed class="navbar-collapse collapse" id=navbar-main><ul class="nav navbar-nav"><!-- <li ng-repeat="item in menu" ng-class="{active: isActive(item.link)}">\n            <a ng-href="{{item.link}}">{{item.title}}</a>\n        </li> --><li ng-show=isAdmin() ng-class="{active: isActive(\'/admin\')}"><a href=/admin>Admin</a></li></ul><ul class="nav navbar-nav navbar-right"><!-- <li ng-hide="isLoggedIn()" ng-class="{active: isActive(\'/signup\')}"><a href="/signup">Sign up</a></li> --><li ng-hide=isLoggedIn() ng-class="{active: isActive(\'/login\')}"><a href=/login>Login</a></li><li ng-show=isLoggedIn()><p class=navbar-text>Hello {{ getCurrentUser().name }}</p></li><li ng-show=isLoggedIn() ng-class="{active: isActive(\'/settings\')}"><a href=/settings><span class="glyphicon glyphicon-cog"></span></a></li><li ng-show=isLoggedIn() ng-class="{active: isActive(\'/logout\')}"><a href="" ng-click=logout()>Logout</a></li></ul></div></div></div>')}]);
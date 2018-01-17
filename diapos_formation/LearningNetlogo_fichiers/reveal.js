(function(root,factory){if(typeof define==='function'&&define.amd){define(function(){root.Reveal=factory();return root.Reveal;});}else if(typeof exports==='object'){module.exports=factory();}else{root.Reveal=factory();}}(this,function(){'use strict';var Reveal;var SLIDES_SELECTOR='.slides section',HORIZONTAL_SLIDES_SELECTOR='.slides>section',VERTICAL_SLIDES_SELECTOR='.slides>section.present>section',HOME_SLIDE_SELECTOR='.slides>section:first-of-type', config={
 width:960,height:700, margin:0.1, minScale:0.2,maxScale:1.5, controls:true, progress:true, slideNumber:false, history:false, keyboard:true, keyboardCondition:null, overview:true, center:true, touch:true, loop:false, rtl:false, fragments:true, embedded:false,
 help:true,pause:true,

 autoSlide:0, autoSlideStoppable:true, mouseWheel:false, rollingLinks:false, hideAddressBar:true, previewLinks:false, postMessage:true, postMessageEvents:false, focusBodyOnPageVisibilityChange:true, transition:'slide',
 transitionSpeed:'default',
 backgroundTransition:'fade',
 parallaxBackgroundImage:'', parallaxBackgroundSize:'', parallaxBackgroundHorizontal:null,parallaxBackgroundVertical:null, viewDistance:3, dependencies:[]},loaded=false, overview=false, indexh,indexv, previousSlide,currentSlide,previousBackground,

state=[],scale=1, slidesTransform={layout:'',overview:''}, dom={},features={},isMobileDevice, lastMouseWheelStep=0, writeURLTimeout=0, eventsAreBound=false, autoSlide=0, autoSlidePlayer,autoSlideTimeout=0,autoSlideStartTime=-1,autoSlidePaused=false, touch={startX:0,startY:0,startSpan:0,startCount:0,captured:false,threshold:40}, keyboardShortcuts={'N  ,  SPACE':'Next slide','P':'Previous slide','&#8592;  ,  H':'Navigate left','&#8594;  ,  L':'Navigate right','&#8593;  ,  K':'Navigate up','&#8595;  ,  J':'Navigate down','Home':'First slide','End':'Last slide','B  ,  .':'Pause','F':'Fullscreen','ESC, O':'Slide overview'};function initialize(options){checkCapabilities();if(!features.transforms2d&&!features.transforms3d){document.body.setAttribute('class','no-transforms');
 var images=toArray(document.getElementsByTagName('img')),iframes=toArray(document.getElementsByTagName('iframe'));var lazyLoadable=images.concat(iframes);for(var i=0,len=lazyLoadable.length;i<len;i++){var element=lazyLoadable[i];if(element.getAttribute('data-src')){element.setAttribute('src',element.getAttribute('data-src'));element.removeAttribute('data-src');}}
 
return;} 
dom.wrapper=document.querySelector('.reveal');dom.slides=document.querySelector('.reveal .slides'); window.addEventListener('load',layout,false);var query=Reveal.getQueryHash();
 if(typeof query['dependencies']!=='undefined')delete query['dependencies']; extend(config,options);extend(config,query); hideAddressBar(); load();}
function checkCapabilities(){features.transforms3d='WebkitPerspective'in document.body.style||'MozPerspective'in document.body.style||'msPerspective'in document.body.style||'OPerspective'in document.body.style||'perspective'in document.body.style;features.transforms2d='WebkitTransform'in document.body.style||'MozTransform'in document.body.style||'msTransform'in document.body.style||'OTransform'in document.body.style||'transform'in document.body.style;features.requestAnimationFrameMethod=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;features.requestAnimationFrame=typeof features.requestAnimationFrameMethod==='function';features.canvas=!!document.createElement('canvas').getContext;features.touch=!!('ontouchstart'in window);
 features.overviewTransitions=!/Version\/[\d\.]+.*Safari/.test(navigator.userAgent);isMobileDevice=/(iphone|ipod|ipad|android)/gi.test(navigator.userAgent);}
function load(){var scripts=[],scriptsAsync=[],scriptsToPreload=0; function proceed(){if(scriptsAsync.length){ head.js.apply(null,scriptsAsync);}
start();}
function loadScript(s){head.ready(s.src.match(/([\w\d_\-]*)\.?js$|[^\\\/]*$/i)[0],function(){ if(typeof s.callback==='function'){s.callback.apply(this);}
if(--scriptsToPreload===0){proceed();}});}
for(var i=0,len=config.dependencies.length;i<len;i++){var s=config.dependencies[i]; if(!s.condition||s.condition()){if(s.async){scriptsAsync.push(s.src);}
else{scripts.push(s.src);}
loadScript(s);}}
if(scripts.length){scriptsToPreload=scripts.length; head.js.apply(null,scripts);}
else{proceed();}}
function start(){ setupDOM(); setupPostMessage(); setupIframeScrollPrevention(); resetVerticalSlides(); configure(); readURL(); updateBackground(true);
setTimeout(function(){ dom.slides.classList.remove('no-transition');loaded=true;dispatchEvent('ready',{'indexh':indexh,'indexv':indexv,'currentSlide':currentSlide});},1); if(isPrintingPDF()){removeEventListeners();
 if(document.readyState==='complete'){setupPDF();}
else{window.addEventListener('load',setupPDF);}}}
function setupDOM(){ dom.slides.classList.add('no-transition'); dom.background=createSingletonNode(dom.wrapper,'div','backgrounds',null); dom.progress=createSingletonNode(dom.wrapper,'div','progress','<span></span>');dom.progressbar=dom.progress.querySelector('span'); createSingletonNode(dom.wrapper,'aside','controls','<div class="navigate-left"></div>'+'<div class="navigate-right"></div>'+'<div class="navigate-up"></div>'+'<div class="navigate-down"></div>'); dom.slideNumber=createSingletonNode(dom.wrapper,'div','slide-number',''); createSingletonNode(dom.wrapper,'div','pause-overlay',null); dom.controls=document.querySelector('.reveal .controls');dom.theme=document.querySelector('#theme');dom.wrapper.setAttribute('role','application'); dom.controlsLeft=toArray(document.querySelectorAll('.navigate-left'));dom.controlsRight=toArray(document.querySelectorAll('.navigate-right'));dom.controlsUp=toArray(document.querySelectorAll('.navigate-up'));dom.controlsDown=toArray(document.querySelectorAll('.navigate-down'));dom.controlsPrev=toArray(document.querySelectorAll('.navigate-prev'));dom.controlsNext=toArray(document.querySelectorAll('.navigate-next'));dom.statusDiv=createStatusDiv();}
function createStatusDiv(){var statusDiv=document.getElementById('aria-status-div');if(!statusDiv){statusDiv=document.createElement('div');statusDiv.style.position='absolute';statusDiv.style.height='1px';statusDiv.style.width='1px';statusDiv.style.overflow='hidden';statusDiv.style.clip='rect( 1px, 1px, 1px, 1px )';statusDiv.setAttribute('id','aria-status-div');statusDiv.setAttribute('aria-live','polite');statusDiv.setAttribute('aria-atomic','true');dom.wrapper.appendChild(statusDiv);}
return statusDiv;}
function setupPDF(){var slideSize=getComputedSlideSize(window.innerWidth,window.innerHeight); var pageWidth=Math.floor(slideSize.width*(1+config.margin)),pageHeight=Math.floor(slideSize.height*(1+config.margin)); var slideWidth=slideSize.width,slideHeight=slideSize.height; injectStyleSheet('@page{size:'+pageWidth+'px '+pageHeight+'px; margin: 0;}'); injectStyleSheet('.reveal section>img, .reveal section>video, .reveal section>iframe{max-width: '+slideWidth+'px; max-height:'+slideHeight+'px}');document.body.classList.add('print-pdf');document.body.style.width=pageWidth+'px';document.body.style.height=pageHeight+'px'; toArray(dom.wrapper.querySelectorAll(SLIDES_SELECTOR)).forEach(function(slide){
 if(slide.classList.contains('stack')===false){ var left=(pageWidth-slideWidth)/2,top=(pageHeight-slideHeight)/2;var contentHeight=getAbsoluteHeight(slide);var numberOfPages=Math.max(Math.ceil(contentHeight/pageHeight),1); if(numberOfPages===1&&config.center||slide.classList.contains('center')){top=Math.max((pageHeight-contentHeight)/2,0);} 
slide.style.left=left+'px';slide.style.top=top+'px';slide.style.width=slideWidth+'px';
 var background=slide.querySelector('.slide-background');if(background){background.style.width=pageWidth+'px';background.style.height=(pageHeight*numberOfPages)+'px';background.style.top=-top+'px';background.style.left=-left+'px';}}}); toArray(dom.wrapper.querySelectorAll(SLIDES_SELECTOR+' .fragment')).forEach(function(fragment){fragment.classList.add('visible');});}
function setupIframeScrollPrevention(){if(dom.slides.querySelector('iframe')){setInterval(function(){if(dom.wrapper.scrollTop!==0||dom.wrapper.scrollLeft!==0){dom.wrapper.scrollTop=0;dom.wrapper.scrollLeft=0;}},500);}}
function createSingletonNode(container,tagname,classname,innerHTML){ var nodes=container.querySelectorAll('.'+classname);
 for(var i=0;i<nodes.length;i++){var testNode=nodes[i];if(testNode.parentNode===container){return testNode;}} 
var node=document.createElement(tagname);node.classList.add(classname);if(typeof innerHTML==='string'){node.innerHTML=innerHTML;}
container.appendChild(node);return node;}
function createBackgrounds(){var printMode=isPrintingPDF(); dom.background.innerHTML='';dom.background.classList.add('no-transition'); toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR)).forEach(function(slideh){var backgroundStack;if(printMode){backgroundStack=createBackground(slideh,slideh);}
else{backgroundStack=createBackground(slideh,dom.background);} 
toArray(slideh.querySelectorAll('section')).forEach(function(slidev){if(printMode){createBackground(slidev,slidev);}
else{createBackground(slidev,backgroundStack);}
backgroundStack.classList.add('stack');});}); if(config.parallaxBackgroundImage){dom.background.style.backgroundImage='url("'+config.parallaxBackgroundImage+'")';dom.background.style.backgroundSize=config.parallaxBackgroundSize;


 setTimeout(function(){dom.wrapper.classList.add('has-parallax-background');},1);}
else{dom.background.style.backgroundImage='';dom.wrapper.classList.remove('has-parallax-background');}}
function createBackground(slide,container){var data={background:slide.getAttribute('data-background'),backgroundSize:slide.getAttribute('data-background-size'),backgroundImage:slide.getAttribute('data-background-image'),backgroundVideo:slide.getAttribute('data-background-video'),backgroundIframe:slide.getAttribute('data-background-iframe'),backgroundColor:slide.getAttribute('data-background-color'),backgroundRepeat:slide.getAttribute('data-background-repeat'),backgroundPosition:slide.getAttribute('data-background-position'),backgroundTransition:slide.getAttribute('data-background-transition')};var element=document.createElement('div'); element.className='slide-background '+slide.className.replace(/present|past|future/,'');if(data.background){if(/^(http|file|\/\/)/gi.test(data.background)||/\.(svg|png|jpg|jpeg|gif|bmp)$/gi.test(data.background)){slide.setAttribute('data-background-image',data.background);}
else{element.style.background=data.background;}}

if(data.background||data.backgroundColor||data.backgroundImage||data.backgroundVideo||data.backgroundIframe){element.setAttribute('data-background-hash',data.background+
data.backgroundSize+
data.backgroundImage+
data.backgroundVideo+
data.backgroundIframe+
data.backgroundColor+
data.backgroundRepeat+
data.backgroundPosition+
data.backgroundTransition);} 
if(data.backgroundSize)element.style.backgroundSize=data.backgroundSize;if(data.backgroundColor)element.style.backgroundColor=data.backgroundColor;if(data.backgroundRepeat)element.style.backgroundRepeat=data.backgroundRepeat;if(data.backgroundPosition)element.style.backgroundPosition=data.backgroundPosition;if(data.backgroundTransition)element.setAttribute('data-background-transition',data.backgroundTransition);container.appendChild(element); slide.classList.remove('has-dark-background');slide.classList.remove('has-light-background');

 var computedBackgroundColor=window.getComputedStyle(element).backgroundColor;if(computedBackgroundColor){var rgb=colorToRgb(computedBackgroundColor);

 if(rgb&&rgb.a!==0){if(colorBrightness(computedBackgroundColor)<128){slide.classList.add('has-dark-background');}
else{slide.classList.add('has-light-background');}}}
return element;}
function setupPostMessage(){if(config.postMessage){window.addEventListener('message',function(event){var data=event.data; if(typeof data==='string'&&data.charAt(0)==='{'&&data.charAt(data.length-1)==='}'){data=JSON.parse(data); if(data.method&&typeof Reveal[data.method]==='function'){Reveal[data.method].apply(Reveal,data.args);}}},false);}}
function configure(options){var numberOfSlides=dom.wrapper.querySelectorAll(SLIDES_SELECTOR).length;dom.wrapper.classList.remove(config.transition);
 if(typeof options==='object')extend(config,options); if(features.transforms3d===false)config.transition='linear';dom.wrapper.classList.add(config.transition);dom.wrapper.setAttribute('data-transition-speed',config.transitionSpeed);dom.wrapper.setAttribute('data-background-transition',config.backgroundTransition);dom.controls.style.display=config.controls?'block':'none';dom.progress.style.display=config.progress?'block':'none';if(config.rtl){dom.wrapper.classList.add('rtl');}
else{dom.wrapper.classList.remove('rtl');}
if(config.center){dom.wrapper.classList.add('center');}
else{dom.wrapper.classList.remove('center');} 
if(config.pause===false){resume();}
if(config.mouseWheel){document.addEventListener('DOMMouseScroll',onDocumentMouseScroll,false); document.addEventListener('mousewheel',onDocumentMouseScroll,false);}
else{document.removeEventListener('DOMMouseScroll',onDocumentMouseScroll,false); document.removeEventListener('mousewheel',onDocumentMouseScroll,false);} 
if(config.rollingLinks){enableRollingLinks();}
else{disableRollingLinks();} 
if(config.previewLinks){enablePreviewLinks();}
else{disablePreviewLinks();enablePreviewLinks('[data-preview-link]');} 
if(autoSlidePlayer){autoSlidePlayer.destroy();autoSlidePlayer=null;} 
if(numberOfSlides>1&&config.autoSlide&&config.autoSlideStoppable&&features.canvas&&features.requestAnimationFrame){autoSlidePlayer=new Playback(dom.wrapper,function(){return Math.min(Math.max((Date.now()-autoSlideStartTime)/autoSlide,0),1);});autoSlidePlayer.on('click',onAutoSlidePlayerClick);autoSlidePaused=false;} 
if(config.fragments===false){toArray(dom.slides.querySelectorAll('.fragment')).forEach(function(element){element.classList.add('visible');element.classList.remove('current-fragment');});}
sync();}
function addEventListeners(){eventsAreBound=true;window.addEventListener('hashchange',onWindowHashChange,false);window.addEventListener('resize',onWindowResize,false);if(config.touch){dom.wrapper.addEventListener('touchstart',onTouchStart,false);dom.wrapper.addEventListener('touchmove',onTouchMove,false);dom.wrapper.addEventListener('touchend',onTouchEnd,false); if(window.navigator.pointerEnabled){ dom.wrapper.addEventListener('pointerdown',onPointerDown,false);dom.wrapper.addEventListener('pointermove',onPointerMove,false);dom.wrapper.addEventListener('pointerup',onPointerUp,false);}
else if(window.navigator.msPointerEnabled){ dom.wrapper.addEventListener('MSPointerDown',onPointerDown,false);dom.wrapper.addEventListener('MSPointerMove',onPointerMove,false);dom.wrapper.addEventListener('MSPointerUp',onPointerUp,false);}}
if(config.keyboard){document.addEventListener('keydown',onDocumentKeyDown,false);document.addEventListener('keypress',onDocumentKeyPress,false);}
if(config.progress&&dom.progress){dom.progress.addEventListener('click',onProgressClicked,false);}
if(config.focusBodyOnPageVisibilityChange){var visibilityChange;if('hidden'in document){visibilityChange='visibilitychange';}
else if('msHidden'in document){visibilityChange='msvisibilitychange';}
else if('webkitHidden'in document){visibilityChange='webkitvisibilitychange';}
if(visibilityChange){document.addEventListener(visibilityChange,onPageVisibilityChange,false);}}
 
var pointerEvents=['touchstart','click'];
 if(navigator.userAgent.match(/android/gi)){pointerEvents=['touchstart'];}
pointerEvents.forEach(function(eventName){dom.controlsLeft.forEach(function(el){el.addEventListener(eventName,onNavigateLeftClicked,false);});dom.controlsRight.forEach(function(el){el.addEventListener(eventName,onNavigateRightClicked,false);});dom.controlsUp.forEach(function(el){el.addEventListener(eventName,onNavigateUpClicked,false);});dom.controlsDown.forEach(function(el){el.addEventListener(eventName,onNavigateDownClicked,false);});dom.controlsPrev.forEach(function(el){el.addEventListener(eventName,onNavigatePrevClicked,false);});dom.controlsNext.forEach(function(el){el.addEventListener(eventName,onNavigateNextClicked,false);});});}
function removeEventListeners(){eventsAreBound=false;document.removeEventListener('keydown',onDocumentKeyDown,false);document.removeEventListener('keypress',onDocumentKeyPress,false);window.removeEventListener('hashchange',onWindowHashChange,false);window.removeEventListener('resize',onWindowResize,false);dom.wrapper.removeEventListener('touchstart',onTouchStart,false);dom.wrapper.removeEventListener('touchmove',onTouchMove,false);dom.wrapper.removeEventListener('touchend',onTouchEnd,false); if(window.navigator.pointerEnabled){dom.wrapper.removeEventListener('pointerdown',onPointerDown,false);dom.wrapper.removeEventListener('pointermove',onPointerMove,false);dom.wrapper.removeEventListener('pointerup',onPointerUp,false);} 
else if(window.navigator.msPointerEnabled){dom.wrapper.removeEventListener('MSPointerDown',onPointerDown,false);dom.wrapper.removeEventListener('MSPointerMove',onPointerMove,false);dom.wrapper.removeEventListener('MSPointerUp',onPointerUp,false);}
if(config.progress&&dom.progress){dom.progress.removeEventListener('click',onProgressClicked,false);}
['touchstart','click'].forEach(function(eventName){dom.controlsLeft.forEach(function(el){el.removeEventListener(eventName,onNavigateLeftClicked,false);});dom.controlsRight.forEach(function(el){el.removeEventListener(eventName,onNavigateRightClicked,false);});dom.controlsUp.forEach(function(el){el.removeEventListener(eventName,onNavigateUpClicked,false);});dom.controlsDown.forEach(function(el){el.removeEventListener(eventName,onNavigateDownClicked,false);});dom.controlsPrev.forEach(function(el){el.removeEventListener(eventName,onNavigatePrevClicked,false);});dom.controlsNext.forEach(function(el){el.removeEventListener(eventName,onNavigateNextClicked,false);});});}
function extend(a,b){for(var i in b){a[i]=b[i];}}
function toArray(o){return Array.prototype.slice.call(o);}
function deserialize(value){if(typeof value==='string'){if(value==='null')return null;else if(value==='true')return true;else if(value==='false')return false;else if(value.match(/^\d+$/))return parseFloat(value);}
return value;}
function distanceBetween(a,b){var dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy);}
function transformElement(element,transform){element.style.WebkitTransform=transform;element.style.MozTransform=transform;element.style.msTransform=transform;element.style.transform=transform;}
function transformSlides(transforms){ if(typeof transforms.layout==='string')slidesTransform.layout=transforms.layout;if(typeof transforms.overview==='string')slidesTransform.overview=transforms.overview; if(slidesTransform.layout){transformElement(dom.slides,slidesTransform.layout+' '+slidesTransform.overview);}
else{transformElement(dom.slides,slidesTransform.overview);}}
function injectStyleSheet(value){var tag=document.createElement('style');tag.type='text/css';if(tag.styleSheet){tag.styleSheet.cssText=value;}
else{tag.appendChild(document.createTextNode(value));}
document.getElementsByTagName('head')[0].appendChild(tag);}
function colorToRgb(color){var hex3=color.match(/^#([0-9a-f]{3})$/i);if(hex3&&hex3[1]){hex3=hex3[1];return{r:parseInt(hex3.charAt(0),16)*0x11,g:parseInt(hex3.charAt(1),16)*0x11,b:parseInt(hex3.charAt(2),16)*0x11};}
var hex6=color.match(/^#([0-9a-f]{6})$/i);if(hex6&&hex6[1]){hex6=hex6[1];return{r:parseInt(hex6.substr(0,2),16),g:parseInt(hex6.substr(2,2),16),b:parseInt(hex6.substr(4,2),16)};}
var rgb=color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);if(rgb){return{r:parseInt(rgb[1],10),g:parseInt(rgb[2],10),b:parseInt(rgb[3],10)};}
var rgba=color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*([\d]+|[\d]*.[\d]+)\s*\)$/i);if(rgba){return{r:parseInt(rgba[1],10),g:parseInt(rgba[2],10),b:parseInt(rgba[3],10),a:parseFloat(rgba[4])};}
return null;}
function colorBrightness(color){if(typeof color==='string')color=colorToRgb(color);if(color){return(color.r*299+color.g*587+color.b*114)/1000;}
return null;}
function getAbsoluteHeight(element){var height=0;if(element){var absoluteChildren=0;toArray(element.childNodes).forEach(function(child){if(typeof child.offsetTop==='number'&&child.style){ if(window.getComputedStyle(child).position==='absolute'){absoluteChildren+=1;}
height=Math.max(height,child.offsetTop+child.offsetHeight);}}); if(absoluteChildren===0){height=element.offsetHeight;}}
return height;}
function getRemainingHeight(element,height){height=height||0;if(element){var newHeight,oldHeight=element.style.height;
 element.style.height='0px';newHeight=height-element.parentNode.offsetHeight; element.style.height=oldHeight+'px';return newHeight;}
return height;}
function isPrintingPDF(){return(/print-pdf/gi).test(window.location.search);}
function hideAddressBar(){if(config.hideAddressBar&&isMobileDevice){ window.addEventListener('load',removeAddressBar,false);window.addEventListener('orientationchange',removeAddressBar,false);}}
function removeAddressBar(){setTimeout(function(){window.scrollTo(0,1);},10);}
function dispatchEvent(type,args){var event=document.createEvent('HTMLEvents',1,2);event.initEvent(type,true,true);extend(event,args);dom.wrapper.dispatchEvent(event);
 if(config.postMessageEvents&&window.parent!==window.self){window.parent.postMessage(JSON.stringify({namespace:'reveal',eventName:type,state:getState()}),'*');}}
function enableRollingLinks(){if(features.transforms3d&&!('msPerspective'in document.body.style)){var anchors=dom.wrapper.querySelectorAll(SLIDES_SELECTOR+' a');for(var i=0,len=anchors.length;i<len;i++){var anchor=anchors[i];if(anchor.textContent&&!anchor.querySelector('*')&&(!anchor.className||!anchor.classList.contains(anchor,'roll'))){var span=document.createElement('span');span.setAttribute('data-title',anchor.text);span.innerHTML=anchor.innerHTML;anchor.classList.add('roll');anchor.innerHTML='';anchor.appendChild(span);}}}}
function disableRollingLinks(){var anchors=dom.wrapper.querySelectorAll(SLIDES_SELECTOR+' a.roll');for(var i=0,len=anchors.length;i<len;i++){var anchor=anchors[i];var span=anchor.querySelector('span');if(span){anchor.classList.remove('roll');anchor.innerHTML=span.innerHTML;}}}
function enablePreviewLinks(selector){var anchors=toArray(document.querySelectorAll(selector?selector:'a'));anchors.forEach(function(element){if(/^(http|www)/gi.test(element.getAttribute('href'))){element.addEventListener('click',onPreviewLinkClicked,false);}});}
function disablePreviewLinks(){var anchors=toArray(document.querySelectorAll('a'));anchors.forEach(function(element){if(/^(http|www)/gi.test(element.getAttribute('href'))){element.removeEventListener('click',onPreviewLinkClicked,false);}});}
function showPreview(url){closeOverlay();dom.overlay=document.createElement('div');dom.overlay.classList.add('overlay');dom.overlay.classList.add('overlay-preview');dom.wrapper.appendChild(dom.overlay);dom.overlay.innerHTML=['<header>','<a class="close" href="#"><span class="icon"></span></a>','<a class="external" href="'+url+'" target="_blank"><span class="icon"></span></a>','</header>','<div class="spinner"></div>','<div class="viewport">','<iframe src="'+url+'"></iframe>','</div>'].join('');dom.overlay.querySelector('iframe').addEventListener('load',function(event){dom.overlay.classList.add('loaded');},false);dom.overlay.querySelector('.close').addEventListener('click',function(event){closeOverlay();event.preventDefault();},false);dom.overlay.querySelector('.external').addEventListener('click',function(event){closeOverlay();},false);setTimeout(function(){dom.overlay.classList.add('visible');},1);}
function showHelp(){if(config.help){closeOverlay();dom.overlay=document.createElement('div');dom.overlay.classList.add('overlay');dom.overlay.classList.add('overlay-help');dom.wrapper.appendChild(dom.overlay);var html='<p class="title">Keyboard Shortcuts</p><br/>';html+='<table><th>KEY</th><th>ACTION</th>';for(var key in keyboardShortcuts){html+='<tr><td>'+key+'</td><td>'+keyboardShortcuts[key]+'</td></tr>';}
html+='</table>';dom.overlay.innerHTML=['<header>','<a class="close" href="#"><span class="icon"></span></a>','</header>','<div class="viewport">','<div class="viewport-inner">'+html+'</div>','</div>'].join('');dom.overlay.querySelector('.close').addEventListener('click',function(event){closeOverlay();event.preventDefault();},false);setTimeout(function(){dom.overlay.classList.add('visible');},1);}}
function closeOverlay(){if(dom.overlay){dom.overlay.parentNode.removeChild(dom.overlay);dom.overlay=null;}}
function layout(){if(dom.wrapper&&!isPrintingPDF()){var size=getComputedSlideSize();var slidePadding=20;
 layoutSlideContents(config.width,config.height,slidePadding);dom.slides.style.width=size.width+'px';dom.slides.style.height=size.height+'px'; scale=Math.min(size.presentationWidth/size.width,size.presentationHeight/size.height); scale=Math.max(scale,config.minScale);scale=Math.min(scale,config.maxScale); if(scale===1){dom.slides.style.zoom='';dom.slides.style.left='';dom.slides.style.top='';dom.slides.style.bottom='';dom.slides.style.right='';transformSlides({layout:''});}
else{ if(!isMobileDevice&&/chrome/i.test(navigator.userAgent)&&typeof dom.slides.style.zoom!=='undefined'){dom.slides.style.zoom=scale;transformSlides({layout:''});} 
else{dom.slides.style.left='50%';dom.slides.style.top='50%';dom.slides.style.bottom='auto';dom.slides.style.right='auto';transformSlides({layout:'translate(-50%, -50%) scale('+scale+')'});}} 
var slides=toArray(dom.wrapper.querySelectorAll(SLIDES_SELECTOR));for(var i=0,len=slides.length;i<len;i++){var slide=slides[i]; if(slide.style.display==='none'){continue;}
if(config.center||slide.classList.contains('center')){
 if(slide.classList.contains('stack')){slide.style.top=0;}
else{slide.style.top=Math.max(((size.height-getAbsoluteHeight(slide))/2)-slidePadding,0)+'px';}}
else{slide.style.top='';}}
updateProgress();updateParallax();}}
function layoutSlideContents(width,height,padding){ toArray(dom.slides.querySelectorAll('section > .stretch')).forEach(function(element){ var remainingHeight=getRemainingHeight(element,height); if(/(img|video)/gi.test(element.nodeName)){var nw=element.naturalWidth||element.videoWidth,nh=element.naturalHeight||element.videoHeight;var es=Math.min(width/nw,remainingHeight/nh);element.style.width=(nw*es)+'px';element.style.height=(nh*es)+'px';}
else{element.style.width=width+'px';element.style.height=remainingHeight+'px';}});}
function getComputedSlideSize(presentationWidth,presentationHeight){var size={ width:config.width,height:config.height, presentationWidth:presentationWidth||dom.wrapper.offsetWidth,presentationHeight:presentationHeight||dom.wrapper.offsetHeight}; size.presentationWidth-=(size.presentationWidth*config.margin);size.presentationHeight-=(size.presentationHeight*config.margin); if(typeof size.width==='string'&&/%$/.test(size.width)){size.width=parseInt(size.width,10)/100*size.presentationWidth;} 
if(typeof size.height==='string'&&/%$/.test(size.height)){size.height=parseInt(size.height,10)/100*size.presentationHeight;}
return size;}
function setPreviousVerticalIndex(stack,v){if(typeof stack==='object'&&typeof stack.setAttribute==='function'){stack.setAttribute('data-previous-indexv',v||0);}}
function getPreviousVerticalIndex(stack){if(typeof stack==='object'&&typeof stack.setAttribute==='function'&&stack.classList.contains('stack')){ var attributeName=stack.hasAttribute('data-start-indexv')?'data-start-indexv':'data-previous-indexv';return parseInt(stack.getAttribute(attributeName)||0,10);}
return 0;}
function activateOverview(){ if(config.overview&&!isOverview()){overview=true;dom.wrapper.classList.add('overview');dom.wrapper.classList.remove('overview-deactivating');if(features.overviewTransitions){setTimeout(function(){dom.wrapper.classList.add('overview-animated');},1);} 
cancelAutoSlide();
 dom.slides.appendChild(dom.background); toArray(dom.wrapper.querySelectorAll(SLIDES_SELECTOR)).forEach(function(slide){if(!slide.classList.contains('stack')){slide.addEventListener('click',onOverviewSlideClicked,true);}});updateSlidesVisibility();layoutOverview();updateOverview();layout(); dispatchEvent('overviewshown',{'indexh':indexh,'indexv':indexv,'currentSlide':currentSlide});}}
function layoutOverview(){var margin=70;var slideWidth=config.width+margin,slideHeight=config.height+margin; if(config.rtl){slideWidth=-slideWidth;} 
toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR)).forEach(function(hslide,h){hslide.setAttribute('data-index-h',h);transformElement(hslide,'translate3d('+(h*slideWidth)+'px, 0, 0)');if(hslide.classList.contains('stack')){toArray(hslide.querySelectorAll('section')).forEach(function(vslide,v){vslide.setAttribute('data-index-h',h);vslide.setAttribute('data-index-v',v);transformElement(vslide,'translate3d(0, '+(v*slideHeight)+'px, 0)');});}}); toArray(dom.background.childNodes).forEach(function(hbackground,h){transformElement(hbackground,'translate3d('+(h*slideWidth)+'px, 0, 0)');toArray(hbackground.querySelectorAll('.slide-background')).forEach(function(vbackground,v){transformElement(vbackground,'translate3d(0, '+(v*slideHeight)+'px, 0)');});});}
function updateOverview(){var margin=70;var slideWidth=config.width+margin,slideHeight=config.height+margin; if(config.rtl){slideWidth=-slideWidth;}
transformSlides({overview:['translateX('+(-indexh*slideWidth)+'px)','translateY('+(-indexv*slideHeight)+'px)','translateZ('+(window.innerWidth<400?-1000:-2500)+'px)'].join(' ')});}
function deactivateOverview(){ if(config.overview){overview=false;dom.wrapper.classList.remove('overview');dom.wrapper.classList.remove('overview-animated');

 dom.wrapper.classList.add('overview-deactivating');setTimeout(function(){dom.wrapper.classList.remove('overview-deactivating');},1); dom.wrapper.appendChild(dom.background); toArray(dom.wrapper.querySelectorAll(SLIDES_SELECTOR)).forEach(function(slide){transformElement(slide,'');slide.removeEventListener('click',onOverviewSlideClicked,true);}); toArray(dom.background.querySelectorAll('.slide-background')).forEach(function(background){transformElement(background,'');});transformSlides({overview:''});slide(indexh,indexv);layout();cueAutoSlide(); dispatchEvent('overviewhidden',{'indexh':indexh,'indexv':indexv,'currentSlide':currentSlide});}}
function toggleOverview(override){if(typeof override==='boolean'){override?activateOverview():deactivateOverview();}
else{isOverview()?deactivateOverview():activateOverview();}}
function isOverview(){return overview;}
function isVerticalSlide(slide){ slide=slide?slide:currentSlide;return slide&&slide.parentNode&&!!slide.parentNode.nodeName.match(/section/i);}
function enterFullscreen(){var element=document.body; var requestMethod=element.requestFullScreen||element.webkitRequestFullscreen||element.webkitRequestFullScreen||element.mozRequestFullScreen||element.msRequestFullscreen;if(requestMethod){requestMethod.apply(element);}}
function pause(){if(config.pause){var wasPaused=dom.wrapper.classList.contains('paused');cancelAutoSlide();dom.wrapper.classList.add('paused');if(wasPaused===false){dispatchEvent('paused');}}}
function resume(){var wasPaused=dom.wrapper.classList.contains('paused');dom.wrapper.classList.remove('paused');cueAutoSlide();if(wasPaused){dispatchEvent('resumed');}}
function togglePause(override){if(typeof override==='boolean'){override?pause():resume();}
else{isPaused()?resume():pause();}}
function isPaused(){return dom.wrapper.classList.contains('paused');}
function toggleAutoSlide(override){if(typeof override==='boolean'){override?resumeAutoSlide():pauseAutoSlide();}
else{autoSlidePaused?resumeAutoSlide():pauseAutoSlide();}}
function isAutoSliding(){return!!(autoSlide&&!autoSlidePaused);}
function slide(h,v,f,o){ previousSlide=currentSlide; var horizontalSlides=dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR);
 if(v===undefined&&!isOverview()){v=getPreviousVerticalIndex(horizontalSlides[h]);}
 
if(previousSlide&&previousSlide.parentNode&&previousSlide.parentNode.classList.contains('stack')){setPreviousVerticalIndex(previousSlide.parentNode,indexv);} 
var stateBefore=state.concat(); state.length=0;var indexhBefore=indexh||0,indexvBefore=indexv||0; indexh=updateSlides(HORIZONTAL_SLIDES_SELECTOR,h===undefined?indexh:h);indexv=updateSlides(VERTICAL_SLIDES_SELECTOR,v===undefined?indexv:v); updateSlidesVisibility();layout(); stateLoop:for(var i=0,len=state.length;i<len;i++){
 for(var j=0;j<stateBefore.length;j++){if(stateBefore[j]===state[i]){stateBefore.splice(j,1);continue stateLoop;}}
document.documentElement.classList.add(state[i]); dispatchEvent(state[i]);} 
while(stateBefore.length){document.documentElement.classList.remove(stateBefore.pop());} 
if(isOverview()){updateOverview();}
 
var currentHorizontalSlide=horizontalSlides[indexh],currentVerticalSlides=currentHorizontalSlide.querySelectorAll('section'); currentSlide=currentVerticalSlides[indexv]||currentHorizontalSlide; if(typeof f!=='undefined'){navigateFragment(f);} 
var slideChanged=(indexh!==indexhBefore||indexv!==indexvBefore);if(slideChanged){dispatchEvent('slidechanged',{'indexh':indexh,'indexv':indexv,'previousSlide':previousSlide,'currentSlide':currentSlide,'origin':o});}
else{ previousSlide=null;}

 
if(previousSlide){previousSlide.classList.remove('present');previousSlide.setAttribute('aria-hidden','true');
 if(dom.wrapper.querySelector(HOME_SLIDE_SELECTOR).classList.contains('present')){ setTimeout(function(){var slides=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR+'.stack')),i;for(i in slides){if(slides[i]){ setPreviousVerticalIndex(slides[i],0);}}},0);}} 
if(slideChanged||!previousSlide){stopEmbeddedContent(previousSlide);startEmbeddedContent(currentSlide);} 
dom.statusDiv.textContent=currentSlide.textContent;updateControls();updateProgress();updateBackground();updateParallax();updateSlideNumber(); writeURL();cueAutoSlide();}
function sync(){ removeEventListeners();addEventListeners(); layout(); autoSlide=config.autoSlide; cueAutoSlide(); createBackgrounds(); writeURL();sortAllFragments();updateControls();updateProgress();updateBackground(true);updateSlideNumber();updateSlidesVisibility();formatEmbeddedContent();startEmbeddedContent(currentSlide);if(isOverview()){layoutOverview();}}
function resetVerticalSlides(){var horizontalSlides=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR));horizontalSlides.forEach(function(horizontalSlide){var verticalSlides=toArray(horizontalSlide.querySelectorAll('section'));verticalSlides.forEach(function(verticalSlide,y){if(y>0){verticalSlide.classList.remove('present');verticalSlide.classList.remove('past');verticalSlide.classList.add('future');verticalSlide.setAttribute('aria-hidden','true');}});});}
function sortAllFragments(){var horizontalSlides=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR));horizontalSlides.forEach(function(horizontalSlide){var verticalSlides=toArray(horizontalSlide.querySelectorAll('section'));verticalSlides.forEach(function(verticalSlide,y){sortFragments(verticalSlide.querySelectorAll('.fragment'));});if(verticalSlides.length===0)sortFragments(horizontalSlide.querySelectorAll('.fragment'));});}
function updateSlides(selector,index){
 var slides=toArray(dom.wrapper.querySelectorAll(selector)),slidesLength=slides.length;var printMode=isPrintingPDF();if(slidesLength){if(config.loop){index%=slidesLength;if(index<0){index=slidesLength+index;}} 
index=Math.max(Math.min(index,slidesLength-1),0);for(var i=0;i<slidesLength;i++){var element=slides[i];var reverse=config.rtl&&!isVerticalSlide(element);element.classList.remove('past');element.classList.remove('present');element.classList.remove('future'); element.setAttribute('hidden','');element.setAttribute('aria-hidden','true'); if(element.querySelector('section')){element.classList.add('stack');}
if(printMode){element.classList.add('present');continue;}
if(i<index){ element.classList.add(reverse?'future':'past');if(config.fragments){var pastFragments=toArray(element.querySelectorAll('.fragment')); while(pastFragments.length){var pastFragment=pastFragments.pop();pastFragment.classList.add('visible');pastFragment.classList.remove('current-fragment');}}}
else if(i>index){ element.classList.add(reverse?'past':'future');if(config.fragments){var futureFragments=toArray(element.querySelectorAll('.fragment.visible')); while(futureFragments.length){var futureFragment=futureFragments.pop();futureFragment.classList.remove('visible');futureFragment.classList.remove('current-fragment');}}}} 
slides[index].classList.add('present');slides[index].removeAttribute('hidden');slides[index].removeAttribute('aria-hidden');
 var slideState=slides[index].getAttribute('data-state');if(slideState){state=state.concat(slideState.split(' '));}}
else{
 index=0;}
return index;}
function updateSlidesVisibility(){
 var horizontalSlides=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR)),horizontalSlidesLength=horizontalSlides.length,distanceX,distanceY;if(horizontalSlidesLength&&typeof indexh!=='undefined'){
 var viewDistance=isOverview()?10:config.viewDistance; if(isMobileDevice){viewDistance=isOverview()?6:2;} 
if(isPrintingPDF()){viewDistance=Number.MAX_VALUE;}
for(var x=0;x<horizontalSlidesLength;x++){var horizontalSlide=horizontalSlides[x];var verticalSlides=toArray(horizontalSlide.querySelectorAll('section')),verticalSlidesLength=verticalSlides.length; distanceX=Math.abs((indexh||0)-x)||0;
 if(config.loop){distanceX=Math.abs(((indexh||0)-x)%(horizontalSlidesLength-viewDistance))||0;} 
if(distanceX<viewDistance){showSlide(horizontalSlide);}
else{hideSlide(horizontalSlide);}
if(verticalSlidesLength){var oy=getPreviousVerticalIndex(horizontalSlide);for(var y=0;y<verticalSlidesLength;y++){var verticalSlide=verticalSlides[y];distanceY=x===(indexh||0)?Math.abs((indexv||0)-y):Math.abs(y-oy);if(distanceX+distanceY<viewDistance){showSlide(verticalSlide);}
else{hideSlide(verticalSlide);}}}}}}
function updateProgress(){ if(config.progress&&dom.progressbar){dom.progressbar.style.width=getProgress()*dom.wrapper.offsetWidth+'px';}}
function updateSlideNumber(){ if(config.slideNumber&&dom.slideNumber){ var format='c'; if(typeof config.slideNumber==='string'){format=config.slideNumber;}
dom.slideNumber.innerHTML=format.replace(/h/g,indexh).replace(/v/g,indexv).replace(/c/g,getSlidePastCount()+1).replace(/t/g,getTotalSlides());}}
function updateControls(){var routes=availableRoutes();var fragments=availableFragments(); dom.controlsLeft.concat(dom.controlsRight).concat(dom.controlsUp).concat(dom.controlsDown).concat(dom.controlsPrev).concat(dom.controlsNext).forEach(function(node){node.classList.remove('enabled');node.classList.remove('fragmented');}); if(routes.left)dom.controlsLeft.forEach(function(el){el.classList.add('enabled');});if(routes.right)dom.controlsRight.forEach(function(el){el.classList.add('enabled');});if(routes.up)dom.controlsUp.forEach(function(el){el.classList.add('enabled');});if(routes.down)dom.controlsDown.forEach(function(el){el.classList.add('enabled');}); if(routes.left||routes.up)dom.controlsPrev.forEach(function(el){el.classList.add('enabled');});if(routes.right||routes.down)dom.controlsNext.forEach(function(el){el.classList.add('enabled');}); if(currentSlide){ if(fragments.prev)dom.controlsPrev.forEach(function(el){el.classList.add('fragmented','enabled');});if(fragments.next)dom.controlsNext.forEach(function(el){el.classList.add('fragmented','enabled');});
 if(isVerticalSlide(currentSlide)){if(fragments.prev)dom.controlsUp.forEach(function(el){el.classList.add('fragmented','enabled');});if(fragments.next)dom.controlsDown.forEach(function(el){el.classList.add('fragmented','enabled');});}
else{if(fragments.prev)dom.controlsLeft.forEach(function(el){el.classList.add('fragmented','enabled');});if(fragments.next)dom.controlsRight.forEach(function(el){el.classList.add('fragmented','enabled');});}}}
function updateBackground(includeAll){var currentBackground=null; var horizontalPast=config.rtl?'future':'past',horizontalFuture=config.rtl?'past':'future';
toArray(dom.background.childNodes).forEach(function(backgroundh,h){backgroundh.classList.remove('past');backgroundh.classList.remove('present');backgroundh.classList.remove('future');if(h<indexh){backgroundh.classList.add(horizontalPast);}
else if(h>indexh){backgroundh.classList.add(horizontalFuture);}
else{backgroundh.classList.add('present'); currentBackground=backgroundh;}
if(includeAll||h===indexh){toArray(backgroundh.querySelectorAll('.slide-background')).forEach(function(backgroundv,v){backgroundv.classList.remove('past');backgroundv.classList.remove('present');backgroundv.classList.remove('future');if(v<indexv){backgroundv.classList.add('past');}
else if(v>indexv){backgroundv.classList.add('future');}
else{backgroundv.classList.add('present'); if(h===indexh)currentBackground=backgroundv;}});}}); if(previousBackground){var previousVideo=previousBackground.querySelector('video');if(previousVideo)previousVideo.pause();}
if(currentBackground){ var currentVideo=currentBackground.querySelector('video');if(currentVideo){currentVideo.currentTime=0;currentVideo.play();}
var backgroundImageURL=currentBackground.style.backgroundImage||'';if(/\.gif/i.test(backgroundImageURL)){currentBackground.style.backgroundImage='';window.getComputedStyle(currentBackground).opacity;currentBackground.style.backgroundImage=backgroundImageURL;}

var previousBackgroundHash=previousBackground?previousBackground.getAttribute('data-background-hash'):null;var currentBackgroundHash=currentBackground.getAttribute('data-background-hash');if(currentBackgroundHash&&currentBackgroundHash===previousBackgroundHash&&currentBackground!==previousBackground){dom.background.classList.add('no-transition');}
previousBackground=currentBackground;} 
if(currentSlide){['has-light-background','has-dark-background'].forEach(function(classToBubble){if(currentSlide.classList.contains(classToBubble)){dom.wrapper.classList.add(classToBubble);}
else{dom.wrapper.classList.remove(classToBubble);}});} 
setTimeout(function(){dom.background.classList.remove('no-transition');},1);}
function updateParallax(){if(config.parallaxBackgroundImage){var horizontalSlides=dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR),verticalSlides=dom.wrapper.querySelectorAll(VERTICAL_SLIDES_SELECTOR);var backgroundSize=dom.background.style.backgroundSize.split(' '),backgroundWidth,backgroundHeight;if(backgroundSize.length===1){backgroundWidth=backgroundHeight=parseInt(backgroundSize[0],10);}
else{backgroundWidth=parseInt(backgroundSize[0],10);backgroundHeight=parseInt(backgroundSize[1],10);}
var slideWidth=dom.background.offsetWidth,horizontalSlideCount=horizontalSlides.length,horizontalOffsetMultiplier,horizontalOffset;if(typeof config.parallaxBackgroundHorizontal==='number'){horizontalOffsetMultiplier=config.parallaxBackgroundHorizontal;}
else{horizontalOffsetMultiplier=(backgroundWidth-slideWidth)/(horizontalSlideCount-1);}
horizontalOffset=horizontalOffsetMultiplier*indexh*-1;var slideHeight=dom.background.offsetHeight,verticalSlideCount=verticalSlides.length,verticalOffsetMultiplier,verticalOffset;if(typeof config.parallaxBackgroundVertical==='number'){verticalOffsetMultiplier=config.parallaxBackgroundVertical;}
else{verticalOffsetMultiplier=(backgroundHeight-slideHeight)/(verticalSlideCount-1);}
verticalOffset=verticalSlideCount>0?verticalOffsetMultiplier*indexv*1:0;dom.background.style.backgroundPosition=horizontalOffset+'px '+-verticalOffset+'px';}}
function showSlide(slide){ slide.style.display='block'; toArray(slide.querySelectorAll('img[data-src], video[data-src], audio[data-src]')).forEach(function(element){element.setAttribute('src',element.getAttribute('data-src'));element.removeAttribute('data-src');}); toArray(slide.querySelectorAll('video, audio')).forEach(function(media){var sources=0;toArray(media.querySelectorAll('source[data-src]')).forEach(function(source){source.setAttribute('src',source.getAttribute('data-src'));source.removeAttribute('data-src');sources+=1;});
 if(sources>0){media.load();}}); var indices=getIndices(slide);var background=getSlideBackground(indices.h,indices.v);if(background){background.style.display='block'; if(background.hasAttribute('data-loaded')===false){background.setAttribute('data-loaded','true');var backgroundImage=slide.getAttribute('data-background-image'),backgroundVideo=slide.getAttribute('data-background-video'),backgroundVideoLoop=slide.hasAttribute('data-background-video-loop'),backgroundIframe=slide.getAttribute('data-background-iframe'); if(backgroundImage){background.style.backgroundImage='url('+backgroundImage+')';} 
else if(backgroundVideo&&!isSpeakerNotes()){var video=document.createElement('video');if(backgroundVideoLoop){video.setAttribute('loop','');} 
backgroundVideo.split(',').forEach(function(source){video.innerHTML+='<source src="'+source+'">';});background.appendChild(video);} 
else if(backgroundIframe){var iframe=document.createElement('iframe');iframe.setAttribute('src',backgroundIframe);iframe.style.width='100%';iframe.style.height='100%';iframe.style.maxHeight='100%';iframe.style.maxWidth='100%';background.appendChild(iframe);}}}}
function hideSlide(slide){ slide.style.display='none'; var indices=getIndices(slide);var background=getSlideBackground(indices.h,indices.v);if(background){background.style.display='none';}}
function availableRoutes(){var horizontalSlides=dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR),verticalSlides=dom.wrapper.querySelectorAll(VERTICAL_SLIDES_SELECTOR);var routes={left:indexh>0||config.loop,right:indexh<horizontalSlides.length-1||config.loop,up:indexv>0,down:indexv<verticalSlides.length-1}; if(config.rtl){var left=routes.left;routes.left=routes.right;routes.right=left;}
return routes;}
function availableFragments(){if(currentSlide&&config.fragments){var fragments=currentSlide.querySelectorAll('.fragment');var hiddenFragments=currentSlide.querySelectorAll('.fragment:not(.visible)');return{prev:fragments.length-hiddenFragments.length>0,next:!!hiddenFragments.length};}
else{return{prev:false,next:false};}}
function formatEmbeddedContent(){var _appendParamToIframeSource=function(sourceAttribute,sourceURL,param){toArray(dom.slides.querySelectorAll('iframe['+sourceAttribute+'*="'+sourceURL+'"]')).forEach(function(el){var src=el.getAttribute(sourceAttribute);if(src&&src.indexOf(param)===-1){el.setAttribute(sourceAttribute,src+(!/\?/.test(src)?'?':'&')+param);}});};_appendParamToIframeSource('src','youtube.com/embed/','enablejsapi=1');_appendParamToIframeSource('data-src','youtube.com/embed/','enablejsapi=1');_appendParamToIframeSource('src','player.vimeo.com/','api=1');_appendParamToIframeSource('data-src','player.vimeo.com/','api=1');}
function startEmbeddedContent(slide){if(slide&&!isSpeakerNotes()){ toArray(slide.querySelectorAll('img[src$=".gif"]')).forEach(function(el){
 el.setAttribute('src',el.getAttribute('src'));}); toArray(slide.querySelectorAll('video, audio')).forEach(function(el){if(el.hasAttribute('data-autoplay')&&typeof el.play==='function'){el.play();}}); toArray(slide.querySelectorAll('iframe[src]')).forEach(function(el){startEmbeddedIframe({target:el});}); toArray(slide.querySelectorAll('iframe[data-src]')).forEach(function(el){if(el.getAttribute('src')!==el.getAttribute('data-src')){el.removeEventListener('load',startEmbeddedIframe); el.addEventListener('load',startEmbeddedIframe);el.setAttribute('src',el.getAttribute('data-src'));}});}}
function startEmbeddedIframe(event){var iframe=event.target; if(/youtube\.com\/embed\//.test(iframe.getAttribute('src'))&&iframe.hasAttribute('data-autoplay')){iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}','*');} 
else if(/player\.vimeo\.com\//.test(iframe.getAttribute('src'))&&iframe.hasAttribute('data-autoplay')){iframe.contentWindow.postMessage('{"method":"play"}','*');} 
else{iframe.contentWindow.postMessage('slide:start','*');}}
function stopEmbeddedContent(slide){if(slide&&slide.parentNode){ toArray(slide.querySelectorAll('video, audio')).forEach(function(el){if(!el.hasAttribute('data-ignore')&&typeof el.pause==='function'){el.pause();}}); toArray(slide.querySelectorAll('iframe')).forEach(function(el){el.contentWindow.postMessage('slide:stop','*');el.removeEventListener('load',startEmbeddedIframe);}); toArray(slide.querySelectorAll('iframe[src*="youtube.com/embed/"]')).forEach(function(el){if(!el.hasAttribute('data-ignore')&&typeof el.contentWindow.postMessage==='function'){el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');}}); toArray(slide.querySelectorAll('iframe[src*="player.vimeo.com/"]')).forEach(function(el){if(!el.hasAttribute('data-ignore')&&typeof el.contentWindow.postMessage==='function'){el.contentWindow.postMessage('{"method":"pause"}','*');}}); toArray(slide.querySelectorAll('iframe[data-src]')).forEach(function(el){
 el.setAttribute('src','about:blank');el.removeAttribute('src');});}}
function getSlidePastCount(){var horizontalSlides=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR)); var pastCount=0; mainLoop:for(var i=0;i<horizontalSlides.length;i++){var horizontalSlide=horizontalSlides[i];var verticalSlides=toArray(horizontalSlide.querySelectorAll('section'));for(var j=0;j<verticalSlides.length;j++){ if(verticalSlides[j].classList.contains('present')){break mainLoop;}
pastCount++;} 
if(horizontalSlide.classList.contains('present')){break;} 
if(horizontalSlide.classList.contains('stack')===false){pastCount++;}}
return pastCount;}
function getProgress(){ var totalCount=getTotalSlides();var pastCount=getSlidePastCount();if(currentSlide){var allFragments=currentSlide.querySelectorAll('.fragment');
if(allFragments.length>0){var visibleFragments=currentSlide.querySelectorAll('.fragment.visible');
var fragmentWeight=0.9; pastCount+=(visibleFragments.length/allFragments.length)*fragmentWeight;}}
return pastCount/(totalCount-1);}
function isSpeakerNotes(){return!!window.location.search.match(/receiver/gi);}
function readURL(){var hash=window.location.hash; var bits=hash.slice(2).split('/'),name=hash.replace(/#|\//gi,'');
 if(isNaN(parseInt(bits[0],10))&&name.length){var element; if(/^[a-zA-Z][\w:.-]*$/.test(name)){ element=document.getElementById(name);}
if(element){ var indices=Reveal.getIndices(element);slide(indices.h,indices.v);} 
else{slide(indexh||0,indexv||0);}}
else{ var h=parseInt(bits[0],10)||0,v=parseInt(bits[1],10)||0;if(h!==indexh||v!==indexv){slide(h,v);}}}
function writeURL(delay){if(config.history){ clearTimeout(writeURLTimeout); if(typeof delay==='number'){writeURLTimeout=setTimeout(writeURL,delay);}
else if(currentSlide){var url='/'; var id=currentSlide.getAttribute('id');if(id){id=id.toLowerCase();id=id.replace(/[^a-zA-Z0-9\-\_\:\.]/g,'');} 
if(typeof id==='string'&&id.length){url='/'+id;} 
else{if(indexh>0||indexv>0)url+=indexh;if(indexv>0)url+='/'+indexv;}
window.location.hash=url;}}}
function getIndices(slide){ var h=indexh,v=indexv,f; if(slide){var isVertical=isVerticalSlide(slide);var slideh=isVertical?slide.parentNode:slide; var horizontalSlides=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR)); h=Math.max(horizontalSlides.indexOf(slideh),0); v=undefined; if(isVertical){v=Math.max(toArray(slide.parentNode.querySelectorAll('section')).indexOf(slide),0);}}
if(!slide&&currentSlide){var hasFragments=currentSlide.querySelectorAll('.fragment').length>0;if(hasFragments){var currentFragment=currentSlide.querySelector('.current-fragment');if(currentFragment&&currentFragment.hasAttribute('data-fragment-index')){f=parseInt(currentFragment.getAttribute('data-fragment-index'),10);}
else{f=currentSlide.querySelectorAll('.fragment.visible').length-1;}}}
return{h:h,v:v,f:f};}
function getTotalSlides(){return dom.wrapper.querySelectorAll(SLIDES_SELECTOR+':not(.stack)').length;}
function getSlide(x,y){var horizontalSlide=dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR)[x];var verticalSlides=horizontalSlide&&horizontalSlide.querySelectorAll('section');if(verticalSlides&&verticalSlides.length&&typeof y==='number'){return verticalSlides?verticalSlides[y]:undefined;}
return horizontalSlide;}
function getSlideBackground(x,y){
 if(isPrintingPDF()){var slide=getSlide(x,y);if(slide){var background=slide.querySelector('.slide-background');if(background&&background.parentNode===slide){return background;}}
return undefined;}
var horizontalBackground=dom.wrapper.querySelectorAll('.backgrounds>.slide-background')[x];var verticalBackgrounds=horizontalBackground&&horizontalBackground.querySelectorAll('.slide-background');if(verticalBackgrounds&&verticalBackgrounds.length&&typeof y==='number'){return verticalBackgrounds?verticalBackgrounds[y]:undefined;}
return horizontalBackground;}
function getState(){var indices=getIndices();return{indexh:indices.h,indexv:indices.v,indexf:indices.f,paused:isPaused(),overview:isOverview()};}
function setState(state){if(typeof state==='object'){slide(deserialize(state.indexh),deserialize(state.indexv),deserialize(state.indexf));var pausedFlag=deserialize(state.paused),overviewFlag=deserialize(state.overview);if(typeof pausedFlag==='boolean'&&pausedFlag!==isPaused()){togglePause(pausedFlag);}
if(typeof overviewFlag==='boolean'&&overviewFlag!==isOverview()){toggleOverview(overviewFlag);}}}
function sortFragments(fragments){fragments=toArray(fragments);var ordered=[],unordered=[],sorted=[]; fragments.forEach(function(fragment,i){if(fragment.hasAttribute('data-fragment-index')){var index=parseInt(fragment.getAttribute('data-fragment-index'),10);if(!ordered[index]){ordered[index]=[];}
ordered[index].push(fragment);}
else{unordered.push([fragment]);}});
 ordered=ordered.concat(unordered);
 var index=0; ordered.forEach(function(group){group.forEach(function(fragment){sorted.push(fragment);fragment.setAttribute('data-fragment-index',index);});index++;});return sorted;}
function navigateFragment(index,offset){if(currentSlide&&config.fragments){var fragments=sortFragments(currentSlide.querySelectorAll('.fragment'));if(fragments.length){ if(typeof index!=='number'){var lastVisibleFragment=sortFragments(currentSlide.querySelectorAll('.fragment.visible')).pop();if(lastVisibleFragment){index=parseInt(lastVisibleFragment.getAttribute('data-fragment-index')||0,10);}
else{index=-1;}} 
if(typeof offset==='number'){index+=offset;}
var fragmentsShown=[],fragmentsHidden=[];toArray(fragments).forEach(function(element,i){if(element.hasAttribute('data-fragment-index')){i=parseInt(element.getAttribute('data-fragment-index'),10);} 
if(i<=index){if(!element.classList.contains('visible'))fragmentsShown.push(element);element.classList.add('visible');element.classList.remove('current-fragment'); dom.statusDiv.textContent=element.textContent;if(i===index){element.classList.add('current-fragment');}} 
else{if(element.classList.contains('visible'))fragmentsHidden.push(element);element.classList.remove('visible');element.classList.remove('current-fragment');}});if(fragmentsHidden.length){dispatchEvent('fragmenthidden',{fragment:fragmentsHidden[0],fragments:fragmentsHidden});}
if(fragmentsShown.length){dispatchEvent('fragmentshown',{fragment:fragmentsShown[0],fragments:fragmentsShown});}
updateControls();updateProgress();return!!(fragmentsShown.length||fragmentsHidden.length);}}
return false;}
function nextFragment(){return navigateFragment(null,1);}
function previousFragment(){return navigateFragment(null,-1);}
function cueAutoSlide(){cancelAutoSlide();if(currentSlide){var currentFragment=currentSlide.querySelector('.current-fragment');var fragmentAutoSlide=currentFragment?currentFragment.getAttribute('data-autoslide'):null;var parentAutoSlide=currentSlide.parentNode?currentSlide.parentNode.getAttribute('data-autoslide'):null;var slideAutoSlide=currentSlide.getAttribute('data-autoslide');


 if(fragmentAutoSlide){autoSlide=parseInt(fragmentAutoSlide,10);}
else if(slideAutoSlide){autoSlide=parseInt(slideAutoSlide,10);}
else if(parentAutoSlide){autoSlide=parseInt(parentAutoSlide,10);}
else{autoSlide=config.autoSlide;}


if(currentSlide.querySelectorAll('.fragment').length===0){toArray(currentSlide.querySelectorAll('video, audio')).forEach(function(el){if(el.hasAttribute('data-autoplay')){if(autoSlide&&el.duration*1000>autoSlide){autoSlide=(el.duration*1000)+1000;}}});}



 
if(autoSlide&&!autoSlidePaused&&!isPaused()&&!isOverview()&&(!Reveal.isLastSlide()||availableFragments().next||config.loop===true)){autoSlideTimeout=setTimeout(navigateNext,autoSlide);autoSlideStartTime=Date.now();}
if(autoSlidePlayer){autoSlidePlayer.setPlaying(autoSlideTimeout!==-1);}}}
function cancelAutoSlide(){clearTimeout(autoSlideTimeout);autoSlideTimeout=-1;}
function pauseAutoSlide(){if(autoSlide&&!autoSlidePaused){autoSlidePaused=true;dispatchEvent('autoslidepaused');clearTimeout(autoSlideTimeout);if(autoSlidePlayer){autoSlidePlayer.setPlaying(false);}}}
function resumeAutoSlide(){if(autoSlide&&autoSlidePaused){autoSlidePaused=false;dispatchEvent('autoslideresumed');cueAutoSlide();}}
function navigateLeft(){ if(config.rtl){if((isOverview()||nextFragment()===false)&&availableRoutes().left){slide(indexh+1);}} 
else if((isOverview()||previousFragment()===false)&&availableRoutes().left){slide(indexh-1);}}
function navigateRight(){ if(config.rtl){if((isOverview()||previousFragment()===false)&&availableRoutes().right){slide(indexh-1);}} 
else if((isOverview()||nextFragment()===false)&&availableRoutes().right){slide(indexh+1);}}
function navigateUp(){ if((isOverview()||previousFragment()===false)&&availableRoutes().up){slide(indexh,indexv-1);}}
function navigateDown(){ if((isOverview()||nextFragment()===false)&&availableRoutes().down){slide(indexh,indexv+1);}}
function navigatePrev(){ if(previousFragment()===false){if(availableRoutes().up){navigateUp();}
else{ var previousSlide;if(config.rtl){previousSlide=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR+'.future')).pop();}
else{previousSlide=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR+'.past')).pop();}
if(previousSlide){var v=(previousSlide.querySelectorAll('section').length-1)||undefined;var h=indexh-1;slide(h,v);}}}}
function navigateNext(){ if(nextFragment()===false){if(availableRoutes().down){navigateDown();}
else if(config.rtl){navigateLeft();}
else{navigateRight();}}
 
cueAutoSlide();}
function onUserInput(event){if(config.autoSlideStoppable){pauseAutoSlide();}}
function onDocumentKeyPress(event){ if(event.shiftKey&&event.charCode===63){if(dom.overlay){closeOverlay();}
else{showHelp(true);}}}
function onDocumentKeyDown(event){ if(typeof config.keyboardCondition==='function'&&config.keyboardCondition()===false){return true;} 
var autoSlideWasPaused=autoSlidePaused;onUserInput(event);
 var activeElementIsCE=document.activeElement&&document.activeElement.contentEditable!=='inherit';var activeElementIsInput=document.activeElement&&document.activeElement.tagName&&/input|textarea/i.test(document.activeElement.tagName);
 if(activeElementIsCE||activeElementIsInput||(event.shiftKey&&event.keyCode!==32)||event.altKey||event.ctrlKey||event.metaKey)return;if(isPaused()&&[66,190,191].indexOf(event.keyCode)===-1){return false;}
var triggered=false; if(typeof config.keyboard==='object'){for(var key in config.keyboard){ if(parseInt(key,10)===event.keyCode){var value=config.keyboard[key]; if(typeof value==='function'){value.apply(null,[event]);} 
else if(typeof value==='string'&&typeof Reveal[value]==='function'){Reveal[value].call();}
triggered=true;}}} 
if(triggered===false){ triggered=true;switch(event.keyCode){ case 80:case 33:navigatePrev();break; case 78:case 34:navigateNext();break; case 72:case 37:navigateLeft();break; case 76:case 39:navigateRight();break; case 75:case 38:navigateUp();break; case 74:case 40:navigateDown();break; case 36:slide(0);break; case 35:slide(Number.MAX_VALUE);break; case 32:isOverview()?deactivateOverview():event.shiftKey?navigatePrev():navigateNext();break; case 13:isOverview()?deactivateOverview():triggered=false;break; case 58:case 59:case 66:case 190:case 191:togglePause();break; case 70:enterFullscreen();break; case 65:if(config.autoSlideStoppable)toggleAutoSlide(autoSlideWasPaused);break;default:triggered=false;}}
 
if(triggered){event.preventDefault&&event.preventDefault();} 
else if((event.keyCode===27||event.keyCode===79)&&features.transforms3d){if(dom.overlay){closeOverlay();}
else{toggleOverview();}
event.preventDefault&&event.preventDefault();}
 
cueAutoSlide();}
function onTouchStart(event){touch.startX=event.touches[0].clientX;touch.startY=event.touches[0].clientY;touch.startCount=event.touches.length;
 if(event.touches.length===2&&config.overview){touch.startSpan=distanceBetween({x:event.touches[1].clientX,y:event.touches[1].clientY},{x:touch.startX,y:touch.startY});}}
function onTouchMove(event){ if(!touch.captured){onUserInput(event);var currentX=event.touches[0].clientX;var currentY=event.touches[0].clientY;
 if(event.touches.length===2&&touch.startCount===2&&config.overview){ var currentSpan=distanceBetween({x:event.touches[1].clientX,y:event.touches[1].clientY},{x:touch.startX,y:touch.startY});
 if(Math.abs(touch.startSpan-currentSpan)>touch.threshold){touch.captured=true;if(currentSpan<touch.startSpan){activateOverview();}
else{deactivateOverview();}}
event.preventDefault();} 
else if(event.touches.length===1&&touch.startCount!==2){var deltaX=currentX-touch.startX,deltaY=currentY-touch.startY;if(deltaX>touch.threshold&&Math.abs(deltaX)>Math.abs(deltaY)){touch.captured=true;navigateLeft();}
else if(deltaX<-touch.threshold&&Math.abs(deltaX)>Math.abs(deltaY)){touch.captured=true;navigateRight();}
else if(deltaY>touch.threshold){touch.captured=true;navigateUp();}
else if(deltaY<-touch.threshold){touch.captured=true;navigateDown();}
 
if(config.embedded){if(touch.captured||isVerticalSlide(currentSlide)){event.preventDefault();}}
 
else{event.preventDefault();}}}
 
else if(navigator.userAgent.match(/android/gi)){event.preventDefault();}}
function onTouchEnd(event){touch.captured=false;}
function onPointerDown(event){if(event.pointerType===event.MSPOINTER_TYPE_TOUCH||event.pointerType==="touch"){event.touches=[{clientX:event.clientX,clientY:event.clientY}];onTouchStart(event);}}
function onPointerMove(event){if(event.pointerType===event.MSPOINTER_TYPE_TOUCH||event.pointerType==="touch"){event.touches=[{clientX:event.clientX,clientY:event.clientY}];onTouchMove(event);}}
function onPointerUp(event){if(event.pointerType===event.MSPOINTER_TYPE_TOUCH||event.pointerType==="touch"){event.touches=[{clientX:event.clientX,clientY:event.clientY}];onTouchEnd(event);}}
function onDocumentMouseScroll(event){if(Date.now()-lastMouseWheelStep>600){lastMouseWheelStep=Date.now();var delta=event.detail||-event.wheelDelta;if(delta>0){navigateNext();}
else{navigatePrev();}}}
function onProgressClicked(event){onUserInput(event);event.preventDefault();var slidesTotal=toArray(dom.wrapper.querySelectorAll(HORIZONTAL_SLIDES_SELECTOR)).length;var slideIndex=Math.floor((event.clientX/dom.wrapper.offsetWidth)*slidesTotal);if(config.rtl){slideIndex=slidesTotal-slideIndex;}
slide(slideIndex);}
function onNavigateLeftClicked(event){event.preventDefault();onUserInput();navigateLeft();}
function onNavigateRightClicked(event){event.preventDefault();onUserInput();navigateRight();}
function onNavigateUpClicked(event){event.preventDefault();onUserInput();navigateUp();}
function onNavigateDownClicked(event){event.preventDefault();onUserInput();navigateDown();}
function onNavigatePrevClicked(event){event.preventDefault();onUserInput();navigatePrev();}
function onNavigateNextClicked(event){event.preventDefault();onUserInput();navigateNext();}
function onWindowHashChange(event){readURL();}
function onWindowResize(event){layout();}
function onPageVisibilityChange(event){var isHidden=document.webkitHidden||document.msHidden||document.hidden; if(isHidden===false&&document.activeElement!==document.body){if(typeof document.activeElement.blur==='function'){document.activeElement.blur();}
document.body.focus();}}
function onOverviewSlideClicked(event){
if(eventsAreBound&&isOverview()){event.preventDefault();var element=event.target;while(element&&!element.nodeName.match(/section/gi)){element=element.parentNode;}
if(element&&!element.classList.contains('disabled')){deactivateOverview();if(element.nodeName.match(/section/gi)){var h=parseInt(element.getAttribute('data-index-h'),10),v=parseInt(element.getAttribute('data-index-v'),10);slide(h,v);}}}}
function onPreviewLinkClicked(event){if(event.currentTarget&&event.currentTarget.hasAttribute('href')){var url=event.currentTarget.getAttribute('href');if(url){showPreview(url);event.preventDefault();}}}
function onAutoSlidePlayerClick(event){ if(Reveal.isLastSlide()&&config.loop===false){slide(0,0);resumeAutoSlide();} 
else if(autoSlidePaused){resumeAutoSlide();} 
else{pauseAutoSlide();}}
function Playback(container,progressCheck){ this.diameter=50;this.thickness=3; this.playing=false; this.progress=0; this.progressOffset=1;this.container=container;this.progressCheck=progressCheck;this.canvas=document.createElement('canvas');this.canvas.className='playback';this.canvas.width=this.diameter;this.canvas.height=this.diameter;this.context=this.canvas.getContext('2d');this.container.appendChild(this.canvas);this.render();}
Playback.prototype.setPlaying=function(value){var wasPlaying=this.playing;this.playing=value; if(!wasPlaying&&this.playing){this.animate();}
else{this.render();}};Playback.prototype.animate=function(){var progressBefore=this.progress;this.progress=this.progressCheck();
 if(progressBefore>0.8&&this.progress<0.2){this.progressOffset=this.progress;}
this.render();if(this.playing){features.requestAnimationFrameMethod.call(window,this.animate.bind(this));}};Playback.prototype.render=function(){var progress=this.playing?this.progress:0,radius=(this.diameter/2)-this.thickness,x=this.diameter/2,y=this.diameter/2,iconSize=14; this.progressOffset+=(1-this.progressOffset)*0.1;var endAngle=(-Math.PI/2)+(progress*(Math.PI*2));var startAngle=(-Math.PI/2)+(this.progressOffset*(Math.PI*2));this.context.save();this.context.clearRect(0,0,this.diameter,this.diameter); this.context.beginPath();this.context.arc(x,y,radius+2,0,Math.PI*2,false);this.context.fillStyle='rgba( 0, 0, 0, 0.4 )';this.context.fill(); this.context.beginPath();this.context.arc(x,y,radius,0,Math.PI*2,false);this.context.lineWidth=this.thickness;this.context.strokeStyle='#666';this.context.stroke();if(this.playing){ this.context.beginPath();this.context.arc(x,y,radius,startAngle,endAngle,false);this.context.lineWidth=this.thickness;this.context.strokeStyle='#fff';this.context.stroke();}
this.context.translate(x-(iconSize/2),y-(iconSize/2)); if(this.playing){this.context.fillStyle='#fff';this.context.fillRect(0,0,iconSize/2-2,iconSize);this.context.fillRect(iconSize/2+2,0,iconSize/2-2,iconSize);}
else{this.context.beginPath();this.context.translate(2,0);this.context.moveTo(0,0);this.context.lineTo(iconSize-2,iconSize/2);this.context.lineTo(0,iconSize);this.context.fillStyle='#fff';this.context.fill();}
this.context.restore();};Playback.prototype.on=function(type,listener){this.canvas.addEventListener(type,listener,false);};Playback.prototype.off=function(type,listener){this.canvas.removeEventListener(type,listener,false);};Playback.prototype.destroy=function(){this.playing=false;if(this.canvas.parentNode){this.container.removeChild(this.canvas);}};Reveal={initialize:initialize,configure:configure,sync:sync, slide:slide,left:navigateLeft,right:navigateRight,up:navigateUp,down:navigateDown,prev:navigatePrev,next:navigateNext, navigateFragment:navigateFragment,prevFragment:previousFragment,nextFragment:nextFragment, navigateTo:slide,navigateLeft:navigateLeft,navigateRight:navigateRight,navigateUp:navigateUp,navigateDown:navigateDown,navigatePrev:navigatePrev,navigateNext:navigateNext, layout:layout,availableRoutes:availableRoutes,availableFragments:availableFragments, toggleOverview:toggleOverview, togglePause:togglePause, toggleAutoSlide:toggleAutoSlide, isOverview:isOverview,isPaused:isPaused,isAutoSliding:isAutoSliding,addEventListeners:addEventListeners,removeEventListeners:removeEventListeners, getState:getState,setState:setState, getProgress:getProgress, getIndices:getIndices,getTotalSlides:getTotalSlides, getSlide:getSlide, getSlideBackground:getSlideBackground, getPreviousSlide:function(){return previousSlide;}, getCurrentSlide:function(){return currentSlide;}, getScale:function(){return scale;}, getConfig:function(){return config;}, getQueryHash:function(){var query={};location.search.replace(/[A-Z0-9]+?=([\w\.%-]*)/gi,function(a){query[a.split('=').shift()]=a.split('=').pop();}); for(var i in query){var value=query[i];query[i]=deserialize(unescape(value));}
return query;}, isFirstSlide:function(){return(indexh===0&&indexv===0);}, isLastSlide:function(){if(currentSlide){if(currentSlide.nextElementSibling)return false;if(isVerticalSlide(currentSlide)&&currentSlide.parentNode.nextElementSibling)return false;return true;}
return false;}, isReady:function(){return loaded;}, addEventListener:function(type,listener,useCapture){if('addEventListener'in window){(dom.wrapper||document.querySelector('.reveal')).addEventListener(type,listener,useCapture);}},removeEventListener:function(type,listener,useCapture){if('addEventListener'in window){(dom.wrapper||document.querySelector('.reveal')).removeEventListener(type,listener,useCapture);}}, triggerKey:function(keyCode){onDocumentKeyDown({keyCode:keyCode});}};return Reveal;}));

"use strict";

(function () { // IIFE function

    // we don't need it, we use old school window.UniversalRouter
    // import UniversalRouter from 'universal-router'

    const tinyDoooMainEl = document.querySelector('.tiny-dooo-main-content-area');
    if (tinyDoooMainEl == null) {
        console.error('Main class .tiny-dooo-main does not exist, please add it to html!');
    }

    const routes = [
        {
            path: '', // this is needed if user navigates back to index via back button
            action: function () {
                console.log('Navigating to index page, restoring original HTML');
                window.location.href = 'index.html';
            }
        },
        {
            path: '/pages',
            action: () => console.log('checking child routes for /pages.'),
            children: [
                {
                    path: '/:filename',
                    action: function (context) {
                        fetch('pages/' + context.params.filename).then(function (response) {
                            // The API call was successful!
                            // TODO Check HTTP STATUS Code
                            return response.text();
                        }).then(function (textContent) {

                            window.scroll({ top: 0, left: 0 });

                            let fileFormat = context.params.filename.substr(context.params.filename.lastIndexOf('.'));

                            switch(fileFormat){
                                case '.html':
                                case '.htm':
                                    tinyDoooMainEl.innerHTML = textContent;
                                    break;
                                case '.md':
                                    tinyDoooMainEl.innerHTML = marked(textContent);
                                    break;
                                default:
                                    console.error('Unknown file extension',fileFormat);
                                    break;
                            }
                        }).catch(function (err) {
                            // There was an error
                            console.warn('Something went wrong.', err);
                            tinyDoooMainEl.innerHTML = '<h1>Content file could not be loaded</h1>';
                        });
                        return true; // important, otherwise universal-router throws error
                    }
                },
            ],
        }
    ]

    const router = new UniversalRouter(routes, {
        errorHandler: function(error) {
            console.warn('Error handler called', error);
            if (error.code === 404) {
                tinyDoooMainEl.innerHTML = '<h1>Page Not Found</h1>';
            } else {
                tinyDoooMainEl.innerHTML = '<h1>Oops! Something went wrong</h1>';
            }
        }
    });


    function locationHashChanged(runOnPageLoad) {
        console.log('Event location hash changed called', location.hash);
        if (location.hash == '' && runOnPageLoad === true) {
            return; // Bail if no route is set
        }
        // remove char
        let route = location.hash.replace(/^#/, '');
        console.log('Try to match route', route);
        // try to match a route
        router.resolve(route);
    }
    window.addEventListener('hashchange', locationHashChanged, false);

    // run it on first page load:
    locationHashChanged(true);


})(); // eo IIFE
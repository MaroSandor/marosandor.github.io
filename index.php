<!DOCTYPE html>
<html lang="hu">

<head>
    <meta charset="UTF-8">
    <title>Az oldal címe</title>
    <link href="res/style.css" rel="stylesheet" type="text/css">
</head>

<body>

    <header>
        <div id="siteTitle">
            <a href="">Az oldal címe</a>
        </div>
        <div class="headerImage" style="background-image:url(media/hd/skyscraper-slider.jpg)">
            <div class="centerBox">
                <section>
                    <h3>Morbi scelerisque, odio nec euismod tincidunt</h3>
                    <p>Morbi scelerisque, odio nec euismod tincidunt, odio lectus vehicula tortor, at pretium urna ligula et odio. Nulla vel dui dignissim sem malesuada mattis nec quis odio.</p>
                    <a href="">Morbi in dictum arcu</a>
                </section>
            </div>
        </div>
        <nav>
            <ul class="centerBox">
                <li><a href="index.html">Bemutatkozás</a></li>
                <li><a href="services.html">Szolgáltatásaink</a></li>
                <li><a href="articles.html">Cikkek</a></li>
                <li><a href="gallery.html">Galéria</a></li>
                <li><a href="contact.html">Kapcsolat</a></li>
            </ul>
        </nav>
    </header>

    <div id="page">
        <div class="centerBox">
            <main id="content">

                <!-- MAIN CONTENT -->

                <h1>Lorem ipsum dolor sit amet</h1>

                <article>

                    <h2 class="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan maximus quam vel venenatis. Suspendisse vitae tempus velit, at gravida neque. Mauris ac nisi felis. Fusce imperdiet ultricies iaculis. Suspendisse bibendum felis nisi, quis scelerisque est rutrum eget.</h2>

                    <img src="media/business-wallpaper-hd-free.jpg" alt="Mauris ac nisi felis">

                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan maximus quam vel venenatis. Suspendisse vitae tempus velit, at gravida neque. Mauris ac nisi felis. Fusce imperdiet ultricies iaculis. Suspendisse bibendum felis nisi, quis scelerisque est rutrum eget. Cras vitae risus lobortis, tempus mi non, finibus ante. Etiam non leo nec mi tristique rhoncus. Sed rhoncus ligula in sollicitudin dapibus. Suspendisse mollis nisl quis velit consectetur, consectetur aliquam urna volutpat. Donec eget neque sollicitudin, iaculis arcu at, viverra sapien. Donec venenatis magna neque, at rhoncus dolor varius non. Fusce finibus ullamcorper vestibulum.</p>

                    <h2>Phasellus hendrerit malesuada pulvinar</h2>
                    <p>Phasellus hendrerit malesuada pulvinar. Nulla imperdiet et orci in vehicula. Sed tincidunt imperdiet augue a pellentesque. Aliquam dignissim dignissim scelerisque. Sed at ante ut nulla feugiat pellentesque nec eget turpis. Sed tempor ex a dignissim semper. Praesent ullamcorper finibus arcu, quis scelerisque augue pulvinar id. Nulla vitae ante vitae massa vestibulum consequat ac eu risus. Pellentesque id fringilla tellus. Donec quis velit sapien. Quisque interdum quis magna vitae dictum. Nunc purus ligula, elementum dapibus vestibulum at, lacinia in est. Duis fringilla sapien massa, in consectetur purus condimentum at. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce dui massa, dictum non nisl eget, facilisis convallis nisi. Etiam ac leo malesuada, luctus nisl vitae, sollicitudin risus.</p>

                </article>

                <!-- END: MAIN CONTENT -->

                <?php
                $why = [                                                    // Tömb létrehozása
                    "Sajnos nem tudom, hogy hogy kell ezt megcsinálni.",    // Az tömb elemeit [] közé írjuk.
                    "Ezért nézek most tutorial videót róla.",               // Vesszővel választjuk el egymástól őket.
                    "Hogy legalább valamit sikerüljön alkotni."             
                ];                                  // Mindent, azaz még a tömb létrehozását is le kell zárni pontosvesszővel.

                echo '<section>         
                    <h3>Miért nem tanulsz rendesen?</h3>
                    <ul>';                          // HTML elem megjelenítése

                foreach ($why as $key) {            // foreach ciklus használata: a tömbön
                    echo '<li>' . $key . '</li>';     // Kiíratás
                }

                echo '</ul>
                    </section>';

                ?>

            </main>
            <aside>

                <section>
                    <h3>Phasellus hendrerit</h3>
                    <p>
                        Phasellus hendrerit malesuada pulvinar. Nulla imperdiet et orci in vehicula. Sed tincidunt imperdiet augue a pellentesque. Aliquam dignissim dignissim scelerisque.
                    </p>
                </section>

                <section>
                    <h3>Quisque interdum</h3>
                    <img src="media/business-graph.jpg" alt="Nulla imperdiet et orci in vehicula">
                    <p>Quisque interdum nec turpis in volutpat. Cras sollicitudin magna non diam tristique, id tincidunt tortor accumsan.</p>
                    <p><a href="index.html">Bővebben</a></p>
                </section>

                <section>
                    <h3>Partnereink</h3>
                    <ul>
                        <li><a href="http://lipsum.com" target="_blank">Lorem ipsum</a></li>
                        <li><a href="http://lipsum.com" target="_blank">Dolor sit amet</a></li>
                        <li><a href="http://lipsum.com" target="_blank">Consectetur</a></li>
                        <li><a href="http://lipsum.com" target="_blank">Adipiscing elit</a></li>
                        <li><a href="http://lipsum.com" target="_blank">Maecenas</a></li>
                    </ul>
                </section>

            </aside>
        </div>
    </div>

    <footer>
        <div class="centerBox">
            <div class="left">
                <h4>Praesent nec nulla ac</h4>
                <p>Nam ac risus et tellus rhoncus iaculis sit amet non ipsum. Pellentesque non posuere mi. Sed elementum est purus, in consectetur leo euismod sit amet.</p>
                <p>Praesent nec nulla ac sem tristique tincidunt quis eu quam. Curabitur ac massa id diam aliquet consectetur.</p>
            </div>
            <div class="right">
                <h4>Oldaltérkép</h4>
                <ul>
                    <li><a href="index.html">Bemutatkozás</a></li>
                    <li><a href="services.html">Szolgáltatásaink</a></li>
                    <li><a href="articles.html">Cikkek</a></li>
                    <li><a href="gallery.html">Galéria</a></li>
                    <li><a href="contact.html">Kapcsolat</a></li>
                </ul>
            </div>
        </div>
    </footer>


</body>

</html>
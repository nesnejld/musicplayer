copy djensen.conf to /etc/apache2/sites-available
a2ensite djensen
usermod www-data -G djensen (or whatever the installation user is)
ln -s /home/djensen/git/musicplayer /var/www/html/musicplayer

<?php
session_start();
session_unset();
session_destroy();
header("Location: /Xpense-vault/landingpage.html"); // Redirect to your landing or login page
exit;
?>

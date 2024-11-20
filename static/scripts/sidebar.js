document.addEventListener('DOMContentLoaded', function () {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');

    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('open'); // Toggle sidebar open/close
        container.classList.toggle('shifted'); // Shift container accordingly

        // Optionally, change the hamburger icon when the sidebar is open
        if (sidebar.classList.contains('open')) {
            hamburgerMenu.classList.replace('bx-menu', 'bx-menu');
        }
    });
});


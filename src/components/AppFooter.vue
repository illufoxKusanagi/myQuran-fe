<template>
  <footer class="app-footer">
    <p>
      made with ❤️ by
      <a
        href="https://github.com/illufoxKusanagi"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link"
      >IllufoxKusanagi</a>
    </p>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 0.0625rem solid hsl(var(--border));
  background-color: hsl(var(--card));
  padding: 0.75rem 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.footer-link {
  color: hsl(var(--primary));
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.15s;
}

.footer-link:hover {
  opacity: 0.75;
  text-decoration: underline;
}
</style>

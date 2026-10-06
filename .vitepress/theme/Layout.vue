<script setup lang="ts">
import DefaultTheme from "vitepress/theme";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #layout-bottom>
      <footer class="HMFooter">
        <div class="HMFooter__links">
          <a href="https://henrymeyer.de/legal/imprint">Imprint</a>
          <span aria-hidden="true">•</span>
          <a href="https://henrymeyer.de/code-of-conduct">Code of Conduct</a>
        </div>

        <div class="HMFooter__notices">
          <div>NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.</div>
          <div>© 2026 Henry Meyer.</div>
          <div>Code licensed under MIT • Content under CC BY 4.0 • Icons &amp; Logos All Rights Reserved.</div>
        </div>
      </footer>
    </template>
  </Layout>
</template>

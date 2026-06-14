import { defineConfig } from 'astro/config';

export default defineConfig({
  // Served as a GitHub project page at electroniccats.github.io/RFSAM/.
  // To move to the apex custom domain later: set site to the domain, drop base, restore public/CNAME.
  site: 'https://electroniccats.github.io',
  base: '/RFSAM',
});

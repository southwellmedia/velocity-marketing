# Velocity marketing site

The source of [deployvelocity.com](https://www.deployvelocity.com), the marketing site for [Velocity](https://github.com/southwellmedia/velocity), an Astro 7 starter kit.

Looking for the starter itself? See the [Velocity repo](https://github.com/southwellmedia/velocity), the [documentation](https://docs.deployvelocity.com) or the [CLI](https://github.com/southwellmedia/create-velocity-astro):

```bash
npm create velocity-astro@latest
```

## Development

Requires Node.js 22.23.4 or later (24 LTS recommended) and pnpm 10.

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm validate   # lint, type check and build
```

The site is fully static. Marketing sections live in `src/components/marketing/`, and blog posts in `src/content/blog/`.

## License

MIT

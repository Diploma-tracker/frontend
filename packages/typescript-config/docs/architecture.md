# Presets and inheritance

| Preset               | Responsibility                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `base.json`          | Strict ES2022/bundler defaults, declarations/maps, isolated modules, DOM libraries, JSON modules, `noUncheckedIndexedAccess` |
| `react-library.json` | Base plus `react-jsx` for emit-capable React libraries                                                                       |
| `react-vite.json`    | Base plus Vite types, `noEmit`, React JSX, verbatim module syntax, unused/fallthrough/side-effect checks                     |

Consumers extend package-root paths such as
`@repo/typescript-config/base.json`. The JSON presets are consumed directly;
there is no compilation or runtime API in this package.

# Shared typescript configuration

The purpose of the [typescript](https://www.typescriptlang.org/) is to add strong typing to `javascript`.

> This configuration targets **lib typescript** packages.

---

## Contents

- [Setup](#setup)
- [Donation](#donation)
- [License](#license)

## Setup

- Add workspace reference to `@tsienArron/ts` and its peers dependencies:

  ```sh
  pnpm add -w @tsienArron/ts typescript @types/node
  ```

- Add typescript configuration file

  ```jsonc
  // packages/baz/tsconfig.json

  {
    "extends": "@tsienArron/ts",
    "compilerOptions": {
      "baseUrl": "src",
      "rootDir": "src"
    },
    "include": ["src"]
  }
  ```

## Donation

If you found this project helpful, consider\
[**buying me a coffee**](https://www.buymeacoffee.com/muravjev), [**donate by paypal**](https://www.paypal.me/muravjev) or just [**leave a star**](../../../..)⭐\
Thanks for your support, it is much appreciated!

## License

[MIT](LICENSE) © [Sergey tsienArron](https://github.com/muravjev)

---

[⬅ Back](../../README.md)

---

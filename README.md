# html-playground

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Features

Auto rewrite bare specifier import to esm.sh CDN import.

React & TypeScript are supported out of the box. When write JSX, `React` must be imported.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Demo</title>
    <link rel="stylesheet" href="https://esm.sh/@radix-ui/themes/styles.css" />
    <style>
      body {
        padding: 2rem;
        max-width: 28rem;
        margin: auto;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
  <script type="module">
    import React from "react@19";
    import { createRoot } from "react-dom@19/client";
    import { Theme, Flex, Text, Button } from "@radix-ui/themes?deps=react@19";
    import confetti from "canvas-confetti";

    const showConfetti = () => {
      confetti();
      console.log("Confetti!");
    };

    const App: React.FC = () => (
      <Theme>
        <Flex direction="column" gap="2">
          <Text>Hello from Radix Themes :)</Text>
          <Button onClick={showConfetti}>Let's go</Button>
        </Flex>
      </Theme>
    );
    const root = createRoot(document.getElementById("root"));
    root.render(<App />);
  </script>
</html>
```

## See also

<https://code.esm.sh/>

<https://generator.jspm.io/>

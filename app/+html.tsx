import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Casa Certa</title>
        <meta name="application-name" content="Casa Certa" />
        <meta name="apple-mobile-web-app-title" content="Casa Certa" />
        <meta name="theme-color" content="#05070D" />

        {/* ── Cabeçalhos de segurança via meta tags ── */}
        {/* Bloqueia MIME-type sniffing */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        {/* Não vaza a URL completa como Referer para domínios externos */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        {/* Content Security Policy:
            - default-src 'self' → só carrega recursos do próprio domínio por padrão
            - script-src 'self' 'unsafe-inline' → React Native Web precisa de inline scripts
            - connect-src → permite chamadas ao Firebase/Google APIs
            - style-src 'self' 'unsafe-inline' → estilos inline necessários para RN Web
            - img-src 'self' data: blob: → imagens do próprio domínio + data URLs
            - frame-ancestors 'none' → impede que o site seja embutido em iframes (clickjacking)
        */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://apis.google.com https://www.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
            "img-src 'self' data: blob: https://*.googleusercontent.com",
            "frame-src https://accounts.google.com https://*.firebaseapp.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; ')}
        />

        <link rel="icon" type="image/png" sizes="48x48" href="/aplicativo-de-compras/favicon.ico?v=casa-certa-2" />
        <link rel="shortcut icon" href="/aplicativo-de-compras/favicon.ico?v=casa-certa-2" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;

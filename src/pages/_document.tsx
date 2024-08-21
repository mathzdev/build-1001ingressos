import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <title>TicketKing</title>
            <link rel="icon" href="/fav.png" />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}

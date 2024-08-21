import Modals from '@/components/Modals';
import { poppins } from '@/styles/fonts';
import '@/styles/globals.scss';
import { NextPage } from 'next';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import NextNProgress from 'nextjs-progressbar';
import { ReactElement, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? ((page) => page);

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
            </Head>
            <SessionProvider session={session}>
                <div className={poppins.variable}>
                    {getLayout(<Component {...pageProps} />)}
                </div>
                <ToastContainer theme="colored" />
                {Object.keys(Modals).map((key) => {
                    const Modal = Modals[key as keyof typeof Modals];

                    return <Modal key={key} />;
                })}
            </SessionProvider>
            <NextNProgress color="#ff3fe0" />
        </>
    );
}

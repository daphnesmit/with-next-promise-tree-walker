import { AppProps } from 'next/app'
import { WithPromiseCacheSSR } from 'with-next-promise-tree-walker'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  )
}

export default WithPromiseCacheSSR(MyApp)

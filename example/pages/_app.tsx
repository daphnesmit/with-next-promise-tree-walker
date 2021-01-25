import { AppProps } from 'next/app'
import WithPromiseCacheSSR from '../hoc/withPromiseCacheSSR'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  )
}

export default WithPromiseCacheSSR(MyApp)

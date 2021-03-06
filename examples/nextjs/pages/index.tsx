import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { FormEvent, useState } from 'react';
import { useRef } from 'react';
import { client } from '../engine';

export default function Home() {
  const [data, setResult] = useState<number>();
  const [error, setError] = useState<string>();

  const num1 = useRef<HTMLInputElement>();
  const num2 = useRef<HTMLInputElement>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setResult(undefined);

    const x = parseInt(num1.current.value);
    const y = parseInt(num2.current.value);

    const response = await client.math.divide(x, y);

    if (response.ok) {
      // type narrowing guarantees `response.val` is of type `number`
      // i.e. compiler would error if `response.val` was a `string`
      const quotient: number = response.val;
      setResult(quotient);
    } else {
      console.error(response.stack);
      setError(response.val);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Example Next.js App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Example Next.js App</h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>
        <div>
          <form onSubmit={handleSubmit}>
            <input ref={num1} type="text" style={{ display: 'block' }} />
            <input ref={num2} type="text" style={{ display: 'block' }} />
            <input type="submit" value="Submit" />
          </form>
          <div>{data && `= ${data}`}</div>
          <div style={{ color: 'red' }}>{error && `${error}`}</div>
        </div>
      </main>
    </div>
  );
}

import { client, rpcUrl } from './app'
import fetch from 'cross-fetch'

describe('server error handling', () => {
  it('Test a method that does not exist', async () => {
    // @ts-expect-error: We are destructured a method that does not exist on client
    const { DOES_NOT_EXIST } = client
    const { val, ok, stack } = await DOES_NOT_EXIST('world')

    expect(ok).toEqual(false)
    expect(stack).toBeTruthy()
    expect(val.includes('Method does not exist')).toBeTruthy()
  })

  it('Try a method other than HTTP POST', async () => {
    const { result } = await fetch(rpcUrl, {
      method: 'DELETE',
      body: JSON.stringify({ jsonrpc: '2.0' }),
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.json())

    expect(
      result.val.includes('Invariant failed: Only HTTP POST is supported')
    ).toBe(true)
  })

  it('Try a method prefixed with _', async () => {
    // This is usually a private method to the server
    const result = await client._superSecretMethod()

    expect(result.err).toEqual(true)
  })
})

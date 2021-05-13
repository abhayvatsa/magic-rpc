import { client } from './app'

describe('API', () => {
  it('Test a synchronous method returning non-Result', async () => {
    const { hello } = client
    const { val, ok, stack } = await hello('world')

    expect(ok).toEqual(true)
    expect(stack).toBeFalsy()
    expect(val).toEqual('Hello world!!')
  })

  it('Test an asynchronous method returning non-Result', async () => {
    const { goodbye } = client
    const { val } = await goodbye('abhay')

    expect(val).toEqual('Goodbye abhay!')
  })

  it('Test an asynchronous method return OkImpl', async () => {
    const { getUnixTime } = client
    const { ok, val } = await getUnixTime()

    expect(ok && typeof val === 'number')
  })

  it('Test an asynchronous method returning OkImpl/ErrImpl', async () => {
    const { getPeople } = client
    const result = await getPeople()

    expect(
      (result.err && result.val === 'ahh!') ||
        (result.ok && result.val.length === 3)
    ).toEqual(true)
  })

  it('Test an asynchronous method returning Result', async () => {
    const { divide } = client
    const { ok, val, stack } = await divide(10, 0)

    expect(ok).toEqual(false)
    expect(val === 'Divided by zero').toBeTruthy()
    expect(stack).toBeTruthy()
  })
})

import { wrapInClient, Client } from './app'

describe('typechecking', () => {
  it.concurrent(
    "Ensure we don't leak stack traces in production",
    wrapInClient(async function ({ divide }: Client) {
      const temp = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      const result = await divide(10, 0)
      process.env.NODE_ENV = temp

      expect(result.ok).toEqual(false)
      if (!result.ok) {
        // Expect stack to be empty
        expect((result as any)._stack === '').toBeTruthy()
      }
    })
  )
})

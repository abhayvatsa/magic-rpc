import { client } from './app'

describe('typechecking', () => {
  it('type narrowing works correctly', async () => {
    const { divide } = client
    const result = await divide(10, 0)

    if (result.ok) {
      const quotient: number = result.val // tsc throws error if type narrowing isn't working

      expect(typeof quotient === 'number').toBeTruthy() // Runtime check
    }
  })
})

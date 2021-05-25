import { assert, IsExact } from 'conditional-type-checks'
import { RPCError } from '../'
import { client } from './app'

describe('typechecking', () => {
  it('type narrowing works correctly', async () => {
    const { divide } = client
    const result = await divide(10, 0)

    if (result.ok) {
      assert<IsExact<typeof result.val, number>>(true)
    } else {
      assert<IsExact<typeof result.val, 'Divided by zero' | RPCError>>(true)
    }
  })
})

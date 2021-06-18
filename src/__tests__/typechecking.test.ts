import { assert, IsExact } from 'conditional-type-checks'
import { RPCError } from '../'
import { createRpc } from './app'

describe('typechecking', () => {
  it.concurrent('type narrowing works correctly', async () => {
    const rpc = await createRpc()
    const result = await rpc.client.divide(10, 0)

    if (result.ok) {
      assert<IsExact<typeof result.val, number>>(true)
    } else {
      assert<IsExact<typeof result.val, 'Divided by zero' | RPCError>>(true)
    }

    rpc.teardown()
  })
})

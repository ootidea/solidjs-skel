import { createSignal } from 'solid-js'
import { Await } from '../../src/Await'
import { Button } from '../../src/Button'
import { Spinner } from '../../src/Spinner'
import { Catalog } from './ComponentCatalog'

const [promise, setPromise] = createSignal(
  new Promise((resolve) => {
    setTimeout(resolve, 2000)
  })
)

export const AwaitCatalog: Catalog = {
  samples: [
    {
      title: 'Basic example',
      children: (
        <>
          <Await
            promise={
              new Promise((resolve) => {
                setTimeout(resolve, 2000)
              })
            }
            loading={<Spinner />}
          >
            <p>resolved</p>
          </Await>
        </>
      ),
    },
    {
      title: 'Catch error',
      children: (
        <>
          <Await
            promise={
              new Promise((_, reject) => {
                setTimeout(reject, 5000)
              })
            }
            loading={<Spinner />}
            catch="🤔 An error occurred."
          />
        </>
      ),
    },
    {
      title: 'Reassign promise',
      children: (
        <>
          <Await promise={promise()} loading={<p>loading</p>}>
            <p>resolved</p>
          </Await>
          <Button
            onClick={() =>
              setPromise(
                new Promise((resolve) => {
                  setTimeout(resolve, 2000)
                })
              )
            }
          >
            Refresh
          </Button>
        </>
      ),
    },
  ],
}

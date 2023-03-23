import { StretchLayout } from '../../src/StretchLayout'
import { Catalog } from './ComponentCatalog'

export const StretchLayoutCatalog: Catalog = {
  samples: [
    {
      title: 'Basic example',
      children: (
        <>
          <StretchLayout>
            <div style={{ padding: '3em', border: '1px solid gray' }}>Flexible area</div>
            <div style={{ padding: '3em', border: '1px dashed gray' }}>Fixed area</div>
          </StretchLayout>
        </>
      ),
    },
    {
      title: 'Negative index',
      children: (
        <>
          <StretchLayout stretchAt={-1}>
            <div style={{ padding: '3em', border: '1px dashed gray' }}>Fixed area</div>
            <div style={{ padding: '3em', border: '1px dashed gray' }}>Fixed area</div>
            <div style={{ padding: '3em', border: '1px solid gray' }}>Flexible area</div>
          </StretchLayout>
        </>
      ),
    },
  ],
}

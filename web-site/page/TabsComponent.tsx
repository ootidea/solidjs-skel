import { Tabs } from '../../src/Tabs'
import { showToast } from '../../src/Toasts'
import { Catalog } from './ComponentCatalog'

export const TabsCatalog: Catalog = {
  samples: [
    {
      title: 'Basic example',
      children: (
        <>
          <Tabs names={['tab1', 'tab2', 'tab3']}>{({ activeTab }) => <div style="padding: 2em">{activeTab}</div>}</Tabs>
          <Tabs type="Surrounded by border" names={['tab1', 'tab2', 'tab3']}>
            {({ activeTab }) => <div style="padding: 2em">{activeTab}</div>}
          </Tabs>
          <Tabs type="Active underline" names={['tab1', 'tab2', 'tab3']}>
            {({ activeTab }) => <div style="padding: 2em">{activeTab}</div>}
          </Tabs>
        </>
      ),
    },
    {
      title: 'Default tab',
      children: (
        <>
          <Tabs names={['tab1', 'tab2', 'tab3']} activeTab="tab2">
            {({ activeTab }) => <div style="padding: 2em">{activeTab}</div>}
          </Tabs>
        </>
      ),
    },
    {
      title: 'Passive',
      description: 'If the passive flag is set, tab clicks will not change the active tab.',
      children: (
        <>
          <Tabs passive names={['tab1', 'tab2', 'tab3']} onClickTab={(tabName) => showToast('success', tabName)}></Tabs>
        </>
      ),
    },
  ],
}

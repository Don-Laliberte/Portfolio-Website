export type Endorsement = {
  id: string
  name: string
  url: string
  /**
   * Optional manual override for the icon. When unset, `EndorsementsSection`
   * rips the favicon from the target host via Google's favicon service.
   */
  iconSrc?: string
}

export const ENDORSEMENTS: Endorsement[] = [
  // Add entries here, e.g.:
  // { id: 'jane-doe', name: 'Jane Doe', url: 'https://janedoe.dev' },
  {id: '0xhckr', name: '0xhckr', url: 'https://0xhckr.dev'},
  {id: 'Essam', name: 'Essam Khawaja', url: 'https://www.essamk.dev'},
]

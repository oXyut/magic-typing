import styles from './LegalFooter.module.css'

export function LegalFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        Card data provided by{' '}
        <a href="https://scryfall.com" target="_blank" rel="noopener noreferrer">
          Scryfall
        </a>
      </p>
      <p>
        Magic: The Gathering is property of Wizards of the Coast LLC.
        This is unofficial Fan Content under the{' '}
        <a
          href="https://company.wizards.com/en/legal/fancontentpolicy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fan Content Policy
        </a>
        . Not approved/endorsed by Wizards.
      </p>
    </footer>
  )
}

import { Spinner, Text, makeStyles, tokens } from '@fluentui/react-components';
import { AppGrid } from '../components/AppGrid';
import { useApps } from '../hooks/useApps';

const useStyles = makeStyles({
  root: {
    padding: '24px',
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '8px',
    display: 'block',
  },
  subtitle: {
    color: tokens.colorNeutralForeground2,
    marginBottom: '24px',
    display: 'block',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  empty: {
    color: tokens.colorNeutralForeground2,
  },
});

export const AppPortal: React.FunctionComponent = () => {
  const styles = useStyles();
  const { data: apps, isLoading, isError } = useApps();

  return (
    <div className={styles.root}>
      <Text as="h1" className={styles.title}>
        Meine Applikationen
      </Text>
      <Text className={styles.subtitle}>
        Alle Applikationen, auf die du Zugriff hast.
      </Text>

      {isLoading && (
        <div className={styles.center}>
          <Spinner label="Applikationen werden geladen…" />
        </div>
      )}

      {isError && (
        <div className={styles.center}>
          <Text className={styles.empty}>
            Fehler beim Laden der Applikationen. Bitte versuche es erneut.
          </Text>
        </div>
      )}

      {!isLoading && !isError && apps && apps.length === 0 && (
        <div className={styles.center}>
          <Text className={styles.empty}>
            Dir sind noch keine Applikationen zugewiesen.
          </Text>
        </div>
      )}

      {!isLoading && !isError && apps && apps.length > 0 && <AppGrid apps={apps} />}
    </div>
  );
};

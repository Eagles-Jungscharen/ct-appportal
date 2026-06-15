import { makeStyles, tokens, Button, Text } from '@fluentui/react-components';
import { LockClosedRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
    textAlign: 'center',
    padding: '24px',
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorStatusDangerForeground1,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  subtitle: {
    color: tokens.colorNeutralForeground2,
  },
}); 

export const Unauthorized: React.FunctionComponent = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <LockClosedRegular className={styles.icon} />
      <Text as="h1" className={styles.title}>
        Kein Zugriff
      </Text>
      <Text className={styles.subtitle}>
        Du verfügst nicht über die erforderlichen Berechtigungen, um diese Seite aufzurufen.
      </Text>
      <Button appearance="primary" onClick={() => navigate('/')}>
        Zur Startseite
      </Button>
    </div>
  );
};

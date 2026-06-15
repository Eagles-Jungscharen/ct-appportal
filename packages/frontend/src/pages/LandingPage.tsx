import { makeStyles, tokens, Button, Text, Card } from '@fluentui/react-components';
import { AppsRegular, GridRegular, ShieldRegular, ArrowRightRegular } from '@fluentui/react-icons';
import { useAppAuth } from '../hooks/useAppAuth';
import { ORGANIZATION_NAME, APP_PORTAL_TITLE } from '../config/api';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px 64px',
    textAlign: 'center',
    gap: '24px',
    background: `linear-gradient(135deg, ${tokens.colorBrandBackground2} 0%, ${tokens.colorNeutralBackground1} 100%)`,
  },
  heroIcon: {
    fontSize: '64px',
    color: tokens.colorBrandForeground1,
  },
  heroTitle: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    lineHeight: '1.2',
  },
  heroTagline: {
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground2,
    maxWidth: '520px',
  },
  loginButton: {
    paddingLeft: '28px',
    paddingRight: '28px',
    height: '44px',
    fontSize: tokens.fontSizeBase400,
  },
  features: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    padding: '48px 24px 64px',
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '28px',
    width: '320px',
    flexShrink: '0',
  },
  featureIcon: {
    fontSize: '32px',
    color: tokens.colorBrandForeground1,
  },
  featureTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  featureDescription: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.5',
  },
});

export const LandingPage: React.FunctionComponent = () => {
  const styles = useStyles();
  const { login } = useAppAuth();

  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <AppsRegular className={styles.heroIcon} />
        <Text as="h1" className={styles.heroTitle}>
          {APP_PORTAL_TITLE}
        </Text>
        <Text className={styles.heroTagline}>
          Dein zentraler Einstiegspunkt für alle Applikationen der {ORGANIZATION_NAME}.
          Melde dich an, um auf deine persönlichen Apps zuzugreifen.
        </Text>
        <Button
          appearance="primary"
          size="large"
          icon={<ArrowRightRegular />}
          iconPosition="after"
          className={styles.loginButton}
          onClick={() => login()}
        >
          Anmelden
        </Button>
      </section>

      <section className={styles.features}>
        <Card className={styles.featureCard}>
          <GridRegular className={styles.featureIcon} />
          <Text className={styles.featureTitle}>Meine Apps</Text>
          <Text className={styles.featureDescription}>
            Alle Applikationen auf einen Blick — genau die, auf die du Zugriff hast.
            Schneller Einstieg ohne Suche.
          </Text>
        </Card>

        <Card className={styles.featureCard}>
          <ShieldRegular className={styles.featureIcon} />
          <Text className={styles.featureTitle}>Administration</Text>
          <Text className={styles.featureDescription}>
            Admins können Apps registrieren, Rollen und Gruppen zuweisen sowie
            OAuth2-Clients beim Churchtool IDP verwalten.
          </Text>
        </Card>
      </section>
    </div>
  );
};

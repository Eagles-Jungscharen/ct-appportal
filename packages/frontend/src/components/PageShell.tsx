import { Avatar, Button, makeStyles, Text, tokens } from '@fluentui/react-components';
import { ShieldPersonRegular, SignOutRegular } from '@fluentui/react-icons';
import { Link, useLocation } from 'react-router-dom';
import { useAppAuth } from '../hooks/useAppAuth';

const useStyles = makeStyles({
  shell: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '56px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForegroundOnBrand,
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    gap: '4px',
  },
  navLink: {
    padding: '4px 12px',
    borderRadius: tokens.borderRadiusMedium,
    textDecoration: 'none',
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: tokens.fontSizeBase300,
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },
  navLinkActive: {
    backgroundColor: tokens.colorBrandBackgroundPressed,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  displayName: {
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: tokens.fontSizeBase300,
  },
  main: {
    flex: 1,
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

export const PageShell: React.FunctionComponent<React.PropsWithChildren> = (props: React.PropsWithChildren) => {
  const styles = useStyles();
  const { isAdmin, displayName, logout } = useAppAuth();
  const location = useLocation();
  const { children } = props;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.logo}>
            App Portal
          </Link>
          <nav className={styles.nav}>
            <Link
              to="/"
              className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`}
            >
              Meine Apps
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`${styles.navLink} ${location.pathname.startsWith('/admin') ? styles.navLinkActive : ''}`}
              >
                <ShieldPersonRegular style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className={styles.headerRight}>
          <Avatar name={displayName} size={28} />
          <Text className={styles.displayName}>{displayName}</Text>
          <Button
            appearance="transparent"
            icon={<SignOutRegular />}
            onClick={logout}
            style={{ color: 'white' }}
          >
            Abmelden
          </Button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

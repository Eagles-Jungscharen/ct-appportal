import { makeStyles } from '@fluentui/react-components';
import type { AppDto } from '../api/types';
import { AppCard } from './AppCard';

const useStyles = makeStyles({
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px 0',
  },
});

interface AppGridProps {
  apps: AppDto[];
}

export const AppGrid: React.FunctionComponent<AppGridProps> = (props: AppGridProps) => {
  const { apps } = props;
  const styles = useStyles();

  return (
    <div className={styles.grid}>
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
};

import {
  Body1,
  Button,
  Combobox,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  makeStyles,
  Option,
  OverlayDrawer,
  Spinner,
  Tag,
  TagGroup,
  Text,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular, SaveRegular } from '@fluentui/react-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { assignGroups } from '../../api/assignments';
import type { AppDto, GroupDto } from '../../api/types';
import { useAppAssignments } from '../../hooks/useAppAssignments';
import { useAppAuth } from '../../hooks/useAppAuth';
import { useGroups } from '../../hooks/useGroups';

const useStyles = makeStyles({
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '16px',
  },
  tagRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    paddingTop: '16px',
  },
  success: {
    color: tokens.colorStatusSuccessForeground1,
  },
  error: {
    color: tokens.colorStatusDangerForeground1,
  },
});

interface AppAssignmentPanelProps {
  app: AppDto
  onClose: () => void
}

export const AppAssignmentPanel: React.FunctionComponent<AppAssignmentPanelProps> = (props: AppAssignmentPanelProps) => {
  const { app, onClose } = props;
  const styles = useStyles();
  const { token } = useAppAuth();
  const queryClient = useQueryClient();

  const [prevExistingGroupIds, setPrevExistingGroupIds] = useState<string[]>([]);
  const { data: allGroups = [], isLoading: loadingGroups } = useGroups();
  const { data: existingGroupIds = [], isLoading: loadingAssignments } = useAppAssignments(app.id);

  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [comboValue, setComboValue] = useState('');

  if (!loadingAssignments && JSON.stringify(existingGroupIds) !== JSON.stringify(prevExistingGroupIds)) {
    setGroupIds(existingGroupIds);
    setPrevExistingGroupIds(existingGroupIds);
  }

  const groupById = new Map<string, GroupDto>(allGroups.map((g) => [g.id, g]));
  const availableGroups = allGroups.filter((g) => !groupIds.includes(g.id));
  const filteredGroups = availableGroups.filter((g) =>
    g.title.toLowerCase().includes(comboValue.toLowerCase()),
  );

  const mutation = useMutation({
    mutationFn: () => assignGroups(token!, app.id, { appId: app.id, groupIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'apps'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'assignments', app.id] });
    },
  });

  const isLoading = loadingGroups || loadingAssignments;

  return (
    <OverlayDrawer open position="end" onOpenChange={(_, d) => !d.open && onClose()} size="medium">
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button appearance="subtle" icon={<DismissRegular />} onClick={onClose} />
          }
        >
          Zuweisungen: {app.name}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <div className={styles.body}>
          {isLoading ? (
            <Spinner label="Daten werden geladen…" />
          ) : (
            <>
              <Body1>
                Gruppen auswählen, die Zugriff auf <strong>{app.name}</strong> erhalten sollen.
              </Body1>

              <Field label="Zugewiesene Gruppen">
                <div className={styles.tagRow}>
                  {groupIds.length > 0 ? (
                    <TagGroup
                      onDismiss={(_, d) =>
                        setGroupIds((p) => p.filter((id) => id !== d.value))
                      }
                      className={styles.tags}
                    >
                      {groupIds.map((id) => (
                        <Tag key={id} value={id} dismissible>
                          {groupById.get(id)?.title ?? id}
                        </Tag>
                      ))}
                    </TagGroup>
                  ) : (
                    <Text size={200} italic>
                      Keine Gruppen zugewiesen
                    </Text>
                  )}
                </div>
              </Field>

              <Field label="Gruppe hinzufügen">
                <Combobox
                  placeholder="Gruppe suchen…"
                  value={comboValue}
                  onChange={(e) => setComboValue(e.target.value)}
                  onOptionSelect={(_, d) => {
                    if (d.optionValue && !groupIds.includes(d.optionValue)) {
                      setGroupIds((p) => [...p, d.optionValue!]);
                    }
                    setComboValue('');
                  }}
                >
                  {filteredGroups.map((g) => (
                    <Option key={g.id} value={g.id} text={g.title}>
                      {g.title}
                    </Option>
                  ))}
                </Combobox>
              </Field>

              {mutation.isSuccess && (
                <Text className={styles.success}>Zuweisungen erfolgreich gespeichert.</Text>
              )}
              {mutation.isError && (
                <Text className={styles.error}>Fehler beim Speichern der Zuweisungen.</Text>
              )}

              <div className={styles.actions}>
                <Button appearance="secondary" onClick={onClose}>
                  Abbrechen
                </Button>
                <Button
                  appearance="primary"
                  icon={mutation.isPending ? <Spinner size="tiny" /> : <SaveRegular />}
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                >
                  Speichern
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerBody>
    </OverlayDrawer>
  );
};

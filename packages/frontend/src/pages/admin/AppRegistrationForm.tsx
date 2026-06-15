import { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Field,
  Input,
  Textarea,
  makeStyles,
  tokens,
  Tag,
  TagGroup,
} from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { useCreateApp, useUpdateApp } from '../../hooks/useAdminApps';
import type { AppDto, CreateUpdateAppData } from '../../api/types';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tagRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  error: {
    color: tokens.colorStatusDangerForeground1,
    fontSize: tokens.fontSizeBase200,
  },
});

interface AppRegistrationFormProps {
  app?: AppDto;
  onClose: () => void;
}

export const AppRegistrationForm: React.FunctionComponent<AppRegistrationFormProps> = (props: AppRegistrationFormProps) => {
  const { app, onClose } = props;
  const styles = useStyles();
  const isEdit = !!app;

  const [name, setName] = useState(app?.name ?? '');
  const [description, setDescription] = useState(app?.description ?? '');
  const [url, setUrl] = useState(app?.url ?? '');
  const [redirectUris, setRedirectUris] = useState<string[]>(app?.redirectUris ?? []);
  const [newUri, setNewUri] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createApp = useCreateApp();
  const updateApp = useUpdateApp();
  const isPending = createApp.isPending || updateApp.isPending; 

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name ist erforderlich.';
    if (!url.trim()) e.url = 'URL ist erforderlich.';
    else {
      try {
        new URL(url);
      } catch {
        e.url = 'Ungültige URL.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAddUri() {
    const trimmed = newUri.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      setRedirectUris((prev) => [...prev, trimmed]);
      setNewUri('');
    } catch {
      // ignore invalid URIs
    }
  }

  function handleRemoveUri(uri: string) {
    setRedirectUris((prev) => prev.filter((u) => u !== uri));
  }

  function handleSubmit() {
    if (!validate()) return;
    const data: CreateUpdateAppData = {
      name: name.trim(),
      description: description.trim() || undefined,
      url: url.trim(),
      redirectUris,
    };
    if (isEdit && app) {
      updateApp.mutate({ id: app.id, data }, { onSuccess: onClose });
    } else {
      createApp.mutate(data, { onSuccess: onClose });
    }
  }

  return (
    <Dialog open onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{isEdit ? 'Applikation bearbeiten' : 'Neue Applikation'}</DialogTitle>
          <DialogContent>
            <div className={styles.form}>
              <Field label="Name *" validationMessage={errors.name} validationState={errors.name ? 'error' : 'none'}>
                <Input value={name} onChange={(_, d) => setName(d.value)} />
              </Field>
              <Field label="Beschreibung">
                <Textarea value={description} onChange={(_, d) => setDescription(d.value)} />
              </Field>
              <Field label="URL *" validationMessage={errors.url} validationState={errors.url ? 'error' : 'none'}>
                <Input value={url} onChange={(_, d) => setUrl(d.value)} placeholder="https://…" />
              </Field>

              <Field label="Redirect-URIs">
                <div className={styles.tagRow}>
                  {redirectUris.length > 0 && (
                    <TagGroup onDismiss={(_, d) => handleRemoveUri(d.value as string)}>
                      {redirectUris.map((uri) => (
                        <Tag key={uri} value={uri} dismissible>
                          {uri}
                        </Tag>
                      ))}
                    </TagGroup>
                  )}
                  <Input
                    value={newUri}
                    onChange={(_, d) => setNewUri(d.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUri()}
                    placeholder="https://… Enter"
                    size="small"
                  />
                  <Button icon={<AddRegular />} size="small" onClick={handleAddUri} />
                </div>
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} disabled={isPending}>
              Abbrechen
            </Button>
            <Button appearance="primary" onClick={handleSubmit} disabled={isPending}>
              {isEdit ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

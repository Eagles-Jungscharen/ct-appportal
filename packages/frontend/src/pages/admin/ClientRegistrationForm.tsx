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
  Tag,
  TagGroup,
  makeStyles,
  tokens,
  Text,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
} from '@fluentui/react-components';
import { AddRegular, CopyRegular } from '@fluentui/react-icons';
import { useClientRegistration } from '../../hooks/useClientRegistration';
import { useUpdateClient } from '../../hooks/useClients';
import type { ClientDto, ClientRegistrationResultDto } from '../../api/types';

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
  idBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '8px 12px',
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
});

interface ClientRegistrationFormProps {
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialValues?: ClientDto;
}

export const ClientRegistrationForm: React.FunctionComponent<ClientRegistrationFormProps> = (props: ClientRegistrationFormProps) => {
  const { onClose, mode = 'create', initialValues } = props;
  const styles = useStyles();

  const [name, setName] = useState(initialValues?.name ?? '');
  const [redirectUris, setRedirectUris] = useState<string[]>(initialValues?.redirectUris ?? []);
  const [newUri, setNewUri] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ClientRegistrationResultDto | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: create, isPending: isCreating } = useClientRegistration();
  const { mutate: update, isPending: isUpdating } = useUpdateClient();
  const isPending = isCreating || isUpdating;

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name ist erforderlich.';
    if (redirectUris.length === 0) e.redirectUris = 'Mindestens eine Redirect-URI ist erforderlich.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function addUri() {
    const t = newUri.trim();
    if (!t) return;
    try {
      new URL(t);
      setRedirectUris((p) => [...p, t]);
      setNewUri('');
    } catch {
      // ungültige URL ignorieren
    }
  }

  function handleSubmit() {
    if (!validate()) return;

    if (mode === 'edit' && initialValues) {
      update(
        { clientId: initialValues.clientId, data: { name: name.trim(), redirectUris } },
        { onSuccess: () => onClose() },
      );
    } else {
      create(
        { name: name.trim(), redirectUris },
        { onSuccess: (data) => setResult(data) },
      );
    }
  }

  function copyClientId() {
    if (!result) return;
    navigator.clipboard.writeText(result.clientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const title = mode === 'edit' ? 'OAuth2-Client bearbeiten' : 'OAuth2-Client registrieren';

  return (
    <Dialog open onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            {result ? (
              <div className={styles.form}>
                <MessageBar intent="success">
                  <MessageBarBody>
                    <MessageBarTitle>Client erfolgreich registriert</MessageBarTitle>
                  </MessageBarBody>
                </MessageBar>
                <Field label="Client-ID">
                  <div className={styles.idBox}>
                    <span style={{ flex: 1 }}>{result.clientId}</span>
                    <Button
                      icon={<CopyRegular />}
                      size="small"
                      appearance="transparent"
                      onClick={copyClientId}
                    >
                      {copied ? 'Kopiert!' : 'Kopieren'}
                    </Button>
                  </div>
                </Field>
              </div>
            ) : (
              <div className={styles.form}>
                <Field
                  label="Name *"
                  validationMessage={errors.name}
                  validationState={errors.name ? 'error' : 'none'}
                >
                  <Input value={name} onChange={(_, d) => setName(d.value)} />
                </Field>
                <Field
                  label="Redirect-URIs *"
                  validationMessage={errors.redirectUris}
                  validationState={errors.redirectUris ? 'error' : 'none'}
                >
                  <div className={styles.tagRow}>
                    {redirectUris.length > 0 && (
                      <TagGroup
                        onDismiss={(_, d) =>
                          setRedirectUris((p) => p.filter((u) => u !== d.value))
                        }
                      >
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
                      onKeyDown={(e) => e.key === 'Enter' && addUri()}
                      placeholder="https://… Enter"
                      size="small"
                    />
                    <Button icon={<AddRegular />} size="small" onClick={addUri} />
                  </div>
                </Field>
                {mode === 'edit' && initialValues && (
                  <Field label="Owner">
                    <Text>{initialValues.owner}</Text>
                  </Field>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              {result ? 'Schliessen' : 'Abbrechen'}
            </Button>
            {!result && (
              <Button
                appearance="primary"
                onClick={handleSubmit}
                disabled={isPending}
                icon={isPending ? <Spinner size="tiny" /> : undefined}
              >
                {mode === 'edit' ? 'Speichern' : 'Registrieren'}
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

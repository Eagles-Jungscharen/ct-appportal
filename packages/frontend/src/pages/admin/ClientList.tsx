import { useState } from 'react';
import {
  DataGrid,
  DataGridHeader,
  DataGridRow,
  DataGridHeaderCell,
  DataGridBody,
  DataGridCell,
  type TableColumnDefinition,
  createTableColumn,
  Button,
  Spinner,
  Text,
  makeStyles,
  tokens,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Tooltip,
} from '@fluentui/react-components';
import { EditRegular, DeleteRegular } from '@fluentui/react-icons';
import { useClients, useDeleteClient } from '../../hooks/useClients';
import { ClientRegistrationForm } from './ClientRegistrationForm';
import type { ClientDto } from '../../api/types';

const useStyles = makeStyles({
  root: { padding: '24px' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  actions: { display: 'flex', gap: '8px' },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  uriList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
});

const columns: TableColumnDefinition<ClientDto>[] = [
  createTableColumn<ClientDto>({
    columnId: 'name',
    renderHeaderCell: () => 'Name',
    renderCell: (item) => item.name,
  }),
  createTableColumn<ClientDto>({
    columnId: 'clientId',
    renderHeaderCell: () => 'Client ID',
    renderCell: (item) => (
      <Text font="monospace" size={200}>
        {item.clientId}
      </Text>
    ),
  }),
  createTableColumn<ClientDto>({
    columnId: 'owner',
    renderHeaderCell: () => 'Owner',
    renderCell: (item) => item.owner,
  }),
  createTableColumn<ClientDto>({
    columnId: 'redirectUris',
    renderHeaderCell: () => 'Redirect URIs',
    renderCell: (item) => item.redirectUris.join(', ') || '—',
  }),
];

export const ClientList: React.FunctionComponent = () => {
  const styles = useStyles();
  const { data: clients, isLoading, isError } = useClients();
  const deleteClient = useDeleteClient();

  const [editClient, setEditClient] = useState<ClientDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientDto | null>(null);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner label="Clients werden geladen…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.center}>
        <Text>Fehler beim Laden der OAuth2-Clients.</Text>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Text as="h1" className={styles.title}>
          OAuth2-Clients verwalten
        </Text>
      </div>

      <DataGrid items={clients ?? []} columns={columns} getRowId={(item) => item.clientId}>
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<ClientDto>>
          {({ item, rowId }) => (
            <DataGridRow<ClientDto> key={rowId}>
              {({ renderCell, columnId }) => (
                <DataGridCell>
                  {columnId === 'name' ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {renderCell(item)}
                      <div className={styles.actions}>
                        <Tooltip content="Bearbeiten" relationship="label">
                          <Button
                            icon={<EditRegular />}
                            appearance="transparent"
                            size="small"
                            onClick={() => setEditClient(item)}
                          />
                        </Tooltip>
                        <Tooltip content="Löschen" relationship="label">
                          <Button
                            icon={<DeleteRegular />}
                            appearance="transparent"
                            size="small"
                            onClick={() => setDeleteTarget(item)}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  ) : (
                    renderCell(item)
                  )}
                </DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>

      {/* Edit Form */}
      {editClient && (
        <ClientRegistrationForm
          mode="edit"
          initialValues={editClient}
          onClose={() => setEditClient(null)}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(_, d) => !d.open && setDeleteTarget(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Client löschen</DialogTitle>
            <DialogContent>
              Soll der Client «{deleteTarget?.name}» wirklich gelöscht werden? Diese Aktion kann
              nicht rückgängig gemacht werden.
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Abbrechen</Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={() => {
                  if (deleteTarget) {
                    deleteClient.mutate(deleteTarget.clientId, {
                      onSuccess: () => setDeleteTarget(null),
                    });
                  }
                }}
                disabled={deleteClient.isPending}
                icon={deleteClient.isPending ? <Spinner size="tiny" /> : undefined}
              >
                Löschen
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

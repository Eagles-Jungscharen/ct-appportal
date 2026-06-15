import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ImageRegular } from '@fluentui/react-icons';
import { useUploadAppIcon } from '../../hooks/useAdminApps';
import type { AppDto } from '../../api/types';

const useStyles = makeStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingTop: '8px',
  },
  previewWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '96px',
    height: '96px',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px dashed ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  previewImage: {
    width: '88px',
    height: '88px',
    objectFit: 'contain',
    borderRadius: tokens.borderRadiusMedium,
  },
  previewPlaceholderIcon: {
    fontSize: '32px',
    color: tokens.colorNeutralForeground4,
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
});

interface IconUploadDialogProps {
  app: AppDto | null;
  onClose: () => void;
}

export const IconUploadDialog: React.FunctionComponent<IconUploadDialogProps> = (props: IconUploadDialogProps) => {
  const { app, onClose } = props;
  const styles = useStyles();
  const uploadIcon = useUploadAppIcon();

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref hält die aktive Blob-URL für sicheres Revoke beim Unmount
  const activePreviewUrl = useRef<string | undefined>(undefined);

  // Beim Unmount aktive Preview-URL freigeben
  useEffect(() => {
    return () => {
      if (activePreviewUrl.current) {
        URL.revokeObjectURL(activePreviewUrl.current);
      }
    };
  }, []);

  const handleFileChange = (file: File | null) => {
    // Alte Preview-URL freigeben bevor neue gesetzt wird
    if (activePreviewUrl.current) {
      URL.revokeObjectURL(activePreviewUrl.current);
    }
    const newUrl = file ? URL.createObjectURL(file) : undefined;
    activePreviewUrl.current = newUrl;
    setIconFile(file);
    setPreviewUrl(newUrl);
  };

  const handleClose = () => {
    handleFileChange(null);
    onClose();
  };

  return (
    <Dialog open={!!app} onOpenChange={(_, d) => { if (!d.open) handleClose(); }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Icon hochladen für «{app?.name}»</DialogTitle>
          <DialogContent>
            <div className={styles.content}>
              {/* Icon-Vorschau */}
              <div className={styles.previewWrapper}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Icon-Vorschau" className={styles.previewImage} />
                ) : (
                  <ImageRegular className={styles.previewPlaceholderIcon} />
                )}
              </div>

              {/* Dateiauswahl */}
              <div className={styles.fileRow}>
                <Button
                  appearance="secondary"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Datei auswählen
                </Button>
                {iconFile && <Text size={200}>{iconFile.name}</Text>}
              </div>

              <Text size={200} className={styles.hint}>
                Erlaubte Formate: PNG, JPEG, SVG, WebP — max. 512 KB
              </Text>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={handleClose}
              disabled={uploadIcon.isPending}
            >
              Abbrechen
            </Button>
            <Button
              appearance="primary"
              disabled={!iconFile || uploadIcon.isPending}
              onClick={() => {
                if (app && iconFile) {
                  uploadIcon.mutate(
                    { appId: app.id, file: iconFile },
                    { onSuccess: handleClose }
                  );
                }
              }}
            >
              Hochladen
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

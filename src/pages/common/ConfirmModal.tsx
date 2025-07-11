import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  children?: React.ReactNode;
}

const typeConfig = {
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-500',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
};

export function ConfirmModal({
  open,
  onOpenChange,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn('w-5 h-5', config.iconColor)} />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming || loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || loading}
            className={cn(
              'text-white',
              config.buttonColor
            )}
          >
            {isConfirming || loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
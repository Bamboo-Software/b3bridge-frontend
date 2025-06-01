import { Modal, ModalProps } from "antd";
import React, { FC } from "react";
import "./index.css";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
export interface ModalAntdProps extends ModalProps {
  showCloseIcon?: boolean;
}

const ModalAntd: FC<ModalAntdProps> = ({ showCloseIcon = true, ...props }) => {
  return (
    <Modal
      footer={null}
      closeIcon={null}
      centered
      classNames={{
        ...props.classNames,
        content: cn(
          "",
          props.classNames?.content
        ),
      }}
      {...props}
    >
      {showCloseIcon && (
        <div
          onClick={(e: any) => props?.onCancel?.(e)}
          className={cn(
            "absolute right-[8px] top-[8px] md:right-[16px] md:top-[16px] opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            "border-solid border-[1px] border-border p-[6px] cursor-pointer"
          )}
        >
          <X className="w-4 h-4" />
        </div>
      )}
      {props?.children}
    </Modal>
  );
};

export default ModalAntd;

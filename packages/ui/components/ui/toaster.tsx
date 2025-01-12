import { useToast } from "../../hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"
import { cn } from "../../lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, danger, ...props }) {
        return (
          <Toast key={id} {...props} className={cn("border-0", danger ? "bg-rose-500 text-white" : "")}>
            <div className="grid gap-1">
              {title && <ToastTitle className="text-lg">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

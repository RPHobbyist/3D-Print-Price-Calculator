import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface FormFieldProps {
  label: string;
  required?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}

export const FormFieldRow = memo(({ label, required, highlight, children }: FormFieldProps) => (
  <div className={`grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 py-3 px-2 sm:px-4 items-start sm:items-center border-b border-border/50 hover:bg-muted/30 transition-colors ${highlight ? 'bg-accent/5' : ''}`}>
    <div className="font-medium text-sm sm:text-base">
      {label} {required && <span className="text-destructive">*</span>}
    </div>
    <div>{children}</div>
  </div>
));

FormFieldRow.displayName = "FormFieldRow";

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  step?: string;
  className?: string;
  endAdornment?: React.ReactNode;
}

export const TextField = memo(({ value, onChange, placeholder, type = "text", step, className, endAdornment }: TextFieldProps) => (
  <div className="relative flex items-center w-full">
    <Input
      type={type}
      step={step}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-background border-input focus:ring-2 focus:ring-primary/20 w-full ${endAdornment ? 'pr-20' : ''} ${className || ''}`}
    />
    {endAdornment && (
      <div className="absolute right-1 top-1/2 -translate-y-1/2">
        {endAdornment}
      </div>
    )}
  </div>
));

TextField.displayName = "TextField";

interface SelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: SelectOption[];
}

export const SelectField = memo(({ value, onChange, placeholder, options }: SelectFieldProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="bg-background">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="bg-popover border-border z-50">
      {options.map((option) => (
        <SelectItem key={option.id} value={option.id}>
          {option.label}
          {option.sublabel && <span className="text-muted-foreground ml-1">({option.sublabel})</span>}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
));

SelectField.displayName = "SelectField";
